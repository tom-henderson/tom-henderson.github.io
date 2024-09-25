---
title: Notes on Packaging Python Lambdas
tags: 
 - aws
 - python
 - lambda
---

Some notes I made on building a python lambda package, because I spent far too much time on it this week. In all these examples I'm using a `requirements.txt` to install dependencies into a `lambdaPackage` directory.

## Install packages that are compatible with the lambda environment
We need to make sure `pip` downloads packages that will be compatible with the lambda runtime environment. AWS suggest using the `--platform` and `--only-binary` flags when installing dependencies:
```bash
$ pip install --platform manylinux2014_x86_64 --only-binary=:all: --requirement requirements.txt --target lambdaPackage
```
The problem I found with this approach is if one of the dependencies doesn't have a release that matches those parameters (compare [orjson](https://pypi.org/project/orjson/3.8.2/#files) with [pyleri](https://pypi.org/project/pyleri/1.4.3/#files) for example).
As an alternative, we can run pip inside the [AWS SAM build container images](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-image-repositories.html), which should ensure we get a compatible set of packages:
```bash
$ docker run -it --rm --entrypoint='' -v "$(pwd):/workspace" -w /workspace public.ecr.aws/sam/build-python3.10 pip install -r requirements.txt -t lambdaPackage
```

## Don't accidentally include a top level folder inside the zip file.
If we create the archive with `zip lambdaPackage.zip lambdaPackage/*` we end up with a zip file that includes the `lambdaPackage` directory. This was actually quite annoying to troubleshoot, because when you extract the zip file in macOS it will create this enclosing folder for you if it doesn't exist (instead of spewing files all over the current folder), so it took me a while to realise what was happening.
To add only the _contents_ of `lambdaPackage` to the archive, we want to run the `zip` command from inside the `lambdaPackage` directory:
```bash
$ pushd lambdaPackage
$ zip ../lambdaPackage.zip .
$ popd
```
You can also use the `zipinfo` command to examine the contents of the archive.

## Check File Permissions
Lambda needs to have permission to read your files and dependencies. [The expected permissions for python projects](https://repost.aws/knowledge-center/lambda-deployment-package-errors) are `644` for files and `755` for directories. You can update everything with:
```bash
$ chmod 644 $(find lambdaPackage -type f)
$ chmod 755 $(find lambdaPackage -type d)
```

## Slim down the dependencies
The maximum size of a lambda package is 250MB (unzipped), including all lambda layers. There are a few things we can do to slim down the resulting package that shouldn't impact the lambda environment.

Running pip with `PYTHONPYCACHEPREFIX=/dev/null` will discard all the `__pycache__` files out (possibly at the expense of slower cold start times). Since we won't be running `pip` again it's also usually safe to delete all the `.dist-info` files.

Some of the biggest wins can be found with modules like `googleapiclient` (75MB - about 30% of our allowance!) which include large model files describing each service they support. In this case it should be safe to delete the model file for any services we won't be using. You'll find them in `googleapiclient/discovery_cache/documents/`. [Botocore had a similar issue](https://github.com/boto/botocore/issues/2365), but since `1.32.1` now stores these model files compressed.

## Precompiling modules
One thing I didn't try was [precompiling the dependencies](https://dev.to/aws-builders/reducing-aws-lambda-cold-starts-3eea). AWS actually advises against this but as long as it's run inside the appropriate [AWS SAM build container images](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-image-repositories.html) the result should be compatible with the lambda runtime, and could speed up cold start times.