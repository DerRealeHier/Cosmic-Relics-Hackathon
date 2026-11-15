# Cosmic Relics

Interactive 3D archive of 16 historic NASA spacecraft and instruments left across the Moon, Mars, and deep space. Built with zero external runtime dependencies using custom WebGL2 shaders, official NASA `.glb` geometry, and 22 cited NASA sources.

**Live:** [derrealehier.github.io/Cosmic-Relics-Hackathon](https://derrealehier.github.io/Cosmic-Relics-Hackathon/)

---

## Run Locally

The app loads ES modules and local `.glb` / image assets, so serve it over HTTP rather than `file://`.

```bash
python serve.py --port 8000
```

Then open `http://127.0.0.1:8000/`. On Windows you can also double-click `start_server.bat`.

---

## Realms & Coverage

| Realm | Artifacts | 3D Stage |
| --- | --- | --- |
| **Moon** | 6 missions | Cratered lunar relief sphere (`buildComicReliefSphere('moon')`) with landing-site `(lat, lon)` placement in Full Globe mode |
| **Mars** | 5 missions | Distinct oblate Martian relief sphere (`buildComicReliefSphere('mars')`, Olympus Mons / Valles Marineris) with `(lat, lon)` placement |
| **Universe** | 5 missions | Free-flight deep-space spacecraft stage with orbital trajectory radar map |

---

## Key Features

- **3D Horizon & Full Globe:** Orbit and zoom the 3D scene directly. Hover near the bottom edge (or click **Full Globe**) to center the full Moon or Mars globe with the spacecraft placed at its real landing coordinates; move the cursor into the upper viewport (or toggle **Lower Globe**) to return to the horizon view.
- **3D Spacecraft Component Inspector:** Open **3D Parts** (or click the 3D model) to inspect components in 360°. Selecting a component locks rotation onto that subsystem and highlights it via 3D lighting; clicking it again unlocks free rotation.
- **Narrative, Engineering & Science Tabs:** Each artifact includes an archival NASA photo carousel with lightbox zoom, contextual `*.nasa.gov` hover links, technical mass/dimensions specs, and scientific discoveries.
- **Radar Map & Custom Layout:** Jump between sites via the SVG radar map pins, arrow buttons, or keyboard (`ArrowLeft` / `ArrowRight`). **Customize Layout** lets you drag and resize the Story panel, Radar Map, and 3D stage freely.
- **Official NASA Attribution:** All imagery, mission facts, and 3D models are documented in [SOURCES.md](SOURCES.md) and inside the in-app **NASA Sources (22)** dialog.

---

## Controls

| Action | Input |
| --- | --- |
| Orbit 3D scene | Drag on canvas |
| Zoom 3D scene | Scroll wheel |
| Center Full Globe | Move cursor to bottom edge, or click **Full Globe** |
| Lower Full Globe | Move cursor to upper 25% of viewport, or click **Lower Globe** |
| Inspect 3D parts | Click **3D Parts** or click the 3D spacecraft |
| Switch artifact | Click radar pin, **Previous / Next**, or `←` / `→` keys |

---

## Super Intelligence (SI) Disclosure

- **Code & Data:** Application code, mission metadata structuring, and verification scripts were developed with Super Intelligence (SI) assistance. All mission facts, coordinates, and references are grounded in the 22 official NASA sources listed in [SOURCES.md](SOURCES.md).
- **3D Visuals & Assets:** Official NASA `.glb` spacecraft models (`assets/nasa/models/`) and archival NASA mission photographs are authentic NASA assets (styled with a custom WebGL2 cel-shader, not SI-generated). Procedural 3D planetary relief spheres, canvas surface textures, and procedural fallback spacecraft visuals carry an in-viewport watermark indicating SI-generated procedural visuals.

---

## Project Structure

```text
.
├── index.html          # HUD layout, radar map SVG, modals (Lightbox, Tutorial, 3D Inspector, Sources)
├── styles.css          # Obsidian/charcoal design system, responsive layout, component styles
├── serve.py            # Local static HTTP server with proper MIME types for .glb and ES modules
├── start_server.bat    # Windows launcher for serve.py
├── SOURCES.md          # Complete attribution list of 22 official NASA resources
├── js/
│   ├── app.js          # State management, tabs, carousel, radar pins, layout customizer, coachmarks
│   ├── data.js         # 16 mission entries, NASA inline hover links, and NASA_SOURCES
│   └── moon3d.js       # WebGL2 engine, GLB parser, cel-shaded + outline passes, ModelInspector3D
└── assets/
    ├── nasa/           # Local NASA mission photographs and .glb 3D models
    └── vendor/         # Self-contained font assets
```



> Created by: Philipp P. | Simon P. | Paul K. 
