export interface PanelComponent {
  id: string;
  brand: "ABB" | "Siemens" | "Weidmuller" | "Fort" | "Schneider" | "KSS";
  category: "VSD" | "MCCB" | "Terminal Block" | "Control" | "Networking" | "Wiring";
  partCode: string;
  width: number; // mm
  height: number; // mm
  depth: number; // mm
  color: string;
}

export const componentLibrary: PanelComponent[] = [
  // ABB Drives
  { id: "abb-acs880-r1", brand: "ABB", category: "VSD", partCode: "ACS880-01 R1", width: 155, height: 409, depth: 226, color: "#e4002b" },
  { id: "abb-acs880-r2", brand: "ABB", category: "VSD", partCode: "ACS880-01 R2", width: 155, height: 409, depth: 249, color: "#e4002b" },
  { id: "abb-acs880-r3", brand: "ABB", category: "VSD", partCode: "ACS880-01 R3", width: 172, height: 475, depth: 261, color: "#e4002b" },
  { id: "abb-acs580-r1", brand: "ABB", category: "VSD", partCode: "ACS580-01 R1", width: 125, height: 373, depth: 223, color: "#f26522" },
  { id: "abb-acs580-r2", brand: "ABB", category: "VSD", partCode: "ACS580-01 R2", width: 125, height: 473, depth: 229, color: "#f26522" },
  { id: "abb-acs380-r0", brand: "ABB", category: "VSD", partCode: "ACS380 R0", width: 70, height: 223, depth: 174, color: "#ffc20e" },
  
  // Siemens MCCB
  { id: "sie-3va11", brand: "Siemens", category: "MCCB", partCode: "3VA11 (160A)", width: 76.2, height: 130, depth: 70, color: "#009999" },
  { id: "sie-3va12", brand: "Siemens", category: "MCCB", partCode: "3VA12 (250A)", width: 105, height: 158, depth: 70, color: "#009999" },
  { id: "sie-3va21", brand: "Siemens", category: "MCCB", partCode: "3VA21 (160A)", width: 105, height: 181, depth: 86, color: "#009999" },
  { id: "sie-3va23", brand: "Siemens", category: "MCCB", partCode: "3VA23 (400A)", width: 138, height: 248, depth: 110, color: "#009999" },

  // Weidmuller Terminal Blocks (representing a block of 10)
  { id: "wei-wdu25", brand: "Weidmuller", category: "Terminal Block", partCode: "WDU 2.5 (x10)", width: 51, height: 60, depth: 47, color: "#f4a261" },
  { id: "wei-wdu4", brand: "Weidmuller", category: "Terminal Block", partCode: "WDU 4 (x10)", width: 61, height: 60, depth: 47, color: "#f4a261" },
  { id: "wei-wdu6", brand: "Weidmuller", category: "Terminal Block", partCode: "WDU 6 (x10)", width: 79, height: 60, depth: 47, color: "#f4a261" },
  { id: "wei-wdu10", brand: "Weidmuller", category: "Terminal Block", partCode: "WDU 10 (x10)", width: 99, height: 60, depth: 47, color: "#f4a261" },

  // Fort Components
  { id: "fort-mcb1p", brand: "Fort", category: "Control", partCode: "MCB 1P 6A", width: 18, height: 80, depth: 70, color: "#264653" },
  { id: "fort-mcb3p", brand: "Fort", category: "Control", partCode: "MCB 3P 32A", width: 54, height: 80, depth: 70, color: "#264653" },
  { id: "fort-relay", brand: "Fort", category: "Control", partCode: "Relay MY2N", width: 22, height: 28, depth: 36, color: "#2a9d8f" },
  { id: "fort-pilot", brand: "Fort", category: "Control", partCode: "Pilot 22mm", width: 30, height: 30, depth: 50, color: "#e9c46a" },
  { id: "fort-contactor", brand: "Fort", category: "Control", partCode: "Contactor 9A", width: 45, height: 75, depth: 80, color: "#264653" },

  // Weidmuller Networking & Relays
  { id: "wei-sw-vl05m", brand: "Weidmuller", category: "Networking", partCode: "Switch VL05M", width: 30, height: 115, depth: 70, color: "#f4a261" },
  { id: "wei-trs-24vdc", brand: "Weidmuller", category: "Control", partCode: "Slim Relay TRS (x10)", width: 64, height: 90, depth: 88, color: "#f4a261" },
  
  // Schneider Relays
  { id: "sch-rxm4ab2p7", brand: "Schneider", category: "Control", partCode: "Relay RXM + Base", width: 27, height: 80, depth: 75, color: "#32CD32" },
  
  // Weidmuller DIN Rail
  { id: "wei-ts35-200", brand: "Weidmuller", category: "Wiring", partCode: "DIN Rail TS35 200mm", width: 200, height: 35, depth: 7.5, color: "#b0b0b0" },
  { id: "wei-ts35-400", brand: "Weidmuller", category: "Wiring", partCode: "DIN Rail TS35 400mm", width: 400, height: 35, depth: 7.5, color: "#b0b0b0" },
  { id: "wei-ts35-600", brand: "Weidmuller", category: "Wiring", partCode: "DIN Rail TS35 600mm", width: 600, height: 35, depth: 7.5, color: "#b0b0b0" },

  // KSS Cable Duct
  { id: "kss-duct-45x45-400", brand: "KSS", category: "Wiring", partCode: "Duct H 45x45 400", width: 400, height: 45, depth: 45, color: "#dcdcdc" },
  { id: "kss-duct-45x45-600", brand: "KSS", category: "Wiring", partCode: "Duct H 45x45 600", width: 600, height: 45, depth: 45, color: "#dcdcdc" },
  { id: "kss-duct-v-45x45-400", brand: "KSS", category: "Wiring", partCode: "Duct V 45x45 400", width: 45, height: 400, depth: 45, color: "#dcdcdc" },
  { id: "kss-duct-v-45x45-600", brand: "KSS", category: "Wiring", partCode: "Duct V 45x45 600", width: 45, height: 600, depth: 45, color: "#dcdcdc" },
];

export const ENCLOSURES = [
  { id: "enc-600x400", name: "Wallbox 600x400 (Plat 350x550)", w: 350, h: 550 },
  { id: "enc-800x600", name: "Wallbox 800x600 (Plat 550x750)", w: 550, h: 750 },
  { id: "enc-1000x800", name: "Wallbox 1000x800 (Plat 750x950)", w: 750, h: 950 },
  { id: "enc-1200x800", name: "Floorstand 1200x800 (Plat 750x1150)", w: 750, h: 1150 },
  { id: "enc-2000x800", name: "Floorstand 2000x800 (Plat 750x1900)", w: 750, h: 1900 },
];
