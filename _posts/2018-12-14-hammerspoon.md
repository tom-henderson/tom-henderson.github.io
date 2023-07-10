---
title: Replacing Logitech Options with Hammerspoon
tags: 
 - hammerspoon
---

The recent [security vulnerability](https://bugs.chromium.org/p/project-zero/issues/detail?id=1663) in the Logitech Options app prompted me to see if I could achieve the same functionality without it. All I really care about is to bind the 4th and 5th buttons (the ones on the side by the second scroll wheel) to back and forward in Chrome, and the 6th button (the thumb rest) to open Mission Control. I'm already using [Hammerspoon](https://www.hammerspoon.org/) for a few things, so this seemed like the best place to start. 

After a bit of digging it turns out that the thumb rest button is sending `Ctrl` + `Alt` + `Tab`, which can be easily bound to opening the Mission Control app:

```lua
hs.hotkey.bind({"alt", "ctrl"}, "Tab", function()
    hs.application.launchOrFocus("Mission Control.app")
end)
```

To capture the mouse buttons we can use `hs.eventtap`, and send the back and forward shortcuts if the current application is chrome:

```lua
hs.eventtap.new(hs.eventtap.event.types.middleMouseUp, function(event)

    button = event:getProperty(hs.eventtap.event.properties.mouseEventButtonNumber)

    current_app = hs.application.frontmostApplication()
    google_chrome = hs.application.find("Google Chrome")

    if (current_app == google_chrome) then
        if (button == 3) then
            hs.eventtap.keyStroke({"cmd"}, "[")
        end

        if (button == 4) then
            hs.eventtap.keyStroke({"cmd"}, "]")
        end
    end
end):start()
```
