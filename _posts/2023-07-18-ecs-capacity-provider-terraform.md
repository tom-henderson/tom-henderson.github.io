---
title: Adding a Capacity Provider to an ECS Cluster with Terraform
tags: 
 - aws
 - docker
 - terraform
---

I recently had to use terraform to add a capacity provider to an existing ECS cluster. 

After adding a default capacity provider to the cluster, existing services still have a `launch_type=EC2`, so we need to update them to use a `capacity_provider_strategy` in order to use it. Unfortunately we can't do this in terraform due to a [long-standing bug](https://github.com/hashicorp/terraform-provider-aws/issues/22823#issuecomment-1118343091):

> When an ECS cluster has a `default_capacity_provider_strategy` setting defined, Terraform will mark all services that don't have `ignore_changes=[capacity_provider_strategy]` to be recreated.

The ECS service actually *does* support changing from `launch_type` to `capacity_provider_strategy` non-destructively, by forcing a redeploy. Since this uses the service's configured deployment mechanism there's no disruption.

![ECS Compute Configuration](/assets/images/posts/ecs-compute-configuration.png)

We can also set this using the CLI:

```
aws ecs update-service --cluster my-cluster --service my-service --capacity-provider-strategy capacityProvider=ec2,weight=100,base=0 --force-new-deployment
```

If for some reason we need to revert, ECS also [supports changing back](https://github.com/aws/containers-roadmap/issues/838#issuecomment-1159092125) from `capacity_provider_strategy` to `launch_type`, however the option is disabled in the console:

![ECS Compute Configuration](/assets/images/posts/ecs-compute-configuration-2.png)

As a workaround, we can pass an empty list of capacity providers to the `update-service` command, which will result in the service using `launch_type=EC2` again.

```
aws ecs update-service --cluster my-cluster --service my-service --capacity-provider-strategy '[]' --force-new-deployment
```
