---
layout: post
title: Adding Yoctopuce Sensors to Observium
---

I came across the [Yoctopuce](https://www.yoctopuce.com/) USB sensors recently and thought it might be fun to use one to monitor the closet I keep my network rack & servers in. I picked up one of the [Yocto-Meto](https://www.yoctopuce.com/EN/products/usb-environmental-sensors/yocto-meteo) sensors, which combines humidity, pressure, and temperature sensors, and hooked it up to the server with a USB cable. 

/usr/local/lib/observium-agent/yoctopuce
{% highlight python %}
#!/usr/bin/python

from yoctopuce.yocto_api import *
from yoctopuce.yocto_temperature import *
from yoctopuce.yocto_humidity import *
from yoctopuce.yocto_pressure import *

errmsg = YRefParam()
YAPI.RegisterHub("usb", errmsg)

temperature = YTemperature.FirstTemperature()
humidity = YHumidity.FirstHumidity()
pressure = YPressure.FirstPressure()

print "<<<yoctopuce>>>"
print "temperature:rack:{}".format(temperature.get_currentValue())
print "humidity:rack:{}".format(humidity.get_currentValue())
print "pressure:rack:{}".format(pressure.get_currentValue())
{% endhighlight %}

~/Library/LaunchAgents/org.observium.agent.plist
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.observium.agent</string>
    <key>Program</key>
    <string>/usr/local/lib/observium-agent/yoctopuce</string>
    <key>Sockets</key>
    <dict>
        <key>Listeners</key>
        <array>
            <dict>
                <key>SockServiceName</key>
                <string>36602</string>
            </dict>
        </array>
    </dict>
    <key>inetdCompatibility</key>
    <dict>
        <key>Wait</key>
        <false/>
    </dict>
</dict>
</plist>
{% endhighlight %}

/opt/observium/includes/polling/unix-agent/yoctopuce.inc.php
{% highlight php %}
<?php
global $agent_sensors;

if (!empty($agent_data['yoctopuce']))
{
  $sensors = explode("\n", $agent_data['yoctopuce']);

  if (count($sensors))
  {
    foreach ($sensors as $sensor)
    {
      list($sensortype, $key, $value) = explode(":", $sensor, 3);
      $key = trim($key);
      $value = trim($value);
      $sensortype = trim($sensortype);
      discover_sensor($valid['sensor'], $sensortype, $device, '', $key, 'yoctopuce', "$key", 1, $value, array(), 'agent');
      $agent_sensors[$sensortype]['yoctopuce'][$key] = array('description' => "$key", 'current' => $value, 'index' => $key);
    }
  }
  $valid_applications['yocopuce'] = 'yoctopuce';
  echo(PHP_EOL);
  unset($sensors);
}
// EOF
{% endhighlight %}

![Observium Minigraphs](/assets/images/posts/2018-06-19-observium-yoctopuce/charts.png)