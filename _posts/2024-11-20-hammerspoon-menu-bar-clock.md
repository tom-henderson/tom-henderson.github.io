---
title: Hammerspoon Menu Bar Clock
tags: 
 - hammerspoon
---

While I was traveling recently I thought it would be useful to keep a second clock in the menu bar set to my home timezone. [Hammerspoon](https://www.hammerspoon.org/) seemed like it should be able to handle this, so after a bit of tinkering is what I ended up with:

![Menubar Clocks](/assets/images/posts/menu-bar-clocks.png)

It's not perfect, but calculating the `nextMinute` at startup helps to keep the clocks fairly accurate by trying to get the menu to update as close as possible to the start of each minute. Calling the spoon's `new()` method returns a separate instance, making it easy to add several clocks.

To add them to Hammerspoon just update `init.lua`:

```lua
local MenuClock = hs.loadSpoon("MenuClock")
MenuClock:new('🥝', 13):start()
MenuClock:new('🏔️', -7):start()
MenuClock:new('🇬🇧', 0):start()
```

You can also adjust the time format for the each clock in case you want to show 24h time, or just the hour.

```lua
uk = MenuClock:new("🇬🇧", 0)
uk.time_format = "%I%p"
uk:start()
```

The full code for the spoon is available on [GitHub](https://github.com/tom-henderson/hammerspoon/blob/master/Spoons/MenuClock.spoon/init.lua).