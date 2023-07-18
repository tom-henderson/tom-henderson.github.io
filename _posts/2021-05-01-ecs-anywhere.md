---
title: ECS Anywhere
tags: 
 - aws
 - docker
 - terraform
---

AWS finally released [ECS Anywhere](https://aws.amazon.com/ecs/anywhere/) last week, which allows you to use ECS to schedule tasks on on-premise hosts. The whole setup is very straightforward, and it's quite reasonably priced at $0.01025 per hour for each managed ECS Anywhere on-premises instance - about $1.72 per week per host.

We need a couple of bits of supporting infrastructure first: an IAM role for our on-premise hosts, and an ECS cluster.

```terraform
data "aws_iam_policy_document" "assume_role_policy_ssm" {
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = ["ssm.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_anywhere" {
    name               = "ECSAnywhere"
    assume_role_policy = data.aws_iam_policy_document.assume_role_policy_ssm.json
}

resource "aws_iam_role_policy_attachment" "amazon_ssm_managed_instance_core" {
  role       = aws_iam_role.ecs_anywhere.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "amazon_ec2_container_service_for_ec2_role" {
  role       = aws_iam_role.ecs_anywhere.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_ecs_cluster" "cluster" {
  name = "ECS-Anywhere"
}
```

Once that's done we need to create an authorisation for each managed instance we want to add with `aws ssm create-activation --iam-role ECSAnywhereRole`. This returns an `ActivationId` and `ActivationCode`, which will be used to register the instances with Systems Manager.

Finally we are ready to create the cluster. On each machine we just need to download the provided install script, and run it, passing in the region, cluster name and SSM activation codes.

```bash
curl --proto "https" -o "/tmp/ecs-anywhere-install.sh" "https://amazon-ecs-agent.s3.amazonaws.com/ecs-anywhere-install-latest.sh"
sudo bash /tmp/ecs-anywhere-install.sh --region $REGION --cluster $CLUSTER_NAME --activation-id $ACTIVATION_ID --activation-code $ACTIVATION_CODE
```

That's really all there is to it. The instances should appear in the ECS cluster console with instance IDs beginning with `mi-`.

![ECS cluster with on-premise instances](/assets/images/posts/ecs-console.png)

Now that our cluster is up and running we can create a task definition and deploy it to our servers. Here I've just used the [example task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-anywhere-runtask.html) from the docs.

![ECS Service running on on-premise instances](/assets/images/posts/ecs-service.png)
