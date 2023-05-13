---
title: Control Sonos with MoesHouse Zigbee Smart Knob
---

I picked up this neat little Zigbee knob on AliExpress to use as a volume control for Sonos. It seems pretty well made, with a strong magnet on the back to attach it to its little mounting plate (or anything else it'll stick to) and it was easy enough to connect to [Zigbee2MQTT](https://www.zigbee2mqtt.io/). 

![MoesHouse Zigbee Smart Knob](/assets/images/posts/moeshouse-zigbee-smart-knob.jpg)

[Smart Home Scene](https://smarthomescene.com/reviews/moeshouse-zigbee-smart-knob-review/) has a detailed review with more photos and a tear down of the internals.

The only minor gotcha is the need to disable legacy mode for the knob in Zigbee2MQTT, which alters the MQTT payload to send `action` triggers.

```yaml
  '0x00123456789abcde':
    friendly_name: 'office-smart-knob'
    legacy: false
```

To control Sonos I've set up three automations in Home Assistant: rotate right / left for volume up and down, and single press to select the line in source. For the volume automations I added a condition to check that the Office Sonos is actually playing, to avoid being deafened after using it as a fidget toy when nothing is playing.

### Volume Up / Down Automation

```yaml
alias: Office Volume Up
trigger:
  - platform: device
    domain: mqtt
    device_id: <knob device id>
    type: action
    subtype: rotate_right
    discovery_id: 0x00123456789abcde action_rotate_right
condition:
  - condition: device
    device_id: <sonos device id>
    domain: media_player
    entity_id: media_player.office
    type: is_playing
action:
  - service: media_player.volume_up
    data: {}
    target:
      device_id: <sonos device id>
mode: single
```

### Source Selection Automation

```yaml
alias: Office Source to Line-in
trigger:
  - platform: device
    domain: mqtt
    device_id: <knob device id>
    type: action
    subtype: single
    discovery_id: 0x00123456789abcde action_single
condition: []
action:
  - service: media_player.select_source
    data:
      source: Line-in
    target:
      device_id: <sonos device id>
mode: single
```
