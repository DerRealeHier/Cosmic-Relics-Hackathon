# Silent Monuments & Voyagers of Space — Official NASA Sources & Startup Guide

This project uses **exclusively official NASA resources** across all three realms (**Moon**, **Mars**, and **Universe / Deep Space**), with zero unverified third-party data. Local 3D models, surface elevation maps, and mission photographs are stored in `assets/nasa/` and documented below and inside the application’s interactive **NASA Sources** modal.

## Running Locally

Because modern browsers block `fetch()` requests for binary 3D `.glb` assets over the `file://` protocol due to CORS security rules, launch the included zero-dependency Python web server:

```powershell
python serve.py
```

The server automatically opens `http://127.0.0.1:8000/index.html` and serves `.glb` files with the proper `model/gltf-binary` MIME type. You can also specify a custom port or suppress auto-opening the browser:

```powershell
python serve.py --port 8080 --no-browser
```

---

## Official NASA Resources Used

### 1. Official NASA 3D Spacecraft Models & Planetary Maps

| Resource / ID | Local Asset | Description & Credits | Official NASA / Upstream Source |
| :--- | :--- | :--- | :--- |
| **NASA Science 3D** | `assets/nasa/models/voyager.glb`<br>`assets/nasa/models/new-horizons.glb` | **Voyager** & **New Horizons** official 3D `.glb` spacecraft models, rendered with real-time WebGL2 comic cel-shading & black ink outlines. | [science.nasa.gov/3d-resources/](https://science.nasa.gov/3d-resources/) ([Voyager](https://science.nasa.gov/resource/voyager-3d-model/)) |
| **NASA-3D-Resources** | `assets/nasa/models/apollo-lunar-module.glb`<br>`assets/nasa/models/viking-lander.glb`<br>`assets/nasa/models/opportunity-mer.glb`<br>`assets/nasa/models/insight-lander.glb`<br>`assets/nasa/models/ingenuity-helicopter.glb`<br>`assets/nasa/models/pioneer10.glb`<br>`assets/nasa/models/cassini-huygens.glb` | Official NASA JPL / JSC 3D hardware `.glb` models converted in-browser to comic cel-shaded meshes with part-level ink outlines. | [github.com/nasa/NASA-3D-Resources](https://github.com/nasa/NASA-3D-Resources) |
| **NASA SVS 4720** | `assets/nasa/svs-4720/lroc_color_2k.jpg` | **CGI Moon Kit** — LROC Hapke Normalized WAC Color Mosaic (`lroc_color_2k.jpg`) used in the Apollo 11 orbital gallery. NASA SVS / Ernie Wright (GSFC); LROC Instrument Team. | [svs.gsfc.nasa.gov/4720](https://svs.gsfc.nasa.gov/4720) ([Color 2K](https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg)) |
| **Google Draco (Apache-2.0)** | `assets/vendor/draco/draco_decoder_gltf.js`<br>`assets/vendor/draco/draco_decoder_gltf.wasm` | Official Google Draco v1.5.7 WebAssembly glTF decoder bundled locally for offline decoding of Draco-compressed NASA `.glb` models. | [github.com/google/draco](https://github.com/google/draco) |

---

### 2. Local NASA Mission Imagery (`assets/nasa/missions/`)

| NASA ID | Mission | Local File | Credits | Official NASA Source |
| :--- | :--- | :--- | :--- | :--- |
| **as11-40-5948** | Apollo 11 "Eagle" & EASEP (1969) | `assets/nasa/missions/apollo11-easep-as11-40-5948.jpg` | NASA / Johnson Space Center (JSC) | [images.nasa.gov/details/as11-40-5948](https://images.nasa.gov/details/as11-40-5948) |
| **AS12-48-7133** | Surveyor 3 & Apollo 12 (1967 / 1969) | `assets/nasa/missions/apollo12-surveyor3-as12-48-7133.jpg` | NASA / Johnson Space Center (JSC) | [images.nasa.gov/details/AS12-48-7133](https://images.nasa.gov/details/AS12-48-7133) |
| **as15-85-11471** | Apollo 15 LRV-1 & ALSEP (1971) | `assets/nasa/missions/apollo15-alsep-as15-85-11471.jpg` | NASA / Johnson Space Center (JSC) | [images.nasa.gov/details/as15-85-11471](https://images.nasa.gov/details/as15-85-11471) |
| **as16-114-18439** | Apollo 16 Far-UV Observatory S-201 (1972) | `assets/nasa/missions/apollo16-uvcam-as16-114-18439.jpg` | NASA / Johnson Space Center (JSC) | [images.nasa.gov/details/as16-114-18439](https://images.nasa.gov/details/as16-114-18439) |
| **as17-137-20979** | Apollo 17 LRV-3 Fender Repair (1972) | `assets/nasa/missions/apollo17-lrv-as17-137-20979.jpg` | NASA / Johnson Space Center (JSC) | [images.nasa.gov/details/as17-137-20979](https://images.nasa.gov/details/as17-137-20979) |
| **NASA SVS 10686** | LCROSS South Pole Impact (2009) | `assets/nasa/missions/lcross-svs-10686.jpg` | NASA GSFC Scientific Visualization Studio / LRO | [svs.gsfc.nasa.gov/10686](https://svs.gsfc.nasa.gov/10686) |
| **CLPS Blue Ghost M1** | Blue Ghost M1 at Mare Crisium (2025) | `assets/nasa/missions/blueghost-mare-crisium.jpg` | NASA / Firefly Aerospace | [science.nasa.gov/lunar-science/clps-deliveries/to19d-firefly/](https://science.nasa.gov/lunar-science/clps-deliveries/to19d-firefly/) |
| **PIA02975** | Ranger 7 (1964) | `assets/nasa/missions/ranger7-pia02975.jpg` | NASA / Jet Propulsion Laboratory (JPL) | [images.nasa.gov/details/PIA02975](https://images.nasa.gov/details/PIA02975) |
| **PIA02976** | Surveyor 1 (1966) | `assets/nasa/missions/surveyor1-pia02976.jpg` | NASA / Jet Propulsion Laboratory (JPL) | [images.nasa.gov/details/PIA02976](https://images.nasa.gov/details/PIA02976) |
| **as14-66-09277** | Apollo 14 Antares & MET (1971) | `assets/nasa/missions/apollo14-lm-as14-66-09277.jpg` | NASA / Johnson Space Center (JSC) | [images.nasa.gov/details/as14-66-09277](https://images.nasa.gov/details/as14-66-09277) |
| **PIA13965** | GRAIL Ebb & Flow (2012) | `assets/nasa/missions/grail-pia13965.jpg` | NASA / JPL-Caltech | [images.nasa.gov/details/PIA13965](https://images.nasa.gov/details/PIA13965) |
| **GSFC_20171208_Archive_e001395** | LADEE (2014) | `assets/nasa/missions/ladee-gsfc-e001395.jpg` | NASA / GSFC & Ames Research Center | [images.nasa.gov/details/GSFC_20171208_Archive_e001395](https://images.nasa.gov/details/GSFC_20171208_Archive_e001395) |
| **LRO-NAC M1463440322L** | CLPS TO2-IM Odysseus (2024) | `assets/nasa/missions/odysseus-nova-c.png` | NASA / GSFC / Arizona State University (LROC) | [science.nasa.gov/lunar-science/clps-deliveries/to2-im/](https://science.nasa.gov/lunar-science/clps-deliveries/to2-im/) |
| **PIA00381** | Viking 1 Lander on Chryse Planitia (1976) | `assets/nasa/missions/viking1-pia00381.jpg` | NASA / Jet Propulsion Laboratory (JPL) | [images.nasa.gov/details/PIA00381](https://images.nasa.gov/details/PIA00381) |
| **PIA01122** | Mars Pathfinder & Sojourner Rover (1997) | `assets/nasa/missions/sojourner-pia01122.jpg` | NASA / Jet Propulsion Laboratory (JPL) | [images.nasa.gov/details/PIA01122](https://images.nasa.gov/details/PIA01122) |
| **PIA19142** | Opportunity Rover at Endeavour Crater | `assets/nasa/missions/opportunity-pia19142.jpg` | NASA / JPL-Caltech / Cornell / ASU | [images.nasa.gov/details/PIA19142](https://images.nasa.gov/details/PIA19142) |
| **PIA25287** | InSight Lander on Elysium Planitia | `assets/nasa/missions/insight-pia25287.jpg` | NASA / JPL-Caltech | [images.nasa.gov/details/PIA25287](https://images.nasa.gov/details/PIA25287) |
| **PIA26243** | Ingenuity Mars Helicopter in Jezero Crater | `assets/nasa/missions/ingenuity-pia26243.jpg` | NASA / JPL-Caltech / ASU / MSSS | [images.nasa.gov/details/PIA26243](https://images.nasa.gov/details/PIA26243) |
| **ARC-1973-AC73-9279** | Pioneer 10 Deep Space Probe | `assets/nasa/missions/pioneer10-arc-1973-ac73-9279.jpg` | NASA / Ames Research Center | [images.nasa.gov/details/ARC-1973-AC73-9279](https://images.nasa.gov/details/ARC-1973-AC73-9279) |
| **PIA21741** | Voyager Golden Record & Interstellar Mission | `assets/nasa/missions/voyager-record-pia21741.jpg` | NASA / JPL-Caltech | [images.nasa.gov/details/PIA21741](https://images.nasa.gov/details/PIA21741) |
| **PIA17046** | Voyager 2 Grand Tour Spacecraft | `assets/nasa/missions/voyager2-pia17046.jpg` | NASA / JPL-Caltech | [images.nasa.gov/details/PIA17046](https://images.nasa.gov/details/PIA17046) |
| **PIA07232** | Cassini–Huygens Touchdown on Saturn's Moon Titan | `assets/nasa/missions/huygens-pia07232.jpg` | NASA / JPL / ESA / University of Arizona | [images.nasa.gov/details/PIA07232](https://images.nasa.gov/details/PIA07232) |
| **PIA19952** | New Horizons Flyby of Pluto & Sputnik Planitia | `assets/nasa/missions/newhorizons-pia19952.jpg` | NASA / JHUAPL / SwRI | [images.nasa.gov/details/PIA19952](https://images.nasa.gov/details/PIA19952) |

---

### 3. Official NASA Mission & Coordinate References (16 Featured Artifacts)

All mission narratives, technical specifications, surface survival notes, and coordinates in `js/data.js` are sourced from official NASA mission pages and the NASA Space Science Data Coordinated Archive (NSSDCA):

#### Realm 1: Moon (`realm: 'moon'`)
1. **Apollo 11 ("Eagle" & Laser Retroreflector)**: [nasa.gov/mission/apollo-11/](https://www.nasa.gov/mission/apollo-11/) · [Lunar Laser Ranging](https://science.nasa.gov/mission/apollo/lunar-laser-ranging/)
2. **Surveyor 3 & Apollo 12 ("Intrepid")**: [nasa.gov/mission/apollo-12/](https://www.nasa.gov/mission/apollo-12/) · [science.nasa.gov/mission/surveyor-3/](https://science.nasa.gov/mission/surveyor-3/)
3. **Apollo 15 (Rover LRV-1 & "Falcon")**: [nasa.gov/mission/apollo-15/](https://www.nasa.gov/mission/apollo-15/)
4. **Apollo 16 (Far-UV Observatory S-201 & "Orion")**: [nasa.gov/mission/apollo-16/](https://www.nasa.gov/mission/apollo-16/)
5. **Apollo 17 (Rover LRV-3 & "Challenger")**: [nasa.gov/mission/apollo-17/](https://www.nasa.gov/mission/apollo-17/)
6. **LCROSS & CLPS Blue Ghost M1**: [science.nasa.gov/mission/lcross/](https://science.nasa.gov/mission/lcross/) · [science.nasa.gov/lunar-science/clps-deliveries/to19d-firefly/](https://science.nasa.gov/lunar-science/clps-deliveries/to19d-firefly/)

#### Realm 2: Mars (`realm: 'mars'`)
7. **Viking 1 Lander (Thomas Mutch Memorial Station, Chryse Planitia)**: [science.nasa.gov/mission/viking-1/](https://science.nasa.gov/mission/viking-1/)
8. **Mars Pathfinder & Sojourner Rover (Carl Sagan Memorial Station, Ares Vallis)**: [science.nasa.gov/mission/mars-pathfinder/](https://science.nasa.gov/mission/mars-pathfinder/)
9. **Opportunity Rover (MER-B, Meridiani Planum & Endeavour Crater)**: [science.nasa.gov/mission/mer-opportunity/](https://science.nasa.gov/mission/mer-opportunity/)
10. **InSight Geophysical Lander (Elysium Planitia)**: [science.nasa.gov/mission/insight/](https://science.nasa.gov/mission/insight/)
11. **Ingenuity Mars Helicopter ("Ginny", Jezero Crater)**: [science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/)

#### Realm 3: Universe / Deep Space (`realm: 'universe'`)
12. **Pioneer 10 (Asteroid Belt, Jupiter & Aldebaran Trajectory)**: [science.nasa.gov/mission/pioneer-10/](https://science.nasa.gov/mission/pioneer-10/)
13. **Voyager 1 & The Golden Record (Interstellar Space, Ophiuchus)**: [science.nasa.gov/mission/voyager/voyager-1/](https://science.nasa.gov/mission/voyager/voyager-1/)
14. **Voyager 2 Grand Tour (Jupiter, Saturn, Uranus, Neptune & Interstellar Space)**: [science.nasa.gov/mission/voyager/voyager-2/](https://science.nasa.gov/mission/voyager/voyager-2/)
15. **Cassini–Huygens (Saturn System & Shangri-La Touchdown on Titan)**: [science.nasa.gov/mission/cassini/](https://science.nasa.gov/mission/cassini/)
16. **New Horizons (Pluto’s Sputnik Planitia & Kuiper Belt Object Arrokoth)**: [science.nasa.gov/mission/new-horizons/](https://science.nasa.gov/mission/new-horizons/)
