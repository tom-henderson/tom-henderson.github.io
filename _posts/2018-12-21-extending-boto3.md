---
title: Extending Boto3
---

> All of Boto3's resource and client classes are generated at runtime. This means that you cannot directly inherit and then extend the functionality of these classes because they do not exist until the program actually starts running.

It is still possible to extend `boto3` using the [events system](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/events.html), which allows us to run custom code when boto3 events triggered, or to provide default values. It also allows us to add additional classes to the base objects.

As an example, we can add a new class for `ec2.Instance` to inherit from with a convenience method for reading tags:

{% highlight python %}
import boto3

class InstanceExtras(object):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_tag(self, tag, default=''):
        if self.tags:
            all_tags = [t for t in self.tags if t['Key'] == tag]
            if all_tags:
                return all_tags[0]['Value']
        return default

def add_custom_instance_class(base_classes, **kwargs):
    base_classes.insert(0, InstanceExtras)

session = boto3.Session(*args, **kwargs)
session.events.register(
    'creating-resource-class.ec2.Instance',
    add_custom_instance_class
)
{% endhighlight %}

This new session object can then be used normally, and whenever an `ec2.Instance` is returned it will inherit our new method.

{% highlight python %}
ec2 = session.resource('ec2')
instance = ec2.instances(InstanceId='i-123456abc')
name = instance.get_tag('Name') # Will return the Name tag
{% endhighlight %}