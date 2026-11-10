export const LEVELS = [
  {
    id: 1,
    kicker: "MISI 01",
    name: "Higienitas & Saluran Cerna",
    bacteria: { id: "bact_001", name: "Escherichia coli", short: "E. coli", shape: "rod" },
    theme: {
      sky: 0x041c24,
      fog: 0x07313c,
      ground: 0x0d4d59,
      accent: 0x22d3ee,
      accent2: 0x2dd4bf,
      enemy: 0x34d399,
      ring: 0x67e8f9,
      cssAccent: "#22d3ee"
    },
    speed: 8.5,
    startCrowd: 12,
    swarmHP: 14,
    bossHP: 520,
    gateZ: [45, 95, 145],
    swarmZ: [70, 120, 168],
    gateSets: [
      [
        { op: "add", value: 10, label: "Cuci Tangan" },
        { op: "mult", value: 2, label: "Air Bersih" }
      ],
      [
        { op: "add", value: 15, label: "Zinc" },
        { op: "sub", value: 10, label: "Makanan Lalat" }
      ],
      [
        { op: "mult", value: 2, label: "Serat" },
        { op: "div", value: 2, label: "Gula" }
      ]
    ],
    swarms: [
      { cols: 5, rows: 2 },
      { cols: 6, rows: 2 },
      { cols: 6, rows: 3 }
    ],
    pickups: [
      { z: 58, x: 2.3 },
      { z: 132, x: -2.3 }
    ],
    bossZ: 190,
    triviaId: "bact_001"
  },
  {
    id: 2,
    kicker: "MISI 02",
    name: "Kesehatan Mulut & Gigi",
    bacteria: { id: "bact_002", name: "Streptococcus mutans", short: "S. mutans", shape: "coccus" },
    theme: {
      sky: 0x241305,
      fog: 0x3a200b,
      ground: 0x6b3b12,
      accent: 0xfb923c,
      accent2: 0xfbbf24,
      enemy: 0xfbbf24,
      ring: 0xfdba74,
      cssAccent: "#fb923c"
    },
    speed: 9,
    startCrowd: 14,
    swarmHP: 22,
    bossHP: 780,
    gateZ: [48, 105, 160],
    swarmZ: [76, 132, 186],
    gateSets: [
      [
        { op: "add", value: 15, label: "Fluorida" },
        { op: "mult", value: 2, label: "Sikat Gigi" }
      ],
      [
        { op: "add", value: 20, label: "Kalsium" },
        { op: "div", value: 2, label: "Gula" }
      ],
      [
        { op: "mult", value: 2, label: "Air Putih" },
        { op: "sub", value: 15, label: "Cemilan Manis" }
      ]
    ],
    swarms: [
      { cols: 5, rows: 2 },
      { cols: 6, rows: 3 },
      { cols: 7, rows: 3 }
    ],
    pickups: [
      { z: 64, x: -2.4 },
      { z: 146, x: 2.4 }
    ],
    bossZ: 205,
    triviaId: "bact_002"
  },
  {
    id: 3,
    kicker: "MISI 03",
    name: "Keamanan Makanan",
    bacteria: { id: "bact_003", name: "Salmonella enterica", short: "Salmonella", shape: "rod" },
    theme: {
      sky: 0x2a0610,
      fog: 0x3b0a17,
      ground: 0x5c1224,
      accent: 0xf43f5e,
      accent2: 0xfb7185,
      enemy: 0xfb7185,
      ring: 0xfda4af,
      cssAccent: "#f43f5e"
    },
    speed: 9.5,
    startCrowd: 16,
    swarmHP: 30,
    bossHP: 1150,
    gateZ: [52, 115, 175],
    swarmZ: [84, 145, 202],
    gateSets: [
      [
        { op: "add", value: 20, label: "Masak Matang" },
        { op: "mult", value: 2, label: "Sanitasi" }
      ],
      [
        { op: "add", value: 25, label: "Protein" },
        { op: "sub", value: 20, label: "Daging Mentah" }
      ],
      [
        { op: "mult", value: 2, label: "Kebersihan" },
        { op: "div", value: 2, label: "Lalat" }
      ]
    ],
    swarms: [
      { cols: 6, rows: 2 },
      { cols: 7, rows: 3 },
      { cols: 7, rows: 3 }
    ],
    pickups: [
      { z: 70, x: 2.4 },
      { z: 160, x: -2.4 }
    ],
    bossZ: 225,
    triviaId: "bact_003"
  },
  {
    id: 4,
    kicker: "MISI 04",
    name: "Ketahanan Lambung",
    bacteria: { id: "bact_004", name: "Helicobacter pylori", short: "H. pylori", shape: "spiral" },
    theme: {
      sky: 0x160a2e,
      fog: 0x251243,
      ground: 0x321a5c,
      accent: 0xa78bfa,
      accent2: 0xc084fc,
      enemy: 0xc084fc,
      ring: 0xd8b4fe,
      cssAccent: "#a78bfa"
    },
    speed: 10,
    startCrowd: 18,
    swarmHP: 40,
    bossHP: 1700,
    gateZ: [56, 125, 190],
    swarmZ: [90, 158, 220],
    gateSets: [
      [
        { op: "add", value: 25, label: "Jam Teratur" },
        { op: "mult", value: 2, label: "Serat" }
      ],
      [
        { op: "add", value: 30, label: "Probiotik" },
        { op: "sub", value: 25, label: "Begadang" }
      ],
      [
        { op: "mult", value: 2, label: "Air Putih" },
        { op: "div", value: 2, label: "Stres" }
      ]
    ],
    swarms: [
      { cols: 6, rows: 3 },
      { cols: 7, rows: 3 },
      { cols: 8, rows: 3 }
    ],
    pickups: [
      { z: 76, x: -2.4 },
      { z: 174, x: 2.4 }
    ],
    bossZ: 245,
    triviaId: "bact_004"
  }
];
