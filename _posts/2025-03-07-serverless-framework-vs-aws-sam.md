---
title: Notes on Migrating from Serverless Framework to AWS SAM
tags: 
 - aws
 - lambda
---

With Serverless Framework v3 now end-of-life, and [v4 requiring a paid license](https://www.serverless.com/framework/docs/guides/upgrading-v4), we've started migrating around 100 Serverless Framework projects to use [AWS Serverless Application Model](https://aws.amazon.com/serverless/sam/) (SAM). Since we aren't using any of the SaaS features of Serverless Framework, it is to us (at a basic level) just a convenience wrapper around CloudFormation, with built in tooling to package lambdas in a variety of languages. Which is pretty much what AWS SAM is too. I made some notes of some of the quirks / differences I've come across so far, but it seems to be more or less a drop-in replacement for the way we're using it. 

## Migrating Stacks
As long as you take care to keep the CloudFormation stack name the same, and match the "logical ID" for any resources you don't want recreated (more on that below), everything should just apply over the top of the existing stack. This is made a lot easier by SAM supporting [CloudFormation Changesets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html), which means we can see what it's going to do without actually deploying the stack. Once we have a new SAM stack that looks like it's going to work, we can run `sam deploy --confirm-changeset`, and SAM will upload everything and show the changeset. We can then open the CloudFormation console to look at exactly how each resource is being changed. 

## Name collisions and properties that trigger replacement
Some properties in CloudFormation can't be updated without recreating the resource. We can find them by referencing the documentation for the CloudFormation resource, eg for [AWS::Lambda::Function](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html), changing the value for `PackageType` and `FunctionName` will cause replacement. Interestingly, explicitly specifying the default value will also cause a replacement if that property was previously omitted (even though the value isn't actually changing).

CloudFormation will also fail if it needs to *replace* a resource that has a custom name defined. You will get an error similar to: 

> CloudFormation cannot update a stack when a custom-named resource requires replacing. Rename my-resource and update the stack again.

I expect this is because it attempts to create the new resource before deleting the old one, which isn't possible if the name has to be unique.

## S3 Bucket
There are several incompatible settings that determine which S3 bucket your project is uploaded into. The `--s3-bucket` parameter specifies the bucket explicitly, and `--resolve-s3` automatically create an S3 bucket to use for packaging and deploying for non-guided deployments. If you specify both the `--s3-bucket` and `--resolve-s3` options, then an error occurs, and if you specify `--guided` option, then the AWS SAM CLI ignores `--resolve-s3`. 

## Config Inheritance
The `samconfig.yml` file allows creating environment specific configs, but values in the config file don't fall back to the defaults automatically. To enable this behaviour we can to use YAML anchors. Unfortunately the `parameter_overrides` property in `samconfig.yml` is a list, so if we need to override one property we need to also pass in any that are set in the default block.

```yaml
version: 0.1

default:
  deploy:
    parameters: &default_deploy_parameters
      region: us-west-2
      on_failure: ROLLBACK
      capabilities: CAPABILITY_IAM
      parameter_overrides: ServiceName="my-service"

test:
  deploy:
    parameters:
      <<: *default_deploy_parameters
      stack_name: my-stack-playpen-test
      s3_bucket: test-us-west-2-lambda-packages
      s3_prefix: aws-sam/my-stack/test
      parameter_overrides: Environment="test" ServiceName="my-service"

prod:
  deploy:
    parameters:
      <<: *default_deploy_parameters
      stack_name: my-stack-prod
      s3_bucket: prod-us-west-2-lambda-packages
      s3_prefix: aws-sam/my-stack/prod
      parameter_overrides: Environment="prod" ServiceName="my-service"
```
## Custom Parameters and Defaults
In Serverless Framework we often use the `custom` block to define fixed values that are shared within the template, but may vary across environments:

```yaml
custom:
  defaults:
    slack_channel: "#random"
  test:
    slack_channel: "#test-events"
  prod:
    slack_channel: "#prod-events"

functions:
  my-function:
    environment:
      SlackChannel: ${self:custom.${self:provider.stage}.slack_channel, self:custom.defaults.slack_channel}
```

The most similar the `custom` block is probably a single level `Mappings` lookup, but it doesn't support falling back to a default value:

```yaml
Parameters:
  Environment:
    Type: String

Mappings:
  CommonValues:
    Test:
      SlackChannel: "#test-events"
    Prod:
      SlackChannel: "#prod-events"

Resources:
  MyResource:
    Type: AWS::Serverless::Function
    Properties:
      Environment:
        Variables:
          SlackChannel: !FindInMap [CommonValues, !Ref Environment, SlackChannel]
```

We can add the `AWS::LanguageExtensions` [transform](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-reference.html) which allows [setting a default fallback value](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-findinmap-enhancements.html), but the syntax isn't pretty:

```yaml
Resources:
  MyResource:
    Type: AWS::Serverless::Function
    Properties:
      Environment:
        Variables:
          SlackChannel: !FindInMap [CommonValues, !Ref Environment, SlackChannel, DefaultValue: !FindInMap [CommonValues, Defaults, SlackChannel]]
```

## Permission to use transforms
The IAM role you use to run `sam deploy` needs permission to use the `AWS::Serverless-2016-10-31` transform (and `AWS::LanguageExtensions` if you use it). To do this we need to add a statement similar to the following:

```json
 {
  "Version": "2012-10-17",
  "Statement": [{
     "Effect": "Allow",
     "Action": ["cloudformation:CreateChangeSet"],
     "Resources": [
       "arn:aws:cloudformation:*:aws:transform/Serverless-*",
       "arn:aws:cloudformation:*:aws:transform/LanguageExtensions",
     ]
  }]
}
```

I decided to allow any version of the Serverless transform, in any region, but you could pin it to `Serverless-2016-10-31` instead. Interestingly I couldn't find any reference to this ARN format in the [Actions, resources, and condition keys for AWS CloudFormation](https://docs.aws.amazon.com/service-authorization/latest/reference/list_awscloudformation.html). The only mention of it I found was this [example policy in the CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/control-access-with-iam.html#resource-level-permissions) docs.

## Other interesting things

There are a few other interesting looking features that I've not explored yet. 

- `sam init` can take a template URL in [cookiecutter](https://cookiecutter.readthedocs.io/en/latest/README.html) format for starting a new project.
- `sam sync` looks like it can keep deployed code in sync by watching for local file changes? Still need to look into this further but it could be handy.
