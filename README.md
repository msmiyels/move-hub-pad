<div align="center">

# Move Hub Pad

Drive your LEGO® Technic Move Hub with a real game controller, right from a browser tab.
No app. No account. No firmware. No install.

</div>

<p align="center">
  <img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=flat" alt="Language" />
  <img src="https://img.shields.io/badge/Platform-Web%20Bluetooth-7FB2E5?style=flat" alt="Web Bluetooth" />
  <img src="https://img.shields.io/badge/Build-Vite-2454E0?style=flat" alt="Vite build" />
  <a href="https://msmiyels.github.io/move-hub-pad/">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fmsmiyels.github.io%2Fmove-hub-pad%2F&up_color=79B143&down_color=DC3B3B&logo=github&label=GitHub%20Pages&up_message=Online&down_message=Offline" alt="GitHub Pages status" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-0056CC?style=flat" alt="MIT License" />
</p>

### Browser support

Requires Web Bluetooth.

| Platform | Browser | Status |
|---|---|---|
| Android, Windows, macOS, Linux | Chrome, Edge | Supported |
| iOS, iPadOS | Bluefy | Supported, the only route; Safari and Chrome lack Web Bluetooth there |
| Any platform | Firefox, Safari | Not supported, no Web Bluetooth |

## Why

LEGO's CONTROL+ app doesn't support gamepads, even though racing a Technic set (Porsche GT4e-Performance 42176, Lamborghini Revuelto 42214, Batmobile Tumbler 42239) calls for one. And the Move Hub can't be unlocked with Pybricks either: its firmware is password-locked.

The hub still speaks plain **LEGO Wireless Protocol v3 over Bluetooth Low Energy**, though, and Move Hub Pad talks to it directly from the browser. No LEGO app. No account. Nothing installed on the hub. No firmware hack, no SDK.

### What you get

- **Gamepad driving**: PlayStation DualSense, Xbox Wireless, or any pad your browser reports
- **Full manual control**: steering, throttle, reverse, brake, headlights, mapped the way you want
- **Drive anywhere**: on the floor or across the room, not chained to a desk
- **Safety first**: nothing moves until every control is at rest; emergency stop on screen, button and space bar

### How it looks

<p align="center">
    <img src="/src/public/social-preview.png" width="720" alt="Mobile WebApp example" />
</p>

## Compatibility

Move Hub Pad talks to any hub reporting **hub type `0x84`** (the Technic Move Hub), built into these sets:

| Set | Model | Tested |
|---|---|---|
| 42176 | Porsche GT4 e-Performance | Not yet. Port layout from community sources, should match 42214. |
| 42214 | Lamborghini Revuelto | Yes, in regular use. |
| 42239 | Batmobile Tumbler | Not yet. Port layout from community sources, should match 42214. |

The wheel, steering and headlight ports should be identical across all three (same hub, same motor set), but only 42214 has actually been driven with this project so far. If you have a 42176 or 42239, an issue or PR saying whether it worked closes that gap for everyone else.

## Quick start: drive it now

1. Pair the controller with your phone / tablet / computer the usual way, in Bluetooth settings.
2. Open the page and **press one button on the controller**. Browsers hide a gamepad until it sends its first input.
3. Press the green button on the hub so it blinks, then tap **Connect hub** and pick it from the list.
4. The picker steals focus from the page, which pauses everything. **Press a button on the controller again** once you're back on the page to bring it back.
5. Keep **Power limit** low for the first go. 60 % is plenty indoors.
6. Release the triggers and centre the stick to clear the safety lock, then drive.

**iOS note:** Safari and Chrome on iOS can't do Web Bluetooth. On iPhone/iPad use the **Bluefy**
browser. It's the only route. Android, Windows, macOS, Linux: Chrome or Edge.

**Keep the tab active:** the browser window needs focus and the tab needs to stay visible while
driving. Switching apps, locking the screen or hiding the tab stops the car immediately, see [Safety](#safety).

### Controls

| Input | Action |
|---|---|
| R2 | Accelerate |
| L2 | Reverse |
| Right stick up / down | Accelerate + reverse (if selected instead of the triggers) |
| Left stick | Steer |
| Square | Brake (overrides throttle while held) |
| Circle | Headlights on / off |
| Options | Emergency stop |
| W / S / A / D, B, L, Space | Same, for desktop testing |

Any pad the browser doesn't report as standard can be taught: the Pad tab samples an input for three
seconds and takes whichever axis or button moved furthest, including triggers that idle at −1.

## Settings worth knowing

- **Turn assist**: slows the inner wheel instead of reversing it, so the car turns without fighting its
  own drivetrain.
- **Steering force**: caps the torque the steering motor may use. *Ease off when held* halves the force
  0.4 s after the steering stops, so it doesn't overheat against the end stops.
- **Swap left/right wheel** if it turns into the wrong corner; **Reverse drive direction** if the
  triggers feel backwards. The two wheel motors are built facing each other, so one port runs inverted.
  That's normal, not a fault.

Everything is stored in `localStorage` and restored on the next visit.

## Safety

The motors are strong enough to pinch and there's no mechanical kill switch, so:

- Nothing is sent to a motor until throttle and brake are released and the stick is centred: after
  connecting, after every stop, and after every reconnect.
- Emergency stop is on the on-screen button, the Options button and the space bar.
- The car stops by itself if the hub disconnects, the controller disconnects, the window loses focus,
  the tab is hidden, or the page is closed.
- Writes only go to ports the hub reports as motor, light or RGB LED. Writing to internal sensor
  ports is known to freeze the hub until it's power-cycled.

## How it works

Service `00001623-1212-efde-1623-785feabcd123`, characteristic `…1624…`, hub type `0x84`.

| Purpose | Frame |
|---|---|
| Motor power | `08 00 81 <port> 11 51 00 <power>`: signed, `0` coasts, `127` brakes |
| Headlights | `09 00 81 35 11 51 00 36 <brightness>`: mask `0x36` selects the four body LEDs |
| Hub RGB LED | `08 00 81 <port> 11 51 00 <colour>` |
| Hub property | `05 00 01 <property> <operation>` |
| Session end | `04 00 02 02` |

Move Hub Pad drives the motors directly instead of going through the hub's own drive VM (port 54). That VM needs a bonded, encrypted link and a handshake, and locks itself out if a session isn't closed cleanly. Direct motor commands avoid all of that and work from a browser.

Do **not** pair the hub in the OS Bluetooth settings. Powered Up hubs connect from the browser's
device picker only; the "pair" button there just grants the page access.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| "Web Bluetooth is not available" | Safari or Chrome on iOS. Use **Bluefy**. |
| Hub never appears in the picker | Not blinking, or the CONTROL+ app still holds it. One BLE connection at a time. |
| Connects, drops after a second | Another app/tab owns the hub, or it's paired in OS Bluetooth. Remove it there. |
| Car spins on the spot | Both wheel ports have the same invert setting. One must be inverted. |
| Safety lock never clears | A trigger idles away from zero. Teach throttle and reverse in the Pad tab. |

Turn on *Log every packet as hex* in the Log tab before reporting anything. It shows every frame and decodes the hub's error replies.

## For developers

Prefer this page to a fork: you get every update automatically.
Want to run your own instance instead?

1. Fork or download the repository.
2. In **Settings → Pages**, set the source to `GitHub Actions`.
3. Push to `main`: the included workflow builds with Vite and deploys. After a minute it's live at
   `https://<user>.github.io/<repo>/`.

Local: `npm install`, then `npm run dev` (or `npm run build && npm run preview`). Netlify, Vercel or any static host works; point it at `dist`.

## Credits

Built on community reverse-engineering of the Move Hub:

- [sT-aK/legoCon](https://github.com/sT-aK/legoCon): browser control of the Move Hub, port map
- [marian001/movehub-88019](https://github.com/marian001/movehub-88019): Python driver, port map, session semantics
- [DanieleBenedettelli/TechnicMoveHub](https://github.com/DanieleBenedettelli/TechnicMoveHub): bonding flow, first frame docs
- [maxswinkels/42176-controller](https://github.com/maxswinkels/42176-controller): drive stream and flags
- [Pybricks](https://github.com/pybricks/pybricks-micropython): reference LWP3 device implementation
- [LEGO BLE Wireless Protocol](https://lego.github.io/lego-ble-wireless-protocol-docs/): the specification

## License

MIT. 

## Disclaimer

Experimental project, built by reverse-engineering an undocumented protocol. Provided "as is", with no warranty of any kind. Use it at your own risk: no liability is accepted for damage to hardware, property or anything else that results from using it, for whatever reason.

LEGO® is a trademark of the LEGO Group, which does not sponsor, authorise or endorse this project.
