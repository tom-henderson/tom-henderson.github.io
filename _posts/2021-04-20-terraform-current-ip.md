---
layout: post
title: Accessing your current IP in Terraform
comments: true
---

Even with session manager for accessing instances, sometimes it's handy to just open up a port to your current IP address - to allow access to a load balancer for example. One quick way to do this is with an [external data source](https://registry.terraform.io/providers/hashicorp/external/latest/docs/data-sources/data_source).

{% highlight terraform %}
data "external" "current_ip" {
  program = ["bash", "-c", "curl -s 'https://api.ipify.org?format=json'"]
}
{% endhighlight %}

As long as the `program` returns JSON, we can access it's properties, for example in a security group rule: `cidr_blocks = "${data.external.current_ip.result.ip}/32"`.

Don't use this for anything other than testing though, since it'll change if anyone else runs an apply!