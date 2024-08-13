---
title: Tunnelling SSH over AWS SSM Session Manager
tags: 
 - aws
 - networking
---

In our AWS environment, no hosts are exposed to the internet in public subnets. Instead, we use a feature of [AWS Systems Manager](https://aws.amazon.com/systems-manager/) if we need to connect to instances. [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html) works by running an agent on each instance which opens a connection back to the Systems Manager service. To connect to an instance, someone with the appropriate IAM permissions can use the `aws ssm start-session` command, or the connect button in the AWS console. This connects to Systems Manager over `HTTPS`, which sends a message to the agent on the instance to set up a bi-directional tunnel between the client and the instance. Commands can then be sent over this tunnel to the agent, and output is sent back over the tunnel to the client.

![SSM Session Manager](/assets/images/posts/session-manager.png)

This is usually all we need to connect to instances for troubleshooting etc, but occasionally we may need to transfer a file, and to do that we need to use another feature of Session Manager which allows us to [forward ports](https://aws.amazon.com/blogs/aws/new-port-forwarding-using-aws-system-manager-sessions-manager/) from the remote instance back to our client. Conceptually this is much the same as when we use SSH to forward a remote port with `ssh -L 8080:localhost:80` - port `80` on the remote instance can be accessed on our local machine on port `8080`. In the case of Session Manager, the connection is tunnelled over `HTTPS` instead of `SSH`, but the result is the same.

To upload a file to the instance we want to use the `scp` command. 

First we update our `.ssh/config` file to tell `ssh` and `scp` to use a [proxy command](https://man.openbsd.org/ssh_config#ProxyCommand) when connecting to instances. 
```
Host i-*
  IdentityFile ~/awskeypair.pem
  User ec2-user
  ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
```
Since we will be connecting to the `sshd` service on the instance (instead of the SSM Agent), we need to have valid credentials to log in - in this case the private key used to launch the instance. You could also leave out the `IdentityFile` and `User` settings and instead pass in the appropriate authentication options on the commandline when you connect.

We should then be able to connect to the instance over ssh by using:
```
ssh i-0123456abcdef
```

Or transfer files with:
```
scp somefile.txt i-0123456abcdef:/tmp/somefile.txt
```

It's worth noting that when we do this, the SSM Agent is no longer able to save session logs to CloudWatch or S3 for us, since it doesn't have access to the encrypted SSH traffic.