# Kifaru Kopje Lodge

A scroll-driven 3D website for a fictional six-tent safari lodge in the central Serengeti. Scrolling moves the visitor through one day, from sunrise on the plains to a fire under the stars. The journey ends in a live booking configurator.

The lodge, its name, prices, availability and policies are all invented placeholders.

## The experience

| Time  | Chapter      | What you see                                              |
| ----- | ------------ | --------------------------------------------------------- |
| 06:20 | First light  | Sunrise over acacias, a hot-air balloon                   |
| 09:30 | The plains   | Wildebeest and zebra herds, giraffes, elephants           |
| 14:40 | The kopje    | The lodge on its granite outcrop                          |
| 16:30 | Arrival      | The walk up onto the deck                                 |
| 17:30 | Your tent    | Inside the suite: bed, copper bath, a lantern to light    |
| 18:40 | Sundowner    | Looking back over the plains at sunset                    |
| 20:30 | The fire     | Stars, moon, sparks and fireflies                         |

- **Look around:** move the mouse, or drag the scene.
- **Hotspots:** markers open cards about the animals and the suite. Some cards have an "Add to my stay" button.
- **Sound:** optional ambient audio (wind, birds, crickets, fire), synthesised in the browser and off by default.
- **Booking:** dates, guests, tent type and add-on experiences, with a live price, seasonal rates and a 30% deposit. Checkout ends on a demo confirmation. **No payment is taken.**

## Tech

- Plain HTML, CSS and JavaScript, with no framework and no bundler.
- [Three.js r128](https://threejs.org/) loaded from cdnjs.
- Fonts from Google Fonts: Instrument Serif, Hanken Grotesk and DM Mono.
- All models, textures and audio are generated in code, so there are no image or audio assets.

## Project layout

```
src/
  style.css    styles
  body.html    page markup: chapters, booking form, checkout
  world-1.js   renderer, sky, time of day, terrain, trees
  world-2.js   animals, kopje boulders, balloons
  world-3.js   lodge, suite interior, pool, fire, atmosphere
  journey.js   camera path, scroll, hotspots, look-around, sound
  booking.js   pricing, tent and add-on selection, checkout
build.sh       assembles src/ into dist/
shot.sh        headless-Chrome screenshot helper (macOS)
dist/
  index.html   page fragment (no <html>/<head>), for the Claude artifact viewer
  preview.html full standalone page
```

## Build and run

Requires only `bash`. There is no `npm install`.

```bash
bash build.sh
open dist/preview.html
```

`preview.html` loads Three.js and fonts from CDNs, so it needs an internet connection. You can open it directly from disk.

## Deploy to GitHub Pages

Pages serves from the repo root or `/docs` and expects an `index.html`. `dist/preview.html` is the full page but has the wrong name and location, so add a step to `build.sh` that writes it to `docs/index.html`. Then in the repo go to **Settings → Pages → Deploy from a branch**, and choose your branch and the `/docs` folder.

## Before going live

- Replace the placeholder rates, seasons, availability and terms in `src/booking.js`.
- Connect real inventory and a payment provider. The checkout in `booking.js` only shows a confirmation.
- Check the wildlife facts in `src/journey.js`, which are written from memory.
- Rename the lodge and fix the location if you are not using the fictional one.

## Browser support

Needs WebGL. Without it, visitors see a plain gradient with the text. Ambient sound needs a click before it starts, because browsers block autoplay audio.
