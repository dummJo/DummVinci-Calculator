export interface PanelComponent {
  id: string;
  brand: "ABB" | "Siemens" | "Weidmuller" | "Fort" | "Schneider" | "KSS" | "Omron" | "Generic" | "PTTS" | "DummVinci";
  category: "VSD" | "MCCB" | "Terminal Block" | "Control" | "Networking" | "Wiring" | "Cooling" | "Door Accessory" | "Meter" | "Label" | "Logo";
  partCode: string;
  width: number; // mm
  height: number; // mm
  depth: number; // mm
  color: string;
}

export const componentLibrary: PanelComponent[] = [
  // ABB ACS880-01 Drives
  { id: "abb-acs880-r1", brand: "ABB", category: "VSD", partCode: "ACS880-01 R1", width: 155, height: 409, depth: 226, color: "#e4002b" },
  { id: "abb-acs880-r2", brand: "ABB", category: "VSD", partCode: "ACS880-01 R2", width: 155, height: 409, depth: 249, color: "#e4002b" },
  { id: "abb-acs880-r3", brand: "ABB", category: "VSD", partCode: "ACS880-01 R3", width: 172, height: 475, depth: 261, color: "#e4002b" },
  { id: "abb-acs880-r4", brand: "ABB", category: "VSD", partCode: "ACS880-01 R4", width: 203, height: 576, depth: 274, color: "#e4002b" },
  { id: "abb-acs880-r5", brand: "ABB", category: "VSD", partCode: "ACS880-01 R5", width: 203, height: 730, depth: 274, color: "#e4002b" },
  { id: "abb-acs880-r6", brand: "ABB", category: "VSD", partCode: "ACS880-01 R6", width: 251, height: 726, depth: 357, color: "#e4002b" },
  { id: "abb-acs880-r7", brand: "ABB", category: "VSD", partCode: "ACS880-01 R7", width: 284, height: 880, depth: 365, color: "#e4002b" },

  // ABB ACQ580-01 / ACS580-01 Drives
  { id: "abb-acq580-r1", brand: "ABB", category: "VSD", partCode: "ACQ580-01 R1", width: 125, height: 373, depth: 223, color: "#f26522" },
  { id: "abb-acq580-r2", brand: "ABB", category: "VSD", partCode: "ACQ580-01 R2", width: 125, height: 473, depth: 229, color: "#f26522" },
  { id: "abb-acq580-r3", brand: "ABB", category: "VSD", partCode: "ACQ580-01 R3", width: 203, height: 490, depth: 229, color: "#f26522" },
  { id: "abb-acq580-r4", brand: "ABB", category: "VSD", partCode: "ACQ580-01 R4", width: 203, height: 636, depth: 257, color: "#f26522" },
  { id: "abb-acq580-r5", brand: "ABB", category: "VSD", partCode: "ACQ580-01 R5", width: 203, height: 732, depth: 295, color: "#f26522" },
  { id: "abb-acq580-r6", brand: "ABB", category: "VSD", partCode: "ACQ580-01 R6", width: 252, height: 726, depth: 369, color: "#f26522" },
  { id: "abb-acq580-r7", brand: "ABB", category: "VSD", partCode: "ACQ580-01 R7", width: 284, height: 880, depth: 370, color: "#f26522" },

  // ABB ACS380 Drives
  { id: "abb-acs380-r0", brand: "ABB", category: "VSD", partCode: "ACS380 R0", width: 70, height: 223, depth: 174, color: "#ffc20e" },
  { id: "abb-acs380-r1", brand: "ABB", category: "VSD", partCode: "ACS380 R1", width: 70, height: 223, depth: 174, color: "#ffc20e" },
  { id: "abb-acs380-r2", brand: "ABB", category: "VSD", partCode: "ACS380 R2", width: 95, height: 223, depth: 174, color: "#ffc20e" },
  { id: "abb-acs380-r3", brand: "ABB", category: "VSD", partCode: "ACS380 R3", width: 169, height: 223, depth: 174, color: "#ffc20e" },
  { id: "abb-acs380-r4", brand: "ABB", category: "VSD", partCode: "ACS380 R4", width: 260, height: 240, depth: 174, color: "#ffc20e" },
  
  // Siemens MCCB
  { id: "sie-3va11", brand: "Siemens", category: "MCCB", partCode: "3VA11 (160A)", width: 76.2, height: 130, depth: 70, color: "#009999" },
  { id: "sie-3va12", brand: "Siemens", category: "MCCB", partCode: "3VA12 (250A)", width: 105, height: 158, depth: 70, color: "#009999" },
  { id: "sie-3va21", brand: "Siemens", category: "MCCB", partCode: "3VA21 (160A)", width: 105, height: 181, depth: 86, color: "#009999" },
  { id: "sie-3va23", brand: "Siemens", category: "MCCB", partCode: "3VA23 (400A)", width: 138, height: 248, depth: 110, color: "#009999" },

  // Weidmuller Terminal Blocks (WDU & SAKDU)
  { id: "wei-wdu25", brand: "Weidmuller", category: "Terminal Block", partCode: "WDU 2.5 (x10)", width: 51, height: 60, depth: 47, color: "#f4a261" },
  { id: "wei-wdu4", brand: "Weidmuller", category: "Terminal Block", partCode: "WDU 4 (x10)", width: 61, height: 60, depth: 47, color: "#f4a261" },
  { id: "wei-wdu6", brand: "Weidmuller", category: "Terminal Block", partCode: "WDU 6 (x10)", width: 79, height: 60, depth: 47, color: "#f4a261" },
  { id: "wei-wdu10", brand: "Weidmuller", category: "Terminal Block", partCode: "WDU 10 (x10)", width: 99, height: 60, depth: 47, color: "#f4a261" },
  { id: "wei-sakdu25", brand: "Weidmuller", category: "Terminal Block", partCode: "SAKDU 2.5N (x10)", width: 51, height: 44, depth: 40, color: "#e8cfb3" },
  { id: "wei-sakdu4", brand: "Weidmuller", category: "Terminal Block", partCode: "SAKDU 4N (x10)", width: 61, height: 44, depth: 40, color: "#e8cfb3" },
  { id: "wei-sakdu6", brand: "Weidmuller", category: "Terminal Block", partCode: "SAKDU 6N (x10)", width: 79, height: 44, depth: 40, color: "#e8cfb3" },
  { id: "wei-sakdu10", brand: "Weidmuller", category: "Terminal Block", partCode: "SAKDU 10N (x10)", width: 99, height: 44, depth: 40, color: "#e8cfb3" },

  // Fort Components
  { id: "fort-mcb1p", brand: "Fort", category: "Control", partCode: "MCB 1P 6A", width: 18, height: 80, depth: 70, color: "#264653" },
  { id: "fort-mcb3p", brand: "Fort", category: "Control", partCode: "MCB 3P 32A", width: 54, height: 80, depth: 70, color: "#264653" },
  { id: "fort-relay", brand: "Fort", category: "Control", partCode: "Relay MY2N", width: 22, height: 28, depth: 36, color: "#2a9d8f" },
  { id: "fort-pilot", brand: "Fort", category: "Control", partCode: "Pilot 22mm", width: 30, height: 30, depth: 50, color: "#e9c46a" },
  { id: "fort-contactor", brand: "Fort", category: "Control", partCode: "Contactor 9A", width: 45, height: 75, depth: 80, color: "#264653" },

  // Weidmuller Networking & Relays
  { id: "wei-sw-vl05m", brand: "Weidmuller", category: "Networking", partCode: "Switch VL05M", width: 30, height: 115, depth: 70, color: "#f4a261" },
  { id: "sie-scalance", brand: "Siemens", category: "Networking", partCode: "Scalance Switch", width: 60, height: 125, depth: 124, color: "#009999" },
  { id: "wei-trs-24vdc", brand: "Weidmuller", category: "Control", partCode: "Slim Relay TRS (x10)", width: 64, height: 90, depth: 88, color: "#f4a261" },
  
  // Power Supplies
  { id: "omron-psu", brand: "Omron", category: "Control", partCode: "PSU S8VK 24V", width: 40, height: 90, depth: 90, color: "#a8c0d8" },
  { id: "wei-proeco", brand: "Weidmuller", category: "Control", partCode: "PSU PROeco 24V", width: 40, height: 125, depth: 100, color: "#f4a261" },

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

  // Cooling (Tent Tibox / Fort standard cutouts)
  { id: "tent-fan-150", brand: "Fort", category: "Cooling", partCode: "Fan Filter 150", width: 150, height: 150, depth: 80, color: "#dcdcdc" },
  { id: "tent-fan-204", brand: "Fort", category: "Cooling", partCode: "Fan Filter 204", width: 204, height: 204, depth: 80, color: "#dcdcdc" },
  { id: "tent-fan-255", brand: "Fort", category: "Cooling", partCode: "Fan Filter 255", width: 255, height: 255, depth: 80, color: "#dcdcdc" },
  { id: "tent-fan-323", brand: "Fort", category: "Cooling", partCode: "Fan Filter 323", width: 323, height: 323, depth: 80, color: "#dcdcdc" },

  // Door Accessories
  { id: "fort-pilot-g", brand: "Fort", category: "Door Accessory", partCode: "Pilot Green 22mm", width: 30, height: 30, depth: 50, color: "#10b981" },
  { id: "fort-pilot-r", brand: "Fort", category: "Door Accessory", partCode: "Pilot Red 22mm", width: 30, height: 30, depth: 50, color: "#ef4444" },
  { id: "fort-pilot-y", brand: "Fort", category: "Door Accessory", partCode: "Pilot Yellow 22mm", width: 30, height: 30, depth: 50, color: "#f59e0b" },
  { id: "fort-pb-start", brand: "Fort", category: "Door Accessory", partCode: "PB Start (Green)", width: 30, height: 30, depth: 50, color: "#10b981" },
  { id: "fort-pb-stop", brand: "Fort", category: "Door Accessory", partCode: "PB Stop (Red)", width: 30, height: 30, depth: 50, color: "#ef4444" },
  { id: "fort-sel-3p", brand: "Fort", category: "Door Accessory", partCode: "Selector A/O/M", width: 30, height: 30, depth: 50, color: "#222" },
  { id: "fort-estop", brand: "Fort", category: "Door Accessory", partCode: "E-Stop 40mm", width: 45, height: 45, depth: 50, color: "#ef4444" },
  { id: "abb-dpmp", brand: "ABB", category: "Door Accessory", partCode: "Keypad DPMP-04", width: 72, height: 105, depth: 15, color: "#222" },

  // Meters
  { id: "meter-v-ana", brand: "Generic", category: "Meter", partCode: "Analog Voltmeter 96", width: 96, height: 96, depth: 60, color: "#fff" },
  { id: "meter-a-ana", brand: "Generic", category: "Meter", partCode: "Analog Ammeter 96", width: 96, height: 96, depth: 60, color: "#fff" },
  { id: "meter-v-dig", brand: "Generic", category: "Meter", partCode: "Digital Meter 72", width: 72, height: 72, depth: 60, color: "#222" },

  // Labels & Logos
  { id: "label-custom", brand: "Generic", category: "Label", partCode: "Custom Nameplate", width: 100, height: 30, depth: 2, color: "#e5e5e5" },
  { id: "logo-abb", brand: "ABB", category: "Logo", partCode: "ABB Logo Sticker", width: 150, height: 60, depth: 1, color: "#e4002b" },
  { id: "logo-sie", brand: "Siemens", category: "Logo", partCode: "Siemens Logo Sticker", width: 150, height: 30, depth: 1, color: "#009999" },
  { id: "logo-ptts", brand: "PTTS", category: "Logo", partCode: "PTTS Logo Sticker", width: 160, height: 60, depth: 1, color: "#1d4ed8" },
  { id: "logo-dvm", brand: "DummVinci", category: "Logo", partCode: "DummVinci Logo", width: 160, height: 50, depth: 1, color: "#111" },
];

export const ENCLOSURES = [
  // Wallmount Boxes (Tibox / XLTC / Rittal AX)
  { id: "wm-400x300", name: "Wallbox 400x300", w: 250, h: 350, extW: 300, extH: 400, extD: 200 },
  { id: "wm-500x400", name: "Wallbox 500x400", w: 350, h: 450, extW: 400, extH: 500, extD: 200 },
  { id: "wm-600x400", name: "Wallbox 600x400", w: 350, h: 550, extW: 400, extH: 600, extD: 250 },
  { id: "wm-700x500", name: "Wallbox 700x500", w: 450, h: 650, extW: 500, extH: 700, extD: 250 },
  { id: "wm-800x600", name: "Wallbox 800x600", w: 550, h: 750, extW: 600, extH: 800, extD: 300 },
  { id: "wm-1000x800", name: "Wallbox 1000x800", w: 750, h: 950, extW: 800, extH: 1000, extD: 300 },
  { id: "wm-1200x800", name: "Wallbox 1200x800", w: 750, h: 1150, extW: 800, extH: 1200, extD: 300 },

  // Floorstand Cabinets (XLTC / Rittal TS8)
  { id: "fs-1800x800", name: "Floorstand 1800x800", w: 700, h: 1700, extW: 800, extH: 1800, extD: 600 },
  { id: "fs-2000x800", name: "Floorstand 2000x800", w: 700, h: 1900, extW: 800, extH: 2000, extD: 600 },
  { id: "fs-2000x1000", name: "Floorstand 2000x1000 (Double)", w: 900, h: 1900, extW: 1000, extH: 2000, extD: 600 },
];
