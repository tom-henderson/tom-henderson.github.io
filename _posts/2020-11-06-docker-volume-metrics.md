---
layout: post
title: Docker Volume Size Metrics for Prometheus
comments: true
---

Wrote a little script recently to send volume size metrics to prometheus. I'm already using cadvisor which provides a `container_fs_usage_bytes` metric with labels for `container_label_com_docker_compose_project` and `container_label_com_docker_compose_service`, but I wanted a bit more detail on where data was being used.

The script is run every minute by cron and writes the metrics to the `collector.textfile.directory` path used by `node_exporter`.

{% highlight bash %}
* * * * * docker-volume-metrics.sh | sponge {{ prometheus_textfile_collector_path }}/docker-volumes.prom
{% endhighlight %}

{% gist b65f59018700f4a3526f38bf2760b963 %}

![](/assets/images/posts/2020-11-06-docker-volume-metrics/chart.png)