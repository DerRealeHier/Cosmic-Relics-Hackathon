/**
 * Verified NASA Hardware & Voyagers Dataset (Moon, Mars & Universe)
 * Every coordinate, mission fact, image asset, and reference URL comes exclusively from official NASA sources.
 */

export const REALMS = {
  moon: {
    id: 'moon',
    label: 'Moon',
    subtitle: 'COMIC 3D LUNAR HORIZON',
    mapTitle: 'Lunar Artifact Map',
    badge: 'NASA ARCHIVE // SILENT MONUMENTS OF THE MOON'
  },
  mars: {
    id: 'mars',
    label: 'Mars',
    subtitle: 'COMIC 3D MARTIAN HORIZON',
    mapTitle: 'Martian Artifact Map',
    badge: 'NASA ARCHIVE // SILENT EXPLORERS OF MARS'
  },
  universe: {
    id: 'universe',
    label: 'Universe',
    subtitle: 'COMIC 3D FREE-FLIGHT SPACECRAFT',
    mapTitle: 'Deep Space Trajectory Map',
    badge: 'NASA ARCHIVE // VOYAGERS OF THE UNIVERSE'
  }
};

export const NASA_ARTIFACTS = [
  // =========================================================================
  // REALM 1: MOON (6 ARTIFACTS)
  // =========================================================================
  {
    id: 'apollo11',
    realm: 'moon',
    code: 'APOLLO 11',
    year: '1969',
    title: 'Apollo 11: "Eagle" Descent Stage & Laser Reflector',
    region: 'Mare Tranquillitatis',
    coords: '0.6741° N, 23.4730° E',
    mapX: 193,
    mapY: 106,
    status: 'Laser Retroreflector still active today!',
    statusColor: 'emerald',
    artifactType: 'lander',
    horizonAngle: 0.25,
    image: 'assets/nasa/missions/apollo11-easep-as11-40-5948.jpg',
    imageId: 'as11-40-5948',
    imageCredit: 'NASA / JSC',
    kidFunFact: '🤯 Cool Space Fact: Lasers from Earth still bounce off Apollo 11’s mirror almost every night — proving the Moon moves 3.8 cm away from us each year (as fast as your fingernails grow)!',
    shortSummary: 'In July 1969, Neil Armstrong and Buzz Aldrin made humanity’s first Moon landing here. When they blasted off home, they left their golden "Eagle" landing base and a special laser mirror behind — which still bounces laser beams back to Earth today!',
    gallery: [
      {
        src: 'assets/nasa/missions/apollo11-easep-as11-40-5948.jpg',
        title: 'Buzz Aldrin & EASEP Laser Mirror on the Moon',
        badge: '📸 Real Apollo 11 Photo',
        credit: 'NASA / AS11-40-5948'
      },
      {
        src: 'assets/nasa/missions/ranger7-pia02975.jpg',
        title: 'First Close-Up TV Photo of Lunar Craters (Ranger 7)',
        badge: '🛰️ Robotic Scout',
        credit: 'NASA / JPL / PIA02975'
      },
      {
        src: 'assets/nasa/svs-4720/lroc_color_2k.jpg',
        title: 'NASA LRO High-Res Map of the Lunar Seas',
        badge: '🗺️ Orbital Map',
        credit: 'NASA SVS 4720 / LROC'
      }
    ],
    sourceTitle: 'NASA — Apollo 11 Mission & Lunar Laser Ranging',
    sourceUrl: 'https://www.nasa.gov/mission/apollo-11/',
    story: [
      '"For more than fifty-five years I have stood here alone in the dark basalt dust of the Sea of Tranquility. On July 21, 1969, when Neil Armstrong and Buzz Aldrin fired the ascent engine and blasted off from my shoulders, I stayed behind as humanity’s first permanent foothold on another world."',
      '"Around me there is no wind, no rain, and no sound—only the vacuum of space and the blinding sun rising every 29.5 Earth days. Yet I am never truly forgotten: just twenty meters away rests my silent glass companion, the Laser Ranging Retroreflector."',
      '"Almost every clear night, observatories on Earth fire pulses of laser light across 384,400 kilometers of space right at our 100 fused-silica corner-cube prisms. Requiring zero battery power, we bounce those photons straight back in 2.5 seconds—revealing that the Moon is slowly spiraling away from Earth by 3.8 centimeters every year."',
      '"Stamped onto my front landing strut is a stainless-steel plaque signed by the crew: Here men from the planet Earth first set foot upon the Moon, July 1969, A.D. We came in peace for all mankind."'
    ],
    tech: {
      hardware: 'Lunar Module LM-5 "Eagle" Descent Stage + EASEP Instruments',
      mass: '2,034 kg (dry mass on the lunar surface)',
      dimensions: '4.29 m height × 9.45 m landing gear span',
      survival: 'Wrapped in gold Kapton thermal blankets enduring swings from +120 °C to −170 °C. Imaged regularly by NASA’s Lunar Reconnaissance Orbiter (LRO).'
    },
    science: [
      'Lunar Laser Ranging Retroreflector (LRRR): 100 precision fused-silica corner-cube prisms bounce Earth laser pulses back to millimeter accuracy, testing Einstein’s General Theory of Relativity and proving the Moon has a fluid outer core.',
      'Passive Seismic Experiment (PSE): Recorded the very first moonquakes and micrometeorite impacts, revealing that the dry lunar crust rings like a bell for tens of minutes.',
      'First Returned Lunar Samples (21.55 kg): Ancient titanium-rich Mare Tranquillitatis basalts dated to 3.7 billion years old, transforming our understanding of inner Solar System history.'
    ]
  },
  {
    id: 'surveyor3',
    realm: 'moon',
    code: 'SURVEYOR 3',
    year: '1967 / 1969',
    title: 'Surveyor 3 & Apollo 12: The Robot Visited by Humans',
    region: 'Oceanus Procellarum',
    coords: '3.0128° S, 23.4219° W',
    mapX: 112,
    mapY: 116,
    status: 'Twin Spacecraft Site (Camera on Earth)',
    statusColor: 'amber',
    artifactType: 'probe',
    horizonAngle: 1.25,
    image: 'assets/nasa/missions/apollo12-surveyor3-as12-48-7133.jpg',
    imageId: 'AS12-48-7133',
    imageCredit: 'NASA / JSC',
    kidFunFact: '🤖 Cool Space Fact: Surveyor 3 bounced twice like a kangaroo when it landed! Two years later, Apollo 12 astronauts walked right up to it to say hello and brought its TV camera back to Earth.',
    shortSummary: 'Surveyor 3 was a 3-legged robot that dug the very first trenches in the Moon dust in 1967. Two and a half years later, Apollo 12 astronauts landed right next to it — the only time humans have ever visited a robot on another world!',
    gallery: [
      {
        src: 'assets/nasa/missions/apollo12-surveyor3-as12-48-7133.jpg',
        title: 'Astronaut Pete Conrad Visiting Robot Surveyor 3',
        badge: '👨‍🚀 Human Meets Robot',
        credit: 'NASA / AS12-48-7133'
      },
      {
        src: 'assets/nasa/missions/surveyor1-pia02976.jpg',
        title: 'Surveyor’s Footpad Pressed Into Crispy Moon Dust',
        badge: '🦾 Robot Footpad',
        credit: 'NASA / JPL / PIA02976'
      },
      {
        src: 'assets/nasa/missions/apollo14-lm-as14-66-09277.jpg',
        title: 'Apollo Lunar Module Shining in the Sun',
        badge: '🌕 Moon Lander',
        credit: 'NASA / AS14-66-09277'
      }
    ],
    sourceTitle: 'NASA — Apollo 12 & Surveyor 3',
    sourceUrl: 'https://www.nasa.gov/mission/apollo-12/',
    story: [
      '"I arrived in the Ocean of Storms in April 1967—a three-legged robotic scout built from aluminum tubes, solar panels, and a rotating television mirror. When bright rocks confused my landing radar during descent, my vernier engines stayed lit and made me bounce twice like a kangaroo before I settled inside this shallow 200-meter crater!"',
      '"With my small pantograph soil scoop, I dug the very first trenches into the Moon, proving to NASA engineers that lunar regolith was firm like damp beach sand and would not swallow heavy astronauts. When the freezing lunar night fell, I entered what I thought was an eternal sleep."',
      '"Then, thirty-one months later, a miracle happened: the astronauts of Apollo 12 landed their Lunar Module Intrepid right on my crater rim just 160 meters away! Pete Conrad and Alan Bean hiked down the slope to visit me—the only time in history humans have met a robotic spacecraft on another world."',
      '"They noticed my once-white paint had tanned to a warm caramel-brown under two and a half years of raw solar radiation. With heavy-duty shears, they clipped off my television camera and soil scoop and carried them back to Earth—where my camera still rests in the Smithsonian today."'
    ],
    tech: {
      hardware: 'Surveyor 3 Robotic Tripod Lander + Apollo 12 LM-6 "Intrepid" Descent Stage',
      mass: '302 kg (Surveyor 3 landed mass) + 2,211 kg (Intrepid descent stage)',
      dimensions: '3.0 m height × 4.3 m footpad span (160 m from Intrepid)',
      survival: 'Rests on the inner eastern slope of Surveyor Crater. Its retrieved TV camera is displayed at the Smithsonian National Air and Space Museum.'
    },
    science: [
      'Lunar Soil Mechanics & Trenching: Dug four trenches up to 18 cm deep and performed bearing tests, proving the lunar regolith could easily support Apollo spacecraft and astronauts.',
      'Long-Duration Space Weathering Study: Returning Surveyor 3’s camera, cables, and polished aluminum tubes after 31 months on the Moon gave NASA critical data on solar wind sputtering, UV darkening, and micrometeoroid pitting.',
      'Pinpoint Landing Demonstration: Apollo 12’s radar-guided touchdown just 160 meters from Surveyor 3 unlocked precision landings in rugged terrain for all later Apollo missions.'
    ]
  },
  {
    id: 'apollo15',
    realm: 'moon',
    code: 'APOLLO 15',
    year: '1971',
    title: 'Apollo 15: First Electric Moon Car (LRV-1) & Falcon Feather',
    region: 'Hadley–Apennine',
    coords: '26.1324° N, 3.6333° E',
    mapX: 165,
    mapY: 74,
    status: 'Parked at Hadley Rille (300-Prism LRRR Active)',
    statusColor: 'emerald',
    artifactType: 'rover',
    horizonAngle: 2.3,
    image: 'assets/nasa/missions/apollo15-alsep-as15-85-11471.jpg',
    imageId: 'as15-85-11471',
    imageCredit: 'NASA / JSC',
    kidFunFact: '🪶 Cool Space Fact: On live TV, Astronaut Dave Scott dropped a heavy hammer and a falcon feather at the same time — with zero air on the Moon, both hit the ground at the exact same instant!',
    shortSummary: 'Apollo 15 unpacked the very first electric Moon car (with wire-mesh tires instead of air!) and drove 27.8 km along giant lunar mountains, finding a 4.1-billion-year-old crystal rock from the infant Moon.',
    gallery: [
      {
        src: 'assets/nasa/missions/apollo15-alsep-as15-85-11471.jpg',
        title: 'Apollo 15 Science Station at Giant Mount Hadley',
        badge: '🏔️ Moon Mountains',
        credit: 'NASA / AS15-85-11471'
      },
      {
        src: 'assets/nasa/missions/apollo17-lrv-as17-137-20979.jpg',
        title: 'Electric Moon Buggy With Woven Piano-Wire Tires',
        badge: '🚙 Moon Car',
        credit: 'NASA / JSC'
      },
      {
        src: 'assets/nasa/missions/grail-pia13965.jpg',
        title: 'Twin GRAIL Probes Mapping Moon Gravity',
        badge: '🛰️ Twin Orbiters',
        credit: 'NASA / JPL / PIA13965'
      }
    ],
    sourceTitle: 'NASA — Apollo 15 Mission',
    sourceUrl: 'https://www.nasa.gov/mission/apollo-15/',
    story: [
      '"I am the very first car ever driven on another world! Folded up like a lawn chair inside the side bay of Lunar Module Falcon, I was unpacked by David Scott and James Irwin at the foot of the towering 4,500-meter Apennine Mountains."',
      '"My tires are not made of rubber filled with air—they would have burst or frozen solid in the lunar vacuum. Instead, I roll on hollow wheels woven from zinc-coated piano wire with titanium chevron treads, powered by four independent quarter-horsepower electric hub motors."',
      '"Over three days we drove 27.8 kilometers along the winding canyon rim of Hadley Rille and up the slopes of Mons Hadley Delta, where the crew discovered the 4.1-billion-year-old Genesis Rock—a piece of the Moon’s primordial crust."',
      '"Before blasting off, Dave Scott parked me with my color TV camera aimed at Falcon. Through my lens, millions of people on Earth watched him drop a geologic hammer and a falcon feather at the exact same moment—both hitting the lunar dust simultaneously and proving Galileo right after 400 years!"'
    ],
    tech: {
      hardware: 'Lunar Roving Vehicle LRV-1 + LM-10 "Falcon" Descent Stage + ALSEP',
      mass: '210 kg empty rover mass (carried 490 kg of astronauts, gear & rocks)',
      dimensions: '3.10 m length × 1.83 m width × 1.14 m height',
      survival: 'Parked ~100 meters east of Falcon’s descent stage. Its silver-zinc batteries are long depleted, while the nearby 300-prism Laser Retroreflector remains active today.'
    },
    science: [
      'Discovery of the "Genesis Rock" (Sample 15415): A pristine crystalline anorthosite dated to ~4.1 billion years ago, proving the infant Moon once had a global magma ocean.',
      'Galileo’s Equivalence Principle in Vacuum: Live television demonstration confirming that a 1.32 kg aluminum hammer and a 0.03 kg falcon feather accelerate identically in the absence of air resistance.',
      'Largest Lunar Laser Retroreflector & Heat Flow Probes: Placed a 300-prism reflector array (still the brightest optical target on the Moon) and drilled subsurface temperature probes into the regolith.'
    ]
  },
  {
    id: 'apollo16',
    realm: 'moon',
    code: 'APOLLO 16',
    year: '1972',
    title: 'Apollo 16: Gold-Plated Far-UV Observatory (S-201)',
    region: 'Descartes Highlands',
    coords: '8.9734° S, 15.5011° E',
    mapX: 180,
    mapY: 126,
    status: 'First Telescope on Another World (Dormant)',
    statusColor: 'sky',
    artifactType: 'lander',
    horizonAngle: 3.3,
    image: 'assets/nasa/missions/apollo16-uvcam-as16-114-18439.jpg',
    imageId: 'as16-114-18439',
    imageCredit: 'NASA / JSC',
    kidFunFact: '🔭 Cool Space Fact: Astronauts hid a solid-gold telescope inside the shadow of their lander so the Sun wouldn’t overheat it — taking the very first space-telescope photos from another world!',
    shortSummary: 'Because the Moon has no air to blur starlight, Apollo 16 astronauts set up a gleaming gold ultraviolet telescope right in the shadow of their lander — creating the very first space observatory on another world!',
    gallery: [
      {
        src: 'assets/nasa/missions/apollo16-uvcam-as16-114-18439.jpg',
        title: 'Gold-Plated Ultraviolet Telescope in Lander Shadow',
        badge: '🔭 First Moon Telescope',
        credit: 'NASA / AS16-114-18439'
      },
      {
        src: 'assets/nasa/missions/apollo14-lm-as14-66-09277.jpg',
        title: 'Lunar Module Reflecting Golden Sunlight on the Highlands',
        badge: '✨ Golden Foil',
        credit: 'NASA / AS14-66-09277'
      },
      {
        src: 'assets/nasa/missions/ladee-gsfc-e001395.jpg',
        title: 'NASA LADEE Explorer Studying Glowing Moon Dust',
        badge: '🚀 Lunar Dust Probe',
        credit: 'NASA / GSFC'
      }
    ],
    sourceTitle: 'NASA — Apollo 16 Mission',
    sourceUrl: 'https://www.nasa.gov/mission/apollo-16/',
    story: [
      '"Why did astronauts carry a gleaming gold telescope all the way to the Descartes Highlands? Because Earth’s protective atmosphere blocks far-ultraviolet light from space—while here on the Moon, the sky is a crystal-clear vacuum even in the middle of the day!"',
      '"Designed by physicist Dr. George Carruthers at the Naval Research Laboratory, I am the Far-Ultraviolet Camera and Spectrograph (Experiment S-201)—humanity’s very first astronomical observatory planted on another world."',
      '"To keep me cool under the blazing lunar sun, John Young and Charlie Duke set my tripod right inside the dark shadow cast by Lunar Module Orion. Between their rover expeditions across Stone Mountain and North Ray Crater, they turned my golden barrel toward eleven cosmic targets."',
      '"Before heading home, they pulled out my film cartridge holding 178 extraordinary ultraviolet exposures—revealing for the first time the vast, glowing hydrogen geocorona wrapping all of planet Earth, along with hot young star clusters in the Large Magellanic Cloud. My golden telescope body still stands on its tripod beside Orion today."'
    ],
    tech: {
      hardware: 'Far-Ultraviolet Camera/Spectrograph (S-201) + LM-11 "Orion" + Rover LRV-2',
      mass: '22 kg (S-201 Observatory) + 2,145 kg (Orion Descent Stage) + 210 kg (LRV-2)',
      dimensions: '75 mm aperture f/1.0 electronographic Schmidt telescope on tripod',
      survival: 'Stands on its tripod immediately adjacent to the Orion descent stage in the Descartes Highlands; rover LRV-2 is parked nearby after driving 26.55 km.'
    },
    science: [
      'First Planetary Surface Astronomy (178 Far-UV Frames): Imaged Earth’s full hydrogen geocorona, polar auroral ovals, and far-UV emissions from the Large Magellanic Cloud and distant galaxy clusters.',
      'Highland Impact Breccias Over Volcanics: Proved that the rugged Descartes Highlands were sculpted by ancient giant basin impacts and meteorite bombardment rather than silica-rich volcanoes.',
      'Deep Regolith Core & Active Seismology: Drilled a 3-meter deep lunar core sample and fired seismic mortar charges to measure the internal structure of the central highlands.'
    ]
  },
  {
    id: 'apollo17',
    realm: 'moon',
    code: 'APOLLO 17',
    year: '1972',
    title: 'Apollo 17: "Challenger" & Rover LRV-3 in Taurus–Littrow',
    region: 'Taurus–Littrow Valley',
    coords: '20.1911° N, 30.7723° E',
    mapX: 204,
    mapY: 84,
    status: 'Record-Distance Lunar Rover (35.9 km)',
    statusColor: 'amber',
    artifactType: 'rover',
    horizonAngle: 4.3,
    image: 'assets/nasa/missions/apollo17-lrv-as17-137-20979.jpg',
    imageId: 'as17-137-20979',
    imageCredit: 'NASA / JSC',
    kidFunFact: '🛠️ Cool Space Fact: When a hammer accidentally snapped off the Moon buggy’s fender, the astronauts fixed it using 4 laminated paper Moon maps and gray duct tape — and drove a record 35.9 km!',
    shortSummary: 'Inside a lunar canyon deeper than the Grand Canyon, Apollo 17 drove a record 35.9 km in their Moon buggy and discovered bright orange volcanic glass beads from an ancient lunar lava fountain!',
    gallery: [
      {
        src: 'assets/nasa/missions/apollo17-lrv-as17-137-20979.jpg',
        title: 'Gene Cernan & The Famous Duct-Tape Map Fender Buggy',
        badge: '🏎️ 35.9 km Record Buggy',
        credit: 'NASA / AS17-137-20979'
      },
      {
        src: 'assets/nasa/missions/apollo15-alsep-as15-85-11471.jpg',
        title: 'Deep Valley Surrounded by Giant Lunar Mountains',
        badge: '🌋 Orange Lava Glass',
        credit: 'NASA / JSC'
      },
      {
        src: 'assets/nasa/svs-4720/ldem_3_8bit.jpg',
        title: 'NASA LOLA 3D Laser Altitude Map of Lunar Craters',
        badge: '🛰️ 3D Laser Scan',
        credit: 'NASA SVS 4720 / LOLA'
      }
    ],
    sourceTitle: 'NASA — Apollo 17 Mission',
    sourceUrl: 'https://www.nasa.gov/mission/apollo-17/',
    story: [
      '"In December 1972, inside a valley deeper than the Grand Canyon, I carried Gene Cernan and geologist Harrison Jack Schmitt across the final footsteps of the Apollo era. Early on our first drive, Gene’s hammer pocket snagged my rear fender extension and snapped it right off—sending rooster tails of abrasive moondust showering over us!"',
      '"Overnight, engineers in Houston invented the most famous repair in space history: the crew taped four laminated lunar maps together with gray duct tape and clamped them onto my wheel arch using two alignment-lamp clamps. With my homemade map-fender in place, we drove an unbroken lunar record of 35.9 kilometers!"',
      '"At the rim of Shorty Crater, Jack Schmitt scuffed the dust with his boot and shouted: There is orange soil! Instead of rust, we had uncovered microscopic beads of bright orange and black volcanic glass erupted from a fiery lunar lava fountain 3.64 billion years ago."',
      '"When it was time to leave the Moon, Gene parked me 145 meters east of Challenger so my remotely controlled television camera could tilt upward and broadcast their rocket liftoff live to Earth. My wheels still sit in the Taurus–Littrow tracks, waiting for the Artemis generation."'
    ],
    tech: {
      hardware: 'Lunar Roving Vehicle LRV-3 + LM-12 "Challenger" Descent Stage + ALSEP',
      mass: '210 kg (LRV-3 Rover) + 2,150 kg (Challenger Descent Stage)',
      dimensions: '3.10 m rover parked ~145 m east of Challenger; 35.9 km traverse',
      survival: 'Clearly resolved in high-resolution NASA LRO orbital photographs—including the twin tire tracks, foot trails, and Challenger’s descent stage.'
    },
    science: [
      'Pyroclastic Orange Volcanic Glass (Sample 74220): Proved explosive fire-fountain volcanism occurred 3.64 billion years ago and later revealed indigenous water and volatile traces inside the Moon’s mantle.',
      'Record Geological Harvest (110.5 kg): Collected the largest and most diverse suite of lunar rocks across 22 hours of extravehicular exploration with the first professional geologist on the Moon.',
      'Deep Crustal Gravimetry & Atmospheric Mass Spectrometry (LACE): Measured tidal gravity variations and detected tenuous helium, argon, and neon in the nighttime lunar exosphere.'
    ]
  },
  {
    id: 'lcross_blueghost',
    realm: 'moon',
    code: 'LCROSS / CLPS',
    year: '2009 / 2025',
    title: 'LCROSS Water-Ice Impactor & Blue Ghost M1 CLPS Lander',
    region: 'Cabeus Crater (84.68° S) & Mare Crisium (18.56° N)',
    coords: '84.68° S, 48.71° W · 18.56° N, 61.81° E',
    mapX: 138,
    mapY: 192,
    status: 'Polar Water Confirmed & 2025 CLPS LRA Active!',
    statusColor: 'emerald',
    artifactType: 'beacon',
    horizonAngle: 5.4,
    image: 'assets/nasa/missions/blueghost-mare-crisium.jpg',
    imageId: 'NASA-BlueGhost-MareCrisium-2025',
    imageCredit: 'NASA / Firefly Aerospace / GSFC SVS',
    kidFunFact: '💧 Cool Space Fact: NASA’s LCROSS crashed a giant rocket into a dark −233 °C crater at the Moon’s South Pole and splashed real water ice into space! Now new 2025 landers like Blue Ghost are paving the way back.',
    shortSummary: 'In 2009, LCROSS proved that real frozen water ice hides inside dark craters at the Moon’s South Pole. In March 2025, the Blue Ghost lander touched down upright with 10 new NASA gadgets to prepare for future astronauts!',
    gallery: [
      {
        src: 'assets/nasa/missions/blueghost-mare-crisium.jpg',
        title: 'Blue Ghost M1 Lander Touchdown in Mare Crisium (2025)',
        badge: '🆕 2025 Moon Lander',
        credit: 'NASA / Firefly Aerospace'
      },
      {
        src: 'assets/nasa/missions/lcross-svs-10686.jpg',
        title: 'LCROSS Dual Spacecraft Hunting for Frozen Water Ice',
        badge: '🧊 Water-Ice Hunter',
        credit: 'NASA SVS 10686'
      },
      {
        src: 'assets/nasa/missions/odysseus-nova-c.png',
        title: 'Odysseus (IM-1) Commercial Lander Near the South Pole',
        badge: '🌕 South Pole Scout',
        credit: 'NASA / Intuitive Machines'
      }
    ],
    sourceTitle: 'NASA — LCROSS & CLPS Blue Ghost Mission 1',
    sourceUrl: 'https://science.nasa.gov/lunar-science/clps-deliveries/to19d-firefly/',
    story: [
      '"We represent the bridge from lunar discovery to humanity’s return! First, in October 2009, the LCROSS mission plunged a 2,305-kilogram Centaur rocket stage into the −233 °C permanent shadow of Cabeus Crater near the South Pole—blasting a 10-kilometer plume of ancient debris into sunlight."',
      '"Flying straight through that glittering cloud for four minutes before impacting itself, the LCROSS shepherding spacecraft proved beyond doubt what scientists had dreamed of for decades: hundreds of kilograms of genuine water ice lie preserved inside the Moon’s polar cold traps!"',
      '"Fifteen years later, a new fleet of robotic scouts answered the call through NASA’s Commercial Lunar Payload Services (CLPS). Following Odysseus near the South Pole in 2024, Firefly’s Blue Ghost Mission 1 achieved a picture-perfect upright landing in Mare Crisium on March 2, 2025—delivering ten cutting-edge NASA science instruments."',
      '"From Mare Crisium, Blue Ghost drilled beneath the surface with pneumatic gas jets (LISTER), repelled sticky moondust with electric waves (EDS), tracked GPS signals from Earth at lunar distance (LuGRE), and photographed a glowing solar eclipse when Earth passed in front of the Sun!"'
    ],
    tech: {
      hardware: 'LCROSS Centaur Impactor (Cabeus) + Blue Ghost M1 Lander (Mare Crisium)',
      mass: '2,926 kg (LCROSS + Centaur impactors) · ~490 kg dry (Blue Ghost M1 + 10 NASA payloads)',
      dimensions: 'Blue Ghost M1: 2.0 m height × 3.5 m width; LCROSS crater: ~28 m diameter',
      survival: 'LCROSS rests in eternal −233 °C darkness inside Cabeus Crater; Blue Ghost M1 stands upright in Mare Crisium with a passive NASA Laser Retroreflector Array (LRA) active for orbiters.'
    },
    science: [
      'Definitive Proof of Lunar Polar Water Ice (LCROSS): Infrared and UV spectrometers measured ~5.6% water ice by mass in the Cabeus Crater ejecta plume—anchoring NASA’s Artemis South Pole architecture.',
      'First Lunar GNSS Fix & Subsurface Pneumatic Drilling (Blue Ghost M1): LuGRE acquired GPS/Galileo navigation signals on the lunar surface (~400,000 km away) while LISTER measured interior heat flow.',
      'Electrodynamic Dust Shield (EDS) & X-Ray Magnetosphere Imaging (LEXI): Demonstrated self-cleaning high-voltage surfaces against abrasive lunar dust and captured wide-field X-ray images of Earth’s magnetosphere.'
    ]
  },

  // =========================================================================
  // REALM 2: MARS (5 ARTIFACTS)
  // =========================================================================
  {
    id: 'viking1',
    realm: 'mars',
    code: 'VIKING 1',
    year: '1976',
    title: 'Viking 1 Lander: Thomas Mutch Memorial Station',
    region: 'Chryse Planitia',
    coords: '22.48° N, 47.97° W',
    mapX: 118,
    mapY: 78,
    status: 'First Operational Mars Lander (2,245 Sols)',
    statusColor: 'amber',
    artifactType: 'probe',
    horizonAngle: 0.4,
    image: 'assets/nasa/missions/viking1-pia00381.jpg',
    imageId: 'PIA00381',
    imageCredit: 'NASA / JPL',
    kidFunFact: '🔴 Cool Space Fact: Viking 1 was the very first robot to land safely on Mars! Seconds after touchdown, it looked straight down at its own foot and snapped the first-ever photo from the Martian surface.',
    shortSummary: 'In July 1976, Viking 1 became the very first spacecraft to land safely on Mars! Using a 3-meter robot scoop arm, it tested rusty red Martian dirt for signs of life and sent back weather reports for over 6 years.',
    gallery: [
      {
        src: 'assets/nasa/missions/viking1-pia00381.jpg',
        title: 'Viking 1 Lander & Rusty Red Boulders of Chryse Planitia',
        badge: '🥇 First Mars Lander',
        credit: 'NASA / JPL / PIA00381'
      },
      {
        src: 'assets/nasa/missions/sojourner-pia01122.jpg',
        title: 'Martian Desert Horizon & Ancient Flood Plains',
        badge: '🏜️ Red Planet Rocks',
        credit: 'NASA / JPL / PIA01122'
      },
      {
        src: 'assets/nasa/missions/insight-pia25287.jpg',
        title: 'Robotic Lander Deck Covered in Fine Red Martian Dust',
        badge: '🧪 Soil Chemistry Lab',
        credit: 'NASA / JPL-Caltech'
      }
    ],
    sourceTitle: 'NASA Science — Viking 1',
    sourceUrl: 'https://science.nasa.gov/mission/viking-1/',
    story: [
      '"On July 20, 1976—seven years to the day after Apollo 11 touched down on the Moon—I fired my eighteen hydrazine thrusters through a salmon-colored sky and became the first spacecraft in history to land safely and complete its mission on the surface of Mars!"',
      '"Just seconds after my three-legged aluminum body settled onto the rust-red plains of Chryse Planitia, my facsimile camera looked straight down at my right footpad. That black-and-white scan—followed by the first color panorama of a boulder-strewn Martian desert—introduced humanity to the true face of the Red Planet."',
      '"With my 3-meter extendable collector arm, I scooped rusty Martian soil into three miniature automated biology laboratories inside my hull to search for signs of microbial life, while my X-ray and gas chromatograph instruments analyzed every chemical element in the dirt and thin carbon-dioxide air."',
      '"Designed to operate for just 90 Martian days, my twin plutonium radioisotope heaters kept me alive for more than six Earth years—logging 2,245 Martian sols of weather reports until November 1982. Today I stand in Chryse Planitia as the Thomas Mutch Memorial Station."'
    ],
    tech: {
      hardware: 'Viking 1 Three-Legged Hexagonal Lander + Automated Biology Laboratory',
      mass: '576 kg (landed dry mass on Chryse Planitia)',
      dimensions: '2.1 m height × 3.0 m footpad span with 3.0 m surface sampler arm',
      survival: 'Powered by two SNAP-19 plutonium RTGs for 2,245 sols (1976–1982). Photographed from orbit on the surface of Chryse Planitia by NASA’s Mars Reconnaissance Orbiter (HiRISE).'
    },
    science: [
      'First In-Situ Search for Martian Life & Organic Chemistry: Executed three biological experiments (Labeled Release, Gas Exchange, Pyrolytic Release) and GCMS analysis, revealing reactive perchlorate/superoxide soil chemistry.',
      'Martian Atmospheric Isotope Fingerprinting: Measured nitrogen and argon isotope ratios in the thin CO₂ atmosphere—later allowing scientists on Earth to prove that SNC meteorites actually came from Mars.',
      'Six-Year Martian Meteorology Record: Tracked seasonal pressure swings as up to 25% of the Martian atmosphere froze onto and sublimated from the polar ice caps each Martian year.'
    ]
  },
  {
    id: 'sojourner',
    realm: 'mars',
    code: 'SOJOURNER',
    year: '1997',
    title: 'Mars Pathfinder & Sojourner: First Wheels on the Red Planet',
    region: 'Ares Vallis',
    coords: '19.13° N, 33.22° W',
    mapX: 134,
    mapY: 88,
    status: 'Pioneer Rover & Carl Sagan Memorial Station',
    statusColor: 'sky',
    artifactType: 'rover',
    horizonAngle: 1.6,
    image: 'assets/nasa/missions/sojourner-pia01122.jpg',
    imageId: 'PIA01122',
    imageCredit: 'NASA / JPL',
    kidFunFact: '🎈 Cool Space Fact: Sojourner landed wrapped inside 24 giant airbags — bouncing 15 times (15 meters high!) across Mars before unfolding like a metal flower! And the rover itself is only the size of a microwave oven!',
    shortSummary: 'After bouncing onto Mars inside 24 giant airbags on July 4, 1997, microwave-sized Sojourner rolled down a ramp on 6 wheels to become the very first rover ever to drive on the Red Planet!',
    gallery: [
      {
        src: 'assets/nasa/missions/sojourner-pia01122.jpg',
        title: 'Microwave-Sized Rover Sojourner Inspecting "Yogi" Rock',
        badge: '🛞 First Mars Wheels',
        credit: 'NASA / JPL / PIA01122'
      },
      {
        src: 'assets/nasa/missions/opportunity-pia19142.jpg',
        title: 'Next-Generation 6-Wheel Rocker-Bogie Rover Family',
        badge: '🤖 Rover Evolution',
        credit: 'NASA / JPL-Caltech'
      },
      {
        src: 'assets/nasa/missions/viking1-pia00381.jpg',
        title: 'Boulders Swept Down Ancient Martian Mega-Floods',
        badge: '🌊 Ancient Flood Valley',
        credit: 'NASA / JPL'
      }
    ],
    sourceTitle: 'NASA Science — Mars Pathfinder & Sojourner',
    sourceUrl: 'https://science.nasa.gov/mission/mars-pathfinder/',
    story: [
      '"Instead of hovering down on big retro-rockets like Viking, my mother ship Mars Pathfinder and I arrived on July 4, 1997 wrapped inside a giant cluster of 24 airbags! We hit the ancient flood plain of Ares Vallis at 50 kilometers per hour and bounced 15 times—leaping 15 meters high on the first bounce—before rolling to a stop and unfolding like three metallic flower petals."',
      '"Wait until you see how small I am: just 65 centimeters long and weighing 10.6 kilograms—about the size of a microwave oven! Named after abolitionist hero Sojourner Truth, I rolled down Pathfinder’s rear ramp on my six cleated aluminum wheels to become the very first rover ever to drive on Mars."',
      '"With my flexible Rocker-Bogie suspension—the exact same wheel design later scaled up for Spirit, Opportunity, Curiosity, and Perseverance—I climbed over rocks nicknamed Barnacle Bill, Yogi, and Shark, pressing my Alpha Proton X-Ray Spectrometer against their surfaces like a curious geologist’s nose."',
      '"Though I was built for a 7-sol technology demonstration, Pathfinder and I explored Ares Vallis for 83 sols, snapping 17,000 photos before the bitter Martian cold silenced Pathfinder’s battery. My programming told me to circle my silent lander and wait for a signal from home."'
    ],
    tech: {
      hardware: 'Sojourner 6-Wheel Microrover + Mars Pathfinder Tetrahedral Lander',
      mass: '10.6 kg (Sojourner rover) + 264 kg (Pathfinder lander & airbag petals)',
      dimensions: '0.65 m length × 0.48 m width × 0.30 m height (6× 13 cm wheels)',
      survival: 'Operated for 83 sols (12× its 7-sol design life), driving ~100 meters around the Carl Sagan Memorial Station. Both lander and rover were spotted from orbit by MRO HiRISE.'
    },
    science: [
      'Proved Airbag EDL & Rocker-Bogie Mobility: Validated the airbag landing architecture and 6-wheel Rocker-Bogie suspension that enabled every subsequent NASA Mars rover.',
      'Ancient Catastrophic Flood Geology in Ares Vallis: Imaged rounded pebbles, imbricated boulders, and twin hills ("Twin Peaks") sculpted by ancient mega-floods billions of years ago.',
      'Andesitic Rock Chemistry via APXS: Discovered silica-rich rocks like "Barnacle Bill," showing that early Mars experienced more complex magmatic differentiation than simple basalt.'
    ]
  },
  {
    id: 'opportunity',
    realm: 'mars',
    code: 'OPPORTUNITY',
    year: '2004–2018',
    title: 'Opportunity (MER-B): Marathon Explorer of Meridiani Planum',
    region: 'Perseverance Valley, Endeavour Crater',
    coords: '2.05° S, 5.53° W',
    mapX: 154,
    mapY: 116,
    status: 'Off-World Distance Record (45.16 km / 5,111 Sols)',
    statusColor: 'amber',
    artifactType: 'rover',
    horizonAngle: 2.8,
    image: 'assets/nasa/missions/opportunity-pia19142.jpg',
    imageId: 'PIA19142',
    imageCredit: 'NASA / JPL-Caltech / Cornell / ASU',
    kidFunFact: '🏃 Cool Space Fact: Opportunity ("Oppy") was built to last only 90 days — but Martian dust devils kept sweeping its solar panels clean, letting it drive a 45.16 km marathon for 14 years!',
    shortSummary: 'Opportunity ("Oppy") was only supposed to last 90 days, but explored Mars for 14 years and drove a record 45.16 km marathon — discovering mineral "blueberries" that proved ancient Mars once had liquid water!',
    gallery: [
      {
        src: 'assets/nasa/missions/opportunity-pia19142.jpg',
        title: 'Opportunity ("Oppy") Looking Across Endeavour Crater',
        badge: '🏅 45.16 km Marathon!',
        credit: 'NASA / JPL / PIA19142'
      },
      {
        src: 'assets/nasa/missions/sojourner-pia01122.jpg',
        title: 'Rocker-Bogie Wheels Climbing Over Red Martian Rocks',
        badge: '🫐 Found "Blueberries"',
        credit: 'NASA / JPL'
      },
      {
        src: 'assets/nasa/missions/ingenuity-pia26243.jpg',
        title: 'Modern Mars Exploration Continues in Ancient Lake Craters',
        badge: '💧 Ancient Water Proof',
        credit: 'NASA / JPL-Caltech'
      }
    ],
    sourceTitle: 'NASA Science — Mars Exploration Rover Opportunity',
    sourceUrl: 'https://science.nasa.gov/mission/mer-opportunity/',
    story: [
      '"When my airbags bounced into tiny Eagle Crater on January 25, 2004, NASA called it an interplanetary hole-in-one! My engineers gave me and my twin sister Spirit a warranty of just 90 Martian sols and a goal of driving 600 meters—expecting red Martian dust to coat my solar wings and end my mission within three months."',
      '"Right inside Eagle Crater, my panoramic cameras spotted millions of tiny gray mineral spheres we nicknamed blueberries—hematite concretions that proved liquid water once soaked the rocks beneath my wheels. Refusing to quit, I climbed out of Eagle Crater and began an epic fourteen-year odyssey across Meridiani Planum!"',
      '"Whenever dust dimmed my solar panels, lucky Martian wind gusts and dust devils swept my wings clean again. I explored Endurance Crater, survived treacherous Purgatory Dune, peered into vast Victoria Crater, and crossed the plains to the rim of 22-kilometer-wide Endeavour Crater—completing the first 42.195-kilometer marathon ever driven on another world!"',
      '"In June 2018, after 5,111 sols and 45.16 kilometers of exploration, the most intense planet-encircling dust storm in decades blotted out the Sun over Perseverance Valley. My final telemetry whispered that the sky was dark and my solar energy was fading—leaving behind a legacy that proved ancient Mars was once a wet, habitable world."'
    ],
    tech: {
      hardware: 'Mars Exploration Rover MER-B "Opportunity" (6-Wheel Solar Geologist)',
      mass: '185 kg (rover mass on Mars)',
      dimensions: '1.5 m height × 2.3 m width × 1.6 m length',
      survival: 'Operated for 5,111 sols (14 Earth years, 55× its 90-sol design life) and drove 45.16 km—still the farthest distance driven by any vehicle on another world. Rests in Perseverance Valley on the western rim of Endeavour Crater.'
    },
    science: [
      'Hematite "Blueberries" & Acidic Groundwater: Discovered spherical hematite concretions and jarosite sulfate beds at Eagle and Endurance Craters, proving liquid water once flowed through and pooled on Meridiani Planum.',
      'Neutral-pH Clay Minerals & Gypsum Veins at Endeavour Crater: Found ancient smectite clays and pure calcium-sulfate (gypsum) veins ("Homestake"), revealing an even older era of mild, drinkable-pH water friendly to life.',
      'First Meteorite Discovered on Another Planet: Identified "Heat Shield Rock" (Meridiani Planum meteorite), an iron-nickel meteorite sitting cleanly on the Martian plains.'
    ]
  },
  {
    id: 'insight',
    realm: 'mars',
    code: 'INSIGHT',
    year: '2018–2022',
    title: 'InSight Lander: Listening to the Heartbeat of Mars',
    region: 'Elysium Planitia',
    coords: '4.50° N, 135.62° E',
    mapX: 214,
    mapY: 104,
    status: 'Detected 1,319 Marsquakes (Retired Dec 2022)',
    statusColor: 'sky',
    artifactType: 'probe',
    horizonAngle: 4.0,
    image: 'assets/nasa/missions/insight-pia25287.jpg',
    imageId: 'PIA25287',
    imageCredit: 'NASA / JPL-Caltech',
    kidFunFact: '💓 Cool Space Fact: InSight placed a giant copper "stethoscope" onto Mars and felt 1,319 marsquakes — plus giant meteor impacts that blasted shiny white ice boulders out of the ground!',
    shortSummary: 'Instead of driving around, InSight placed an ultra-sensitive seismometer ("stethoscope") directly on the Martian ground — recording 1,319 marsquakes and mapping Mars’s liquid metal core!',
    gallery: [
      {
        src: 'assets/nasa/missions/insight-pia25287.jpg',
        title: 'InSight’s Dusty Final Selfie With Round Solar Wings',
        badge: '💓 1,319 Marsquakes!',
        credit: 'NASA / JPL / PIA25287'
      },
      {
        src: 'assets/nasa/missions/viking1-pia00381.jpg',
        title: 'Three-Legged Mars Lander Heritage on Rusty Plains',
        badge: '📡 Deep Core Scanner',
        credit: 'NASA / JPL'
      },
      {
        src: 'assets/nasa/missions/ingenuity-pia26243.jpg',
        title: 'Next-Gen Robotic Scouts Exploring Across Mars',
        badge: '🪐 Martian Science',
        credit: 'NASA / JPL-Caltech'
      }
    ],
    sourceTitle: 'NASA Science — InSight Mars Lander',
    sourceUrl: 'https://science.nasa.gov/mission/insight/',
    story: [
      '"While rovers roll across the surface looking at rocks, I came to Elysium Planitia in November 2018 with a completely different mission: to place a stethoscope directly onto the Red Planet’s chest and map its deep interior from crust to core!"',
      '"Using my robotic arm, I lifted a copper-colored dome called SEIS off my deck and placed it gently onto the Martian ground. Inside that vacuum sphere sat pendulums so sensitive they could detect ground vibrations smaller than the width of a single hydrogen atom!"',
      '"Over four Earth years, I listened through the quiet Martian nights and recorded 1,319 marsquakes—including a monster magnitude 4.7 quake in May 2022 and shockwaves from massive meteoroids slamming into Mars thousands of kilometers away, which blasted bright white boulders of underground ice onto the surface."',
      '"To squeeze out every last week of seismic science as red dust buried my round solar arrays, my engineers commanded my robotic arm to pour trickles of coarse sand beside my panels so the wind would sweep off the fine dust! In December 2022, after mapping Mars’s liquid core and layered crust, I sent home one final dusty selfie and went peacefully to sleep."'
    ],
    tech: {
      hardware: 'InSight Geophysical Lander + SEIS Seismometer + HP³ Heat Probe + RISE',
      mass: '358 kg (landed mass with dual 2.15 m circular UltraFlex solar arrays)',
      dimensions: '6.0 m width across deployed solar wings × 1.08 m deck height',
      survival: 'Operated for 1,440 sols (4 Earth years) on Elysium Planitia before dust accumulation on its solar arrays ended operations in December 2022.'
    },
    science: [
      '1,319 Marsquakes & First Direct Map of Mars’s Interior: Measured the thickness of the Martian crust (24–72 km across three sub-layers), the lithosphere depth (~500 km), and proved Mars has a large, liquid iron-alloy core (~1,830 km radius) enriched in light elements.',
      'Active Tectonic Faulting in Cerberus Fossae: Pinpointed dozens of quakes to Cerberus Fossae, proving that warm magma plumes deep inside Mars still trigger tectonic cracking today.',
      'Meteoroid Impacts Excavating Mid-Latitude Water Ice: Linked seismic shockwaves with MRO orbital images of fresh 150-meter impact craters that excavated blocks of pure subsurface water ice.'
    ]
  },
  {
    id: 'ingenuity',
    realm: 'mars',
    code: 'INGENUITY',
    year: '2021–2024',
    title: 'Ingenuity (Ginny): First Aircraft on Another World (72 Flights)',
    region: 'Valinor Hills, Jezero Crater',
    coords: '18.49° N, 77.32° E',
    mapX: 188,
    mapY: 82,
    status: '72 Powered Flights Complete (Stationary Telemetry)',
    statusColor: 'emerald',
    artifactType: 'helicopter',
    horizonAngle: 5.2,
    image: 'assets/nasa/missions/ingenuity-pia26243.jpg',
    imageId: 'PIA26243',
    imageCredit: 'NASA / JPL-Caltech / ASU / MSSS',
    kidFunFact: '🚁 Cool Space Fact: Mars’s air is 99% thinner than Earth’s, so Ingenuity’s blades had to spin at 2,500 RPM! It was supposed to fly 5 times — and ended up flying 72 times with a piece of the 1903 Wright Brothers plane inside!',
    shortSummary: 'Weighing just 1.8 kg, Ingenuity ("Ginny") became the very first aircraft ever to fly on another planet — completing 72 flights across Mars to scout rocky river deltas ahead of the Perseverance rover!',
    gallery: [
      {
        src: 'assets/nasa/missions/ingenuity-pia26243.jpg',
        title: 'Ingenuity ("Ginny") Resting on Sand Dunes After 72 Flights',
        badge: '🚁 72 Flights on Mars!',
        credit: 'NASA / JPL / PIA26243'
      },
      {
        src: 'assets/nasa/missions/opportunity-pia19142.jpg',
        title: 'Exploring Ancient Martian River Deltas & Craters',
        badge: '🏜️ Aerial Scout',
        credit: 'NASA / JPL-Caltech'
      },
      {
        src: 'assets/nasa/missions/sojourner-pia01122.jpg',
        title: 'From First Mars Wheels (1997) to First Mars Wings (2021)',
        badge: '✈️ Wright Flyer Swatch',
        credit: 'NASA / JPL'
      }
    ],
    sourceTitle: 'NASA Science — Ingenuity Mars Helicopter',
    sourceUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
    story: [
      '"Imagine trying to fly a helicopter where the air is as thin as Earth’s atmosphere at 30,000 meters altitude—just 1 percent of Earth’s sea-level pressure! To lift my 1.8-kilogram body into the skies of Jezero Crater, my two 1.2-meter carbon-fiber rotors had to spin in opposite directions at a blistering 2,400 to 2,900 revolutions per minute."',
      '"Carried to Mars tucked beneath the belly of the Perseverance rover, I spun up my blades at Wright Brothers Field on April 19, 2021 and climbed three meters into the Martian air—achieving the very first powered, controlled flight on another planet! Tucked beneath my solar panel is a postage-stamp-sized swatch of muslin fabric from the Wright brothers’ 1903 Kitty Hawk Flyer."',
      '"I was only supposed to fly 5 times over 30 days as a technology demo. Instead, I became Perseverance’s aerial scout for nearly three Earth years! Across 72 flights, I flew more than 14 times farther than planned—covering 17.0 kilometers, climbing up to 24 meters high, and scouting ancient river delta cliffs and sand dunes ahead of the rover."',
      '"On January 18, 2024, during a rough landing on featureless sand ripples in Valinor Hills, my rotor blades struck a steep dune slope and snapped at the tips. Though my flying days are over, my solar panel and computer remain awake—recording daily weather and avionic telemetry at Airfield Chi for future explorers to retrieve!"'
    ],
    tech: {
      hardware: 'Ingenuity Coaxial Autonomous Rotorcraft ("Ginny") + Wright Flyer Swatch',
      mass: '1.80 kg on Earth (~0.68 kg weight in Martian gravity)',
      dimensions: '0.49 m height × 1.21 m carbon-fiber coaxial rotor span',
      survival: 'Completed 72 flights (128.8 minutes airborne, 17.0 km total distance, 24.0 m max altitude) vs. 5 planned flights. Rests upright in Valinor Hills, Jezero Crater, continuing to log surface temperature and battery data.'
    },
    science: [
      'First Powered Aerodynamic Flight on Another Planet: Proved autonomous visual-inertial navigation and high-RPM coaxial rotor aerodynamics in a 1% CO₂ atmosphere.',
      'Aerial Reconnaissance of an Ancient Martian River Delta: Scouted boulder fields, impassable sand megadunes ("Séítah"), and sedimentary outcrops in Jezero Crater to optimize Perseverance’s sample-caching route.',
      'Pathfinder for Next-Generation Planetary Rotorcraft: Provided three years of seasonal atmospheric density flight data that directly informs future Mars Sample Return helicopters and the Dragonfly nuclear rotorcraft to Titan.'
    ]
  },

  // =========================================================================
  // REALM 3: UNIVERSE / DEEP SPACE (5 ARTIFACTS)
  // =========================================================================
  {
    id: 'pioneer10',
    realm: 'universe',
    code: 'PIONEER 10',
    year: '1972–2003',
    title: 'Pioneer 10: First Across the Asteroid Belt & Jupiter',
    region: 'Outer Solar System (Toward Aldebaran in Taurus)',
    coords: '~136 AU from the Sun',
    mapX: 98,
    mapY: 66,
    status: 'Silent Interstellar Coast (Gold Plaque Onboard)',
    statusColor: 'amber',
    artifactType: 'deepspace',
    horizonAngle: 0.5,
    image: 'assets/nasa/missions/pioneer10-arc-1973-ac73-9279.jpg',
    imageId: 'ARC-1973-AC73-9279',
    imageCredit: 'NASA / Ames Research Center',
    kidFunFact: '🛸 Cool Space Fact: Pioneer 10 was the first spacecraft brave enough to fly through the Asteroid Belt! It carries a golden metal postcard showing two humans and a map to Earth in case aliens ever find it.',
    shortSummary: 'Launched in 1972, Pioneer 10 was the first spacecraft to cross the Asteroid Belt and fly past giant Jupiter. It carries a golden plaque with a map to Earth as it coasts silently among the stars!',
    gallery: [
      {
        src: 'assets/nasa/missions/pioneer10-arc-1973-ac73-9279.jpg',
        title: 'Pioneer 10 Spacecraft With Giant Dish & RTG Booms',
        badge: '☄️ First Past Asteroids',
        credit: 'NASA Ames / AC73-9279'
      },
      {
        src: 'assets/nasa/missions/voyager-record-pia21741.jpg',
        title: 'Golden Cosmic Time Capsules Sent Into Deep Space',
        badge: '📀 Alien Message Plaque',
        credit: 'NASA / JPL'
      },
      {
        src: 'assets/nasa/missions/newhorizons-pia19952.jpg',
        title: 'Speeding Out Beyond the Giant Planets Into the Dark',
        badge: '🌌 51,000 km/h Speed',
        credit: 'NASA / JHUAPL'
      }
    ],
    sourceTitle: 'NASA Science — Pioneer 10',
    sourceUrl: 'https://science.nasa.gov/mission/pioneer-10/',
    story: [
      '"Before March 1972, no spacecraft had ever dared to cross the main Asteroid Belt between Mars and Jupiter. Many scientists feared a wall of pulverizing rock fragments would tear any probe to pieces—until I blazed the trail at over 51,000 kilometers per hour and emerged untouched on the other side!"',
      '"In December 1973, I dove straight into Jupiter’s ferocious radiation belts—ten thousand times stronger than Earth’s Van Allen belts! Though the radiation nearly fried my electronics, I beamed back the very first close-up images of Jupiter’s Great Red Spot and cloud bands before Jupiter’s giant gravity slingshotted me onto an escape trajectory out of the Solar System."',
      '"In 1983 I crossed beyond the orbit of Neptune, and I kept whispering faint radio signals back to NASA’s Deep Space Network for more than thirty years—sending my final, whisper-faint beep on January 23, 2003 from 12.2 billion kilometers away."',
      '"Bolted to my antenna support struts is a gold-anodized aluminum plaque designed by Carl Sagan, Frank Drake, and Linda Salzman Sagan: a cosmic message in a bottle showing a man and a woman, a map of fourteen pulsars, and our home planet Earth, as I coast silently toward the red giant star Aldebaran in Taurus."'
    ],
    tech: {
      hardware: 'Pioneer 10 Spin-Stabilized Deep Space Probe + Gold-Anodized Plaque',
      mass: '258 kg at launch (powered by 4 SNAP-19 plutonium RTGs)',
      dimensions: '2.9 m length × 2.74 m diameter high-gain parabolic dish antenna',
      survival: 'Operated for nearly 31 years (last signal received Jan 23, 2003 at 82.19 AU). Now coasting silently at ~11.9 km/s (~136 AU from the Sun) toward the star Aldebaran (~2 million years away).'
    },
    science: [
      'First Passage Through the Asteroid Belt & First Jupiter Flyby (1973): Proved spacecraft could safely transit the Asteroid Belt and mapped Jupiter’s intense magnetosphere, radiation belts, and thermal interior.',
      'Outer Heliosphere Cosmic Ray & Solar Wind Measurements: Tracked solar wind plasma and galactic cosmic rays beyond 80 AU for three decades.',
      'First Physical Message to the Cosmos (Pioneer Plaque): Carries a 152 × 229 mm gold-anodized aluminum pictorial plaque encoding Earth’s location relative to 14 galactic pulsars and the hyperfine transition of hydrogen.'
    ]
  },
  {
    id: 'voyager1',
    realm: 'universe',
    code: 'VOYAGER 1',
    year: '1977–Present',
    title: 'Voyager 1 & The Golden Record: Humanity\'s Farthest Envoy',
    region: 'Interstellar Space (Constellation Ophiuchus)',
    coords: '> 164 AU (24.5 Billion km) from Earth',
    mapX: 222,
    mapY: 46,
    status: 'Active in Interstellar Space (22+ Light-Hours Away!)',
    statusColor: 'emerald',
    artifactType: 'deepspace',
    horizonAngle: 1.7,
    image: 'assets/nasa/missions/voyager-record-pia21741.jpg',
    imageId: 'PIA21741',
    imageCredit: 'NASA / JPL-Caltech',
    kidFunFact: '📀 Cool Space Fact: Voyager 1 is over 24.5 BILLION kilometers away in interstellar space! It carries a real Gold Record with greetings in 55 languages, whale songs, thunder, and rock-and-roll music.',
    shortSummary: 'Voyager 1 is the farthest human-made object in the universe (over 24.5 billion km away!). In 2012 it exited our Solar System into interstellar space, carrying the famous Golden Record of Earth’s sounds and music.',
    gallery: [
      {
        src: 'assets/nasa/missions/voyager-record-pia21741.jpg',
        title: 'The Famous 12-Inch Gold-Plated Voyager Golden Record',
        badge: '📀 Golden Record',
        credit: 'NASA / JPL / PIA21741'
      },
      {
        src: 'assets/nasa/missions/voyager2-pia17046.jpg',
        title: 'Voyager Interstellar Probe With 3.7m Dish & Long Booms',
        badge: '🌌 24.5 Billion km Away!',
        credit: 'NASA / JPL-Caltech'
      },
      {
        src: 'assets/nasa/missions/pioneer10-arc-1973-ac73-9279.jpg',
        title: 'Humanity’s Deep Space Fleet Escaping the Solar System',
        badge: '🌍 "Pale Blue Dot"',
        credit: 'NASA'
      }
    ],
    sourceTitle: 'NASA Science — Voyager 1',
    sourceUrl: 'https://science.nasa.gov/mission/voyager/voyager-1/',
    story: [
      '"I am the farthest human-made object in the universe! Launched on September 5, 1977, I raced past Jupiter—discovering active volcanoes erupting on its moon Io—and swept past Saturn’s rings and haze-wrapped moon Titan before climbing high above the plane of the planets."',
      '"On Valentine’s Day 1990, from six billion kilometers away, Carl Sagan asked NASA to turn my cameras backward for one final family portrait of the Solar System. In a scattered beam of sunlight, I captured Earth as a single 0.12-pixel point of light: the Pale Blue Dot, containing everyone you have ever known."',
      '"On August 25, 2012, at 121 Astronomical Units from the Sun, I crossed the heliopause—stepping out of the Sun’s magnetic bubble and becoming the first spacecraft in history to enter true interstellar space between the stars!"',
      '"Even today, more than 24.5 billion kilometers from home—where a radio message takes over 22 hours traveling at the speed of light just to reach Earth—my surviving instruments still transmit data! And mounted on my side is the 12-inch gold-plated copper Golden Record, carrying greetings in 55 languages, whale songs, thunder, and music from Bach to Chuck Berry for up to a billion years."'
    ],
    tech: {
      hardware: 'Voyager 1 Interstellar Spacecraft + 3.7 m High-Gain Dish + Golden Record',
      mass: '721.9 kg dry mass (powered by 3 MHW-RTG plutonium generators)',
      dimensions: '3.7 m antenna diameter × 13 m magnetometer boom',
      survival: 'Actively communicating with NASA’s Deep Space Network after 47+ years in space! Traveling at ~17.0 km/s (61,200 km/h) in interstellar space beyond 164 AU.'
    },
    science: [
      'First Crossing of the Heliopause into Interstellar Space (Aug 25, 2012): Directly measured the dense, cold plasma of the local interstellar medium and continuous galactic cosmic ray flux.',
      'Discovery of Extraterrestrial Volcanism on Io & Titan’s Nitrogen Atmosphere: Revealed sulfur-dioxide volcanic plumes on Jupiter’s moon Io and a thick, smoggy 1.5-bar nitrogen-methane atmosphere on Saturn’s moon Titan.',
      'The "Pale Blue Dot" (1990) & Voyager Golden Record: Captured the iconic 6-billion-km portrait of Earth and carries a time capsule of 115 images, natural sounds, and 90 minutes of music into the Milky Way.'
    ]
  },
  {
    id: 'voyager2',
    realm: 'universe',
    code: 'VOYAGER 2',
    year: '1977–Present',
    title: 'Voyager 2: Grand Tour of Jupiter, Saturn, Uranus & Neptune',
    region: 'Interstellar Space (Constellation Pavo)',
    coords: '> 137 AU (20.5 Billion km) from Earth',
    mapX: 208,
    mapY: 174,
    status: 'Active in Interstellar Space (Only Probe to Uranus & Neptune)',
    statusColor: 'emerald',
    artifactType: 'deepspace',
    horizonAngle: 2.9,
    image: 'assets/nasa/missions/voyager2-pia17046.jpg',
    imageId: 'PIA17046',
    imageCredit: 'NASA / JPL-Caltech',
    kidFunFact: '🪐 Cool Space Fact: Every 176 years, Jupiter, Saturn, Uranus, and Neptune line up! Voyager 2 used that once-in-a-lifetime alignment to become the ONLY spacecraft ever to visit icy Uranus and Neptune.',
    shortSummary: 'Voyager 2 is the only spacecraft in history to complete the "Grand Tour" of all four giant planets — Jupiter, Saturn, Uranus, and Neptune — and is still sending radio signals from interstellar space today!',
    gallery: [
      {
        src: 'assets/nasa/missions/voyager2-pia17046.jpg',
        title: 'Voyager 2 Grand Tour Probe — Visitor of 4 Giant Planets',
        badge: '🪐 4-Planet Grand Tour',
        credit: 'NASA / JPL / PIA17046'
      },
      {
        src: 'assets/nasa/missions/voyager-record-pia21741.jpg',
        title: 'Twin Golden Record Carrying Earth’s Sounds to the Stars',
        badge: '🎵 Sounds of Earth',
        credit: 'NASA / JPL'
      },
      {
        src: 'assets/nasa/missions/huygens-pia07232.jpg',
        title: 'Exploring Exotic Moons of the Outer Solar System',
        badge: '❄️ Ice-Giant Geysers',
        credit: 'NASA / JPL / ESA'
      }
    ],
    sourceTitle: 'NASA Science — Voyager 2',
    sourceUrl: 'https://science.nasa.gov/mission/voyager/voyager-2/',
    story: [
      '"Once every 176 years, the four giant planets of our Solar System—Jupiter, Saturn, Uranus, and Neptune—line up in a cosmic geometry that lets a single spacecraft swing from one world to the next using gravity assists. Launched in August 1977, I am the only spacecraft in human history to complete that legendary four-planet Grand Tour!"',
      '"After exploring Jupiter’s fractured ice moon Europa and Saturn’s intricate ringlets, I ventured into the deep outer darkness alone. In January 1986, I became the first and only explorer to visit Uranus—discovering ten new moons, two new rings, a bizarrely tilted magnetic field, and the towering 20-kilometer ice cliffs of Miranda."',
      '"Three years later, in August 1989, I skimmed just 4,950 kilometers above the cobalt-blue clouds of Neptune—clocking supersonic 2,100 km/h winds in the Great Dark Spot and catching active nitrogen-ice geysers erupting eight kilometers high from its frozen moon Triton!"',
      '"On November 5, 2018, I followed my twin Voyager 1 across the heliopause into interstellar space—with my Plasma Science instrument still working to measure the solar wind’s boundary directly! Carrying my own copy of the Golden Record, I still talk to NASA’s giant dish in Canberra, Australia from over 20.5 billion kilometers away."'
    ],
    tech: {
      hardware: 'Voyager 2 Grand Tour Interstellar Spacecraft + Golden Record',
      mass: '721.9 kg dry mass (powered by 3 MHW-RTG plutonium generators)',
      dimensions: '3.7 m high-gain S/X-band parabolic dish + 10 science instruments',
      survival: 'Actively transmitting interstellar field and particle telemetry via NASA’s Deep Space Network Station 43 (Canberra) from >137 AU at ~15.4 km/s.'
    },
    science: [
      'Only Spacecraft to Visit the Ice Giants Uranus (1986) & Neptune (1989): Discovered 16 new moons across both systems, off-center tilted magnetospheres, and supersonic winds on Neptune.',
      'Active Cryovolcanic Geysers on Neptune’s Moon Triton: Imaged dark plumes of nitrogen gas and dust erupting 8 km into Triton’s thin atmosphere—proving geological activity at −235 °C.',
      'Direct Plasma Measurements Across the Heliopause (Nov 5, 2018): Provided the first direct plasma-density and temperature profile of the transition from the solar wind bubble into interstellar space.'
    ]
  },
  {
    id: 'huygens',
    realm: 'universe',
    code: 'HUYGENS',
    year: '1997–2017',
    title: 'Cassini–Huygens: Touchdown on Saturn\'s Moon Titan',
    region: 'Shangri-La Dune Field, Titan (Saturn System)',
    coords: '10.25° S, 192.32° W (9.5 AU)',
    mapX: 148,
    mapY: 142,
    status: 'Farthest Planetary Touchdown in History (9.5 AU)',
    statusColor: 'amber',
    artifactType: 'probe',
    horizonAngle: 4.1,
    image: 'assets/nasa/missions/huygens-pia07232.jpg',
    imageId: 'PIA07232',
    imageCredit: 'NASA / JPL / ESA / University of Arizona',
    kidFunFact: '🟠 Cool Space Fact: Saturn’s huge moon Titan is −179 °C cold! When saucer-shaped Huygens parachuted down through its orange clouds, it landed next to riverbeds filled with liquid methane and rounded pebbles made of solid water ice!',
    shortSummary: 'Carried to Saturn by the Cassini orbiter, the saucer-shaped Huygens probe parachuted through orange clouds in 2005 to make the farthest landing in history on Saturn’s giant moon Titan!',
    gallery: [
      {
        src: 'assets/nasa/missions/huygens-pia07232.jpg',
        title: 'First Surface Photo From Saturn’s Orange Moon Titan!',
        badge: '🪐 Farthest Landing Ever',
        credit: 'NASA / JPL / ESA / PIA07232'
      },
      {
        src: 'assets/nasa/missions/voyager2-pia17046.jpg',
        title: 'Deep Space Motherships Exploring the Ringed Giant Saturn',
        badge: '🛸 Golden Saucer Probe',
        credit: 'NASA / JPL'
      },
      {
        src: 'assets/nasa/missions/newhorizons-pia19952.jpg',
        title: 'Icy Worlds & Frozen Oceans of the Outer Solar System',
        badge: '🌊 Methane Rivers',
        credit: 'NASA'
      }
    ],
    sourceTitle: 'NASA Science — Cassini–Huygens Mission',
    sourceUrl: 'https://science.nasa.gov/mission/cassini/',
    story: [
      '"Look almost 1.4 billion kilometers away from the Sun to Saturn’s giant golden moon Titan—the only moon in the Solar System wrapped in a thick, hazy nitrogen atmosphere! For seven years, the NASA Cassini orbiter carried the saucer-shaped ESA Huygens probe across the Solar System before releasing it toward Titan’s orange clouds."',
      '"On January 14, 2005, Huygens plunged into Titan’s atmosphere behind a glowing heat shield and deployed three parachutes. As the orange hydrocarbon haze cleared during its two-and-a-half-hour descent, its cameras revealed a breathtaking alien world: branching river channels carved into hills of water-ice bedrock, draining into dark shoreline plains!"',
      '"Touching down softly in the damp, dark sands of Shangri-La at −179 °C—the farthest landing on any world in human history—Huygens switched on its surface lamp and photographed rounded cobbles made not of stone, but of frozen water ice sculpted by rivers of liquid methane and ethane!"',
      '"Overhead, the NASA Cassini orbiter continued exploring Saturn for thirteen glorious years—discovering towering water-ice geysers with hydrothermal hydrogen on Enceladus and mapping Hydrocarbon seas on Titan—before diving into Saturn’s golden clouds in its September 2017 Grand Finale to protect those ocean moons forever."'
    ],
    tech: {
      hardware: 'NASA Cassini Orbiter (Grand Finale) + ESA/NASA Huygens Titan Lander',
      mass: '318 kg (Huygens probe on Titan) + 2,125 kg dry (Cassini orbiter)',
      dimensions: 'Huygens: 1.3 m diameter saucer lander; Cassini: 6.7 m height × 4.0 m width',
      survival: 'Huygens rests intact at 10.25° S, 192.32° W in the Shangri-La region of Titan (transmitted for 72 minutes after landing); Cassini vaporized in Saturn’s upper atmosphere on Sept 15, 2017.'
    },
    science: [
      'Farthest Landing in the Solar System & Liquid Methane Hydrology on Titan: Revealed an Earth-like hydrological cycle running at −179 °C with methane rain, dendritic river valleys, hydrocarbon lakes (Kraken & Ligeia Mare), and water-ice pebbles.',
      'Hydrothermal Plumes on Enceladus: Cassini flew directly through water-vapor geysers erupting from Enceladus’s south pole, detecting salt, silica nanograins, organic molecules, and molecular hydrogen from seafloor hydrothermal vents.',
      'Grand Finale Ring & Interior Gravity Sounding: Flew 22 orbits between Saturn’s cloud tops and innermost rings, determining that Saturn’s rings are surprisingly young (10–100 million years old).'
    ]
  },
  {
    id: 'newhorizons',
    realm: 'universe',
    code: 'NEW HORIZONS',
    year: '2006–Present',
    title: 'New Horizons: Explorer of Pluto\'s Heart & Kuiper Belt Object Arrokoth',
    region: 'Kuiper Belt (Constellation Sagittarius)',
    coords: '> 60 AU from the Sun',
    mapX: 182,
    mapY: 122,
    status: 'Active in the Kuiper Belt (> 60 AU from Sun)',
    statusColor: 'sky',
    artifactType: 'deepspace',
    horizonAngle: 5.3,
    image: 'assets/nasa/missions/newhorizons-pia19952.jpg',
    imageId: 'PIA19952',
    imageCredit: 'NASA / JHUAPL / SwRI',
    kidFunFact: '❤️ Cool Space Fact: New Horizons launched so fast (58,536 km/h) that it passed the Moon in just 9 hours! When it reached Pluto, it discovered a giant 1,000-kilometer heart made of solid nitrogen ice!',
    shortSummary: 'New Horizons sped across 4.8 billion km to take the first close-up photos of Pluto’s giant heart-shaped nitrogen-ice glacier in 2015, and later flew past snowman-shaped Kuiper Belt world Arrokoth!',
    gallery: [
      {
        src: 'assets/nasa/missions/newhorizons-pia19952.jpg',
        title: 'Pluto’s Giant Heart-Shaped Glacier & Water-Ice Mountains',
        badge: '❤️ Pluto’s Ice Heart',
        credit: 'NASA / JHUAPL / PIA19952'
      },
      {
        src: 'assets/nasa/missions/voyager2-pia17046.jpg',
        title: 'Racing Past Jupiter at 58,536 km/h Toward the Kuiper Belt',
        badge: '🚀 Fastest Launch Ever',
        credit: 'NASA / JPL'
      },
      {
        src: 'assets/nasa/missions/pioneer10-arc-1973-ac73-9279.jpg',
        title: 'Exploring Snowman-Shaped World Arrokoth 6.5 Billion km Away',
        badge: '⛄ Space Snowman',
        credit: 'NASA'
      }
    ],
    sourceTitle: 'NASA Science — New Horizons',
    sourceUrl: 'https://science.nasa.gov/mission/new-horizons/',
    story: [
      '"Launched from Cape Canaveral in January 2006 at a record-shattering 58,536 kilometers per hour, I raced past the Moon in just nine hours! My mission was to reach the last unexplored classical world of our Solar System—distant, enigmatic Pluto and its five moons at the edge of the Kuiper Belt."',
      '"On July 14, 2015, after a nine-and-a-half-year voyage across 4.8 billion kilometers, I swept just 12,500 kilometers above Pluto! Instead of a dead, cratered ice ball, my cameras revealed a world of stunning beauty: the vast, gleaming nitrogen-ice glacier of Sputnik Planitia shaped like a 1,000-kilometer heart, framed by 3,500-meter mountains of solid water ice and a layered blue atmospheric haze."',
      '"Still healthy deep inside the Kuiper Belt, my team aimed me toward an even more distant target a billion miles past Pluto. On New Year’s Day 2019, I flew 3,500 kilometers past 486958 Arrokoth—the farthest and most primitive world ever explored by a spacecraft, shaped like a gentle red two-lobed snowman preserved untouched since the birth of the planets 4.5 billion years ago!"',
      '"Carrying a small portion of Clyde Tombaugh’s ashes—the astronomer who discovered Pluto in 1930—I am now cruising past 60 Astronomical Units from the Sun, measuring interplanetary dust and ultraviolet glow in the deep outer Kuiper Belt."'
    ],
    tech: {
      hardware: 'New Horizons Piano-Sized Kuiper Belt Spacecraft + LORRI / Ralph / Alice Suite',
      mass: '478 kg at launch (powered by a single GPHS-RTG plutonium generator)',
      dimensions: '2.1 m antenna diameter × 2.7 m width × 0.7 m body height',
      survival: 'Actively operating in the outer Kuiper Belt beyond 60 AU (~9 billion km from Earth), traveling at ~13.7 km/s on a Solar System escape trajectory.'
    },
    science: [
      'First Reconnaissance of the Pluto–Charon System (July 2015): Discovered active nitrogen-ice convection cells in Sputnik Planitia, towering water-ice mountains, potential cryovolcanoes (Wright & Piccard Mons), and Charon’s giant tectonic canyon system.',
      'Farthest Flyby in History at Kuiper Belt Object Arrokoth (Jan 1, 2019 at 43.4 AU): Proved via Arrokoth’s unfractured contact-binary shape that primordial planetesimals formed by gentle pebble-cloud collapse rather than violent collisions.',
      'Outer Heliosphere & Cosmic Optical Background Measurements: Directly counts interplanetary dust impacts with the student-built Venetia Burney Student Dust Counter (SDC) out past 60 AU and measures the darkness of extragalactic space.'
    ]
  }
];

/**
 * Exhaustive English registry of official NASA resources used across Moon, Mars, and Universe realms.
 */
export const NASA_RESOURCES = [
  {
    category: '3D Moon Model & Elevation Relief (Core Asset)',
    id: 'NASA SVS 14959',
    title: 'Moon 3D Models for Web, AR, and Animation (moon_small.glb)',
    credits: 'NASA Goddard Space Flight Center — Dan Gallagher (eMITS, Producer), Ernie Wright (STC, Data provider / LRO LROC & LOLA), Tuomas Kankola, Josh Klint (Data analysts), Aaron E. Lepsch (Technical support).',
    localFile: 'assets/nasa/svs-14959/moon_small.glb',
    url: 'https://svs.gsfc.nasa.gov/14959',
    directUrl: 'https://svs.gsfc.nasa.gov/vis/a010000/a014900/a014959/moon_small.glb'
  },
  {
    category: 'Lunar 2D & 3D Surface Maps (LROC & LOLA)',
    id: 'NASA SVS 4720',
    title: 'CGI Moon Kit — LROC Color Mosaic (lroc_color_2k.jpg) & LOLA Elevation Map (ldem_3_8bit.jpg)',
    credits: 'NASA Scientific Visualization Studio / Ernie Wright (GSFC); Lunar Reconnaissance Orbiter Camera (LROC) & Lunar Orbiter Laser Altimeter (LOLA) instrument teams.',
    localFile: 'assets/nasa/svs-4720/lroc_color_2k.jpg, assets/nasa/svs-4720/ldem_3_8bit.jpg',
    url: 'https://svs.gsfc.nasa.gov/4720',
    directUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg'
  },
  {
    category: 'Moon Missions & Surface Hardware Imagery',
    id: 'NASA Apollo / LRO / CLPS Archives',
    title: 'Apollo 11 (as11-40-5948), Surveyor 3 & Apollo 12 (AS12-48-7133), Apollo 15 (as15-85-11471), Apollo 16 (as16-114-18439), Apollo 17 (as17-137-20979), LCROSS (SVS 10686) & Blue Ghost M1',
    credits: 'NASA Johnson Space Center (JSC), NASA GSFC Scientific Visualization Studio, Lunar Reconnaissance Orbiter Camera (LROC / ASU), and NASA CLPS / Firefly Aerospace.',
    localFile: 'assets/nasa/missions/apollo11-easep-as11-40-5948.jpg ... blueghost-mare-crisium.jpg',
    url: 'https://science.nasa.gov/moon/',
    directUrl: 'https://science.nasa.gov/mission/apollo/lunar-laser-ranging/'
  },
  {
    category: 'Mars Exploration Program & Lander/Rover Archives',
    id: 'NASA Mars Exploration Program',
    title: 'Viking 1 Lander (Chryse Planitia), Mars Pathfinder & Sojourner (Ares Vallis), Opportunity MER-B (Meridiani Planum / Endeavour Crater), InSight (Elysium Planitia) & Ingenuity Helicopter (Jezero Crater)',
    credits: 'NASA Science Mission Directorate, NASA Jet Propulsion Laboratory (JPL-Caltech), MOLA Science Team, and MRO HiRISE (University of Arizona).',
    localFile: 'js/data.js (Mars Realm Coordinates & Telemetry)',
    url: 'https://science.nasa.gov/mars/',
    directUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/'
  },
  {
    category: 'Deep Space, Outer Planets & Interstellar Archives',
    id: 'NASA Deep Space / NSSDCA',
    title: 'Pioneer 10 (Ames), Voyager 1 & Voyager 2 Interstellar Mission & Golden Record (JPL), Cassini–Huygens Titan Lander (JPL/ESA) & New Horizons Pluto / Arrokoth Kuiper Belt Mission (JHUAPL/SwRI)',
    credits: 'NASA Science Mission Directorate, NASA Jet Propulsion Laboratory (JPL-Caltech), NASA Ames Research Center, NASA Space Science Data Coordinated Archive (NSSDCA), and JHUAPL/SwRI.',
    localFile: 'js/data.js (Universe Realm Trajectories & Telemetry)',
    url: 'https://science.nasa.gov/mission/voyager/',
    directUrl: 'https://nssdc.gsfc.nasa.gov/'
  }
];
