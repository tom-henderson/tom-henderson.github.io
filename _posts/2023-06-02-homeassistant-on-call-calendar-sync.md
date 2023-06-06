---
title: Syncing an On Call Calendar to Home Assistant
---

I thought it might be useful if [Home Assistant](https://www.home-assistant.io/) knew when I was on call. I could use this to make sure the office doesn't get too cold overnight, or to send me a notification if I leave home without my laptop.

![Home Assistant Notification](/assets/images/posts/on-call.jpg)

We use [PagerDuty](https://www.pagerduty.com/), which gives you an iCal calendar feed, so I assumed I could just use this. Unfortunately while Home Assistant has integrations for [Local Calendars](https://www.home-assistant.io/integrations/local_calendar/) and [CalDAV](https://www.home-assistant.io/integrations/caldav/), neither of these support just fetching a single `.ics` file over http.

After a bit of digging around I discovered that Home Assistant stores local calendars in the `.storage` folder alongside its config files, so I figured I can just overwrite this file manually using a `shell_command`. You need to create the calendar first (under Settings > Devices & Services > Add Integration > Local Calendar). Once it's created, add an event to get Home Assistant to create the local calendar file. 

The `shell_command` goes into `configuration.yaml`:

```yaml
shell_command:
  update_on_call_calendar: 'curl https://pagerduty.com/path/to/calendar > /config/.storage/local_calendar.on_call.ics'
```

We can then use the shell command in an automation, followed by `homeassistant.reload_config_entry` to get Home Assistant to reload the file from disk. I have this running on an hourly `time_pattern` trigger, but you could increase the update frequency for a calendar that changes more regularly.

```yaml
alias: Refresh On Call Calendar
description: ""
trigger:
  - platform: time_pattern
    minutes: "0"
condition: []
action:
  - service: shell_command.update_on_call_calendar
    data: {}
  - service: homeassistant.reload_config_entry
    target:
      entity_id: calendar.on_call
    data: {}
mode: single
```

Once the calendar has updated you should see events show up in Home Assistant. The calendar state can be used in automations:

```yaml
alias: On Call Laptop Check
description: "Send a push notification if I leave my laptop at home when I'm on call"
trigger:
  - platform: state
    entity_id:
      - person.tom_henderson
    to: not_home
condition:
  - condition: and
    conditions:
      - condition: state
        entity_id: calendar.on_call
        state: "on"
      - condition: device
        device_id: <device_id>
        domain: device_tracker
        entity_id: device_tracker.toms_m2
        type: is_home
action:
  - device_id: <device_id>
    domain: mobile_app
    type: notify
    message: You're on-call. Did you leave your laptop at home?
mode: single
```