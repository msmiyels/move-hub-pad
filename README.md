# Move Hub Pad

<!-- badges -->
<p align="center">Drive the LEGO® Technic Move Hub with a game controller, from a browser tab.</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-Language?style=flat&label=Language&color=F7DF1E" alt="Language" />
  <img src="https://img.shields.io/badge/Web%20Bluetooth-Browser%20API?style=flat&label=Platform&color=7FB2E5" alt="Web Bluetooth" />
  <img src="https://img.shields.io/badge/Build-Vite?style=flat&label=Build&color=2454E0" alt="Vite build" />
  <img src="https://img.shields.io/website?url=https%3A%2F%2Fmsmiyels.github.io%2Fmove-hub-pad%2F&up_color=79B143&down_color=DC3B3B&logo=github&label=GitHub%20Pages&up_message=Online&down_message=Offline" alt="GitHub Pages status" />
  <img src="https://img.shields.io/badge/License-MIT-0056CC?style=flat" alt="MIT License" />
</p>

<!-- /badges -->

The hub in sets **42176** (Porsche GT4 e-Performance), **42214** (Lamborghini Revuelto) and
**42239** (Batmobile Tumbler) only talks to LEGO's CONTROL+ app. Its firmware is password
locked, so Pybricks cannot be installed on it, and the app has no gamepad support. It does,
however, still speak the plain LEGO Wireless Protocol v3 over Bluetooth Low Energy — which is
all this page needs.

A small static site (Vite, no framework), no account, nothing installed on the hub.

## What you need

| | |
|---|---|
| Hub | Technic Move Hub 88019 (sets 42176 / 42214 / 42239) with stock firmware |
| Controller | PlayStation DualSense, Xbox Wireless Controller, or any pad the browser reports |
| Browser | **Bluefy** on iPhone and iPad · Chrome or Edge on Windows, macOS, Linux, Android |
| Hosting | Any HTTPS origin. Web Bluetooth refuses to run from `file://`. |

Safari and Chrome for iOS cannot do Web Bluetooth. On iOS, Bluefy is the only route.

## Setup

1. Fork or download this repository.
2. In **Settings → Pages**, set the source to `GitHub Actions`.
3. Push to `main` — the included workflow (`.github/workflows/deploy.yml`) builds the site with
   Vite and deploys it. After a minute the page is live at `https://<user>.github.io/<repo>/`.

To run it locally: `npm install`, then `npm run dev` (or `npm run build && npm run preview` to
check the production build). Netlify, Vercel or any static host works just as well — point it at
`npm run build`, output directory `dist`.

## First run

1. Pair the controller with your phone, tablet or computer the normal way, in Bluetooth settings.
2. Open the page and **press one button on the controller**. Browsers hide a gamepad until it
   sends its first input; the pill in the header turns green once it appears.
3. Press the green button on the hub so it blinks, then tap **Connect hub** and pick it from
   the list. If the list stays empty, tap Connect again — the page falls back from a service
   filter to a name filter to showing every device.
4. Check the **Ports** tab. The hub reports its built-in devices on connect and they are
   assigned automatically. If nothing was detected, press *Apply known 42176 / 42214 layout*.
5. Keep **Power limit** low for the first drive. 60% is plenty indoors.
6. Release the triggers and centre the stick to clear the safety lock, then drive.

### Controls

| Input | Action |
|---|---|
| R2 | Accelerate |
| L2 | Reverse |
| Right stick up / down | Accelerate and reverse, if selected instead of the triggers |
| Left stick | Steer |
| Square | Brake — overrides throttle for as long as it is held |
| Circle | Headlights on / off |
| Options | Emergency stop |
| W / S / A / D, B, L, Space | Same, for testing on a desktop |

Any pad the browser does not report as a standard mapping can be taught: the Controller tab
samples an input for three seconds and takes whichever axis or button moved furthest, including
triggers that idle at −1.

## Settings worth knowing

- **Turn assist** slows the inner wheel while steering instead of reversing it, so the car turns
  without fighting its own drivetrain. Both wheels keep turning the same way.
- **Steering force** caps the torque the steering motor may use. The steering runs against
  mechanical end stops; holding full torque there heats the motor and stresses the gears.
  *Ease off when held* halves the force 0.4 s after the steering stops moving.
- **Swap left and right wheel** if the car turns into the wrong corner, **Reverse drive
  direction** if the triggers are the wrong way round. The two wheel motors are built facing
  each other, so one port runs inverted — that is normal, not a fault.

Everything is stored in `localStorage` and restored on the next visit.

## Safety

The motors are strong enough to pinch and there is no mechanical kill switch, so:

- Nothing is sent to a motor until throttle and brake are released and the stick is centred,
  after connecting, after every stop, and after every reconnect.
- Emergency stop is on the on-screen button, the Options button and the space bar. It sends the
  LWP3 brake command first, then lets the motors coast.
- The page stops the car by itself when the hub disconnects, the controller disconnects, the
  window loses focus, the tab is hidden, or the page is closed.
- Writes only ever go to ports the hub reported as a motor, a light or the RGB LED. Writing to
  the internal sensor ports is known to freeze the hub until it is power cycled.

## Protocol notes

Service `00001623-1212-efde-1623-785feabcd123`, characteristic `…1624…`, hub type `0x84`.

| Purpose | Frame |
|---|---|
| Motor power | `08 00 81 <port> 11 51 00 <power>` — signed, `0` coasts, `127` brakes |
| Headlights | `09 00 81 35 11 51 00 36 <brightness>` — mask `0x36` selects the four body LEDs |
| Hub RGB LED | `08 00 81 <port> 11 51 00 <colour>` |
| Hub property | `05 00 01 <property> <operation>` |
| Session end | `04 00 02 02` |

Ports reported by the hub in 42176 and 42214:

| Port | Device | Role |
|---|---|---|
| 50, 51 | `0x0056` | wheel motors, 50 built inverted |
| 52 | `0x0057` | steering |
| 53 | `0x0058` | six body LEDs |
| 54 | `0x0059` | LEGO's own drive VM — deliberately unused here |
| 55–58, 60 | sensors, voltage | read-only |
| 63 | `0x0017` | RGB LED in the power button |

This page drives the motors directly rather than through the hub's drive VM on port 54. The VM
path needs a bonded, encrypted link and a handshake, and it locks itself out if a session is not
closed properly; direct motor commands avoid all of that and work from a browser.

Do **not** pair the hub in your operating system's Bluetooth settings. Powered Up hubs are meant
to be connected from the browser's device picker only. The "pair" button inside that picker is
fine — it only grants the page access.

## Troubleshooting

| Symptom | Cause |
|---|---|
| "Web Bluetooth is not available" | Safari or Chrome on iOS. Use Bluefy. |
| The hub never appears in the picker | It is not blinking, or the CONTROL+ app still holds it. One BLE connection at a time. |
| Connects, then drops after a second | Another app or tab owns the hub, or the hub is paired in OS Bluetooth settings. Remove it there. |
| Sends climb, errors stay at zero, nothing moves | Wrong ports, or the write method. Turn off *Wait for write acknowledgement* in the Config tab and try again. |
| Car spins on the spot | Both wheel ports have the same invert setting. One of them must be inverted. |
| Safety lock never clears | A trigger idles away from zero. Teach throttle and reverse in the Controller tab. |

Turn on *Log every packet as hex* in the Config tab before reporting anything — the Log tab shows every
frame sent and received, and decodes the hub's error replies.

## Credits

Built on community reverse-engineering of this hub:

- [sT-aK/legoCon](https://github.com/sT-aK/legoCon) - browser control of the Move Hub, port map
- [marian001/movehub-88019](https://github.com/marian001/movehub-88019) - Python driver, crash map, session semantics
- [DanieleBenedettelli/TechnicMoveHub](https://github.com/DanieleBenedettelli/TechnicMoveHub) - bonding flow and first frame documentation
- [maxswinkels/42176-controller](https://github.com/maxswinkels/42176-controller) - drive stream and flags
- [Pybricks](https://github.com/pybricks/pybricks-micropython) - reference LWP3 device implementation
- [LEGO BLE Wireless Protocol](https://lego.github.io/lego-ble-wireless-protocol-docs/) - the specification

## Licence

MIT. 

## Disclaimer

LEGO® is a trademark of the LEGO Group, which does not sponsor, authorise or endorse this
project.
