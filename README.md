# VSTS Status Monitor

Interested in getting notified when Microsoft [Visual Studio Team Services (VSTS)](https://visualstudio.com/vsts) goes down for maintenance or when it comes back up? Well, now you can, using this simple Google Chrome extension.

![vstsstatusmonitor](https://user-images.githubusercontent.com/2685029/30254406-6f177398-9666-11e7-96eb-323e5b8a9468.gif)

## Download ##
[![ChromeWebStore](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/vsts-status-monitor/nofhmlpbeejfgdehmooehmdnpefjngej)

## Build ##

- Clone this repository.
- Download and open in [Visual Studio Code](https://code.visualstudio.com/).
- `Ctrl + Shift + B` to build the extension.
- Build will generate the `dist` directory with all the comiled JS files.
- Now open Google Chrome and go to `More tools` | `Extensions`.
- Check `Developer mode` and then click `Load unpacked extension`
     ![LoadUnpacked](resources/load-unpacked-extension.png)
- Browse to generated `dist` folder and you should see the extension loaded in Chrome.