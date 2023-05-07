---
title: Control Sonos from the Menu Bar using HomeAssistant and Hammerspoon
---

We have a Sonos setup at home which I love. In my office I have a [Sonos Port](https://www.sonos.com/en-nz/shop/port) connected to my turntable and some powered speakers. I've been tinkering with [Home Assistant](https://www.home-assistant.io/) recently, and the Sonos integration works really well, so I decided to build a little menu bar app to pull up my AV dashboard. 

[Hammerspoon](https://www.hammerspoon.org/) is a great little swiss-army tool for macOS which I already use for various shortcuts and automations. This is what I came up with, using just an `hs.menubar` with no menu items, and an `hs.webview` positioned below it to mimic a menu. It seems to work pretty well.

![](/assets/images/posts/homeassistant-sonos.png)

```lua
local obj = {}
obj.__index = obj

-- Metadata
obj.name = "Home"

obj.window = hs.webview.new({x=100, y=100, w=400, h=800})
	:url("https://homassistant.local")
    :allowNewWindows(false)
	:allowTextEntry(true)
    :shadow(true)

obj.menu = hs.menubar.new()
	:setTitle("Home")

obj.menu:setClickCallback(function()
    local menuframe = obj.menu:frame()
    local windowframe = obj.window:frame()

    local x = menuframe.x - (windowframe.w / 2) + (menuframe.w / 2)

    obj.window:frame({x=x, y=30, w=400, h=800})

    if obj.window:isVisible() then
        obj.window:hide()
    else
        obj.window:show()
            :windowCallback(function(action, webview, hasFocus)
                if action == "focusChange" and not hasFocus then
                    obj.window:hide()
                end
            end)
            :bringToFront(true)
    end
end)

return obj
```