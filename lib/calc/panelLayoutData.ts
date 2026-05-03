export interface PanelComponent {
  id: string;
  brand: "ABB" | "Siemens" | "Weidmuller" | "Fort";
  category: "VSD" | "MCCB" | "Terminal Block" | "Control";
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
];

export const ENCLOSURES = [
  { id: "enc-600x400", name: "Wallbox 600x400", w: 400, h: 600 },
  { id: "enc-800x600", name: "Wallbox 800x600", w: 600, h: 800 },
  { id: "enc-1000x800", name: "Wallbox 1000x800", w: 800, h: 1000 },
  { id: "enc-1200x800", name: "Floorstand 1200x800", w: 800, h: 1200 },
  { id: "enc-2000x800", name: "Floorstand 2000x800", w: 800, h: 2000 },
];
