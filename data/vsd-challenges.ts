export interface ChallengeParam {
  code: string;
  nameEn: string;
  nameId: string;
  setValue: string;
  unit?: string;
  note?: string;
}

export interface ChallengeStep {
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
  params?: ChallengeParam[];
}

export interface LimitSetting {
  param: string;
  nameEn: string;
  nameId: string;
  min?: string;
  max?: string;
  typical?: string;
  unit?: string;
}

export interface VsdChallenge {
  id: string;
  drive: "ACQ580" | "ACS880";
  difficulty: 1 | 2 | 3;
  titleEn: string;
  titleId: string;
  objectiveEn: string;
  objectiveId: string;
  prerequisitesEn: string[];
  prerequisitesId: string[];
  steps: ChallengeStep[];
  limitSettings: LimitSetting[];
  manualRef: string;
  estimatedMinutes: number;
}

export const vsdChallenges: VsdChallenge[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // ACQ580 — Simple Program Running
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "acq580-simple",
    drive: "ACQ580",
    difficulty: 1,
    titleEn: "Simple Program Running",
    titleId: "Menjalankan Program Sederhana",
    objectiveEn:
      "Commission an ACQ580 drive for basic pump or fan operation using local panel control, verifying motor data entry, direction of rotation, and steady-state output against nameplate values.",
    objectiveId:
      "Men-commissioning drive ACQ580 untuk operasi pompa atau fan dasar menggunakan kontrol panel lokal, memverifikasi entri data motor, arah putaran, dan output steady-state terhadap data nameplate.",
    prerequisitesEn: [
      "Motor connected to drive output terminals U/T1, V/T2, W/T3",
      "Power supply voltage verified at input terminals L1, L2, L3 and PE",
      "Motor nameplate data available (Un, fn, nn, In, Pn, cos φ)",
      "No mechanical load on motor shaft for initial direction and ID run test",
    ],
    prerequisitesId: [
      "Motor telah terhubung ke terminal output drive U/T1, V/T2, W/T3",
      "Tegangan suplai daya telah diverifikasi di terminal input L1, L2, L3 dan PE",
      "Data nameplate motor tersedia (Un, fn, nn, In, Pn, cos φ)",
      "Tidak ada beban mekanis pada poros motor untuk uji arah putaran dan ID run awal",
    ],
    steps: [
      {
        titleEn: "Pre-Commissioning Safety Check",
        titleId: "Pemeriksaan Keselamatan Pra-Commissioning",
        descEn:
          "Perform lockout/tagout (LOTO) before any wiring inspection. Measure motor winding insulation resistance with a 500 V megger — result must be >100 MΩ phase-to-earth; if below, investigate before proceeding. Verify PE (protective earth) conductor continuity ≤1 Ω. Confirm supply voltage at L1, L2, L3 matches drive nameplate. Check all cable entries and tighten terminal screws to specified torque.",
        descId:
          "Lakukan prosedur lockout/tagout (LOTO) sebelum inspeksi kabel apapun. Ukur resistansi insulasi belitan motor dengan megger 500 V — hasilnya harus >100 MΩ phase-to-earth; jika di bawah nilai tersebut, selidiki sebelum melanjutkan. Verifikasi kontinuitas konduktor PE (pentanahan protektif) ≤1 Ω. Konfirmasi tegangan suplai di L1, L2, L3 sesuai dengan nameplate drive. Periksa semua masukan kabel dan kencangkan sekrup terminal sesuai torsi yang ditentukan.",
        params: [],
      },
      {
        titleEn: "Motor Nameplate Data Entry",
        titleId: "Entri Data Nameplate Motor",
        descEn:
          "Enter all motor nameplate data into the drive parameter group 99. Accurate entry is critical for the DTC motor model and overload protection. Navigate using the panel keypad: MENU → Parameters → Group 99.",
        descId:
          "Masukkan semua data nameplate motor ke dalam grup parameter 99 drive. Entri yang akurat sangat penting untuk model motor DTC dan proteksi overload. Navigasi menggunakan keypad panel: MENU → Parameters → Grup 99.",
        params: [
          {
            code: "99.04",
            nameEn: "Motor Nominal Voltage",
            nameId: "Tegangan Nominal Motor",
            setValue: "Motor nameplate Un",
            unit: "V",
            note: "Enter exactly as printed on nameplate (e.g. 380, 400, or 415 V)",
          },
          {
            code: "99.05",
            nameEn: "Motor Nominal Frequency",
            nameId: "Frekuensi Nominal Motor",
            setValue: "50",
            unit: "Hz",
            note: "50 Hz for Indonesia; verify nameplate — some imported motors are 60 Hz",
          },
          {
            code: "99.06",
            nameEn: "Motor Nominal Speed",
            nameId: "Kecepatan Nominal Motor",
            setValue: "Motor nameplate nn",
            unit: "rpm",
            note: "Use nameplate speed (e.g. 1450, 2900 rpm) not synchronous speed",
          },
          {
            code: "99.07",
            nameEn: "Motor Nominal Current",
            nameId: "Arus Nominal Motor",
            setValue: "Motor nameplate In",
            unit: "A",
            note: "Use the current for the selected voltage (star or delta connection)",
          },
          {
            code: "99.08",
            nameEn: "Motor Nominal Power",
            nameId: "Daya Nominal Motor",
            setValue: "Motor nameplate Pn",
            unit: "kW",
            note: "Enter in kW; if nameplate shows HP, multiply by 0.746",
          },
          {
            code: "99.09",
            nameEn: "Motor Nominal Cos Phi",
            nameId: "Cos Phi Nominal Motor",
            setValue: "Motor nameplate cos φ",
            unit: "",
            note: "Dimensionless value between 0.70 and 0.92 for typical induction motors",
          },
        ],
      },
      {
        titleEn: "Set Speed / Frequency Limits",
        titleId: "Atur Batas Kecepatan / Frekuensi",
        descEn:
          "Configure the minimum and maximum output frequency and the motor current limit. For pump/fan applications minimum frequency is typically 0 Hz (drive can stop the pump fully). Maximum current is set at 115% of In to provide a headroom margin above full-load without nuisance tripping.",
        descId:
          "Konfigurasi frekuensi output minimum dan maksimum serta batas arus motor. Untuk aplikasi pompa/fan, frekuensi minimum biasanya 0 Hz (drive dapat menghentikan pompa sepenuhnya). Batas arus maksimum diatur pada 115% dari In untuk memberikan margin di atas beban penuh tanpa trip yang tidak diperlukan.",
        params: [
          {
            code: "30.11",
            nameEn: "Minimum Frequency",
            nameId: "Frekuensi Minimum",
            setValue: "0",
            unit: "Hz",
            note: "0 Hz allows full stop via drive; increase to 10–15 Hz if process requires minimum flow",
          },
          {
            code: "30.12",
            nameEn: "Maximum Frequency",
            nameId: "Frekuensi Maksimum",
            setValue: "50",
            unit: "Hz",
            note: "Match motor nominal frequency; do not exceed without verifying motor/pump design speed",
          },
          {
            code: "30.17",
            nameEn: "Maximum Current",
            nameId: "Arus Maksimum",
            setValue: "1.15 × In",
            unit: "A",
            note: "Set to 115% of motor nameplate In; drive will limit output current to this value",
          },
        ],
      },
      {
        titleEn: "Set Acceleration and Deceleration Ramp Times",
        titleId: "Atur Waktu Ramping Akselerasi dan Deselerasi",
        descEn:
          "Set ramp times appropriate for pump applications. Excessively short ramp times cause high inrush current and water hammer. For centrifugal pumps, 10 s is a good starting value; adjust based on system inertia and pressure transient requirements. Both ramp 1 values (accel and decel) apply to the default Ext1 control.",
        descId:
          "Atur waktu ramping yang sesuai untuk aplikasi pompa. Waktu ramping yang terlalu singkat menyebabkan arus inrush yang tinggi dan water hammer. Untuk pompa sentrifugal, 10 detik adalah nilai awal yang baik; sesuaikan berdasarkan inersia sistem dan persyaratan transien tekanan. Nilai ramp 1 (aksel dan desel) berlaku untuk kontrol Ext1 default.",
        params: [
          {
            code: "23.01",
            nameEn: "Acceleration Ramp 1 Time",
            nameId: "Waktu Ramping Akselerasi 1",
            setValue: "10",
            unit: "s",
            note: "Time to accelerate from 0 to maximum frequency; typical pump range 5–30 s",
          },
          {
            code: "23.02",
            nameEn: "Deceleration Ramp 1 Time",
            nameId: "Waktu Ramping Deselerasi 1",
            setValue: "10",
            unit: "s",
            note: "Time to decelerate from maximum frequency to 0; increase if regenerative overvoltage trips occur",
          },
        ],
      },
      {
        titleEn: "Configure Start / Stop Command Source",
        titleId: "Konfigurasi Sumber Perintah Start / Stop",
        descEn:
          "Define where the drive receives its run command. For local commissioning, use panel control (LOC mode). For remote operation from a PLC or push-button station, configure Ext1 to use digital input DI1 for start/stop and DI2 as run enable. Run enable must be TRUE for the drive to accept a start command.",
        descId:
          "Tentukan dari mana drive menerima perintah jalan. Untuk commissioning lokal, gunakan kontrol panel (mode LOC). Untuk operasi remote dari PLC atau stasiun push-button, konfigurasi Ext1 untuk menggunakan input digital DI1 untuk start/stop dan DI2 sebagai run enable. Run enable harus TRUE agar drive dapat menerima perintah start.",
        params: [
          {
            code: "20.01",
            nameEn: "Ext1 Commands",
            nameId: "Perintah Ext1",
            setValue: "DI1 (remote) or Panel (local commissioning)",
            unit: "",
            note: "LOC mode: panel controls start/stop. REM mode: set to 'DI1' for 2-wire start/stop",
          },
          {
            code: "20.06",
            nameEn: "Run Enable 1 Source",
            nameId: "Sumber Run Enable 1",
            setValue: "DI2 or Always true",
            unit: "",
            note: "Set to 'Always true' for bench commissioning; wire DI2 to safety relay/interlock in field installation",
          },
        ],
      },
      {
        titleEn: "Perform Motor ID Run (Standard)",
        titleId: "Lakukan Motor ID Run (Standard)",
        descEn:
          "The ID run measures motor electrical parameters (stator resistance, leakage inductance, magnetisation curve) to build the internal motor model for accurate current and torque control. Select 'Standard' ID run which rotates the motor — ensure the shaft is free to rotate and the area is clear. Press START on the panel. The ID run takes approximately 1–2 minutes. Do NOT interrupt the process. When complete, the panel shows 'ID run done' and the drive returns to READY state.",
        descId:
          "ID run mengukur parameter listrik motor (resistansi stator, induktansi bocor, kurva magnetisasi) untuk membangun model motor internal untuk kontrol arus dan torsi yang akurat. Pilih ID run 'Standard' yang memutar motor — pastikan poros bebas berputar dan area sekitar aman. Tekan START pada panel. ID run membutuhkan waktu sekitar 1–2 menit. JANGAN menghentikan proses. Setelah selesai, panel menampilkan 'ID run done' dan drive kembali ke status READY.",
        params: [
          {
            code: "99.13",
            nameEn: "ID Run Selection",
            nameId: "Seleksi ID Run",
            setValue: "Standard",
            unit: "",
            note: "'Standard' rotates motor at partial speed to identify motor model. Use 'Standstill' only if load cannot be decoupled.",
          },
        ],
      },
      {
        titleEn: "Direction of Rotation Check",
        titleId: "Pemeriksaan Arah Putaran",
        descEn:
          "Jog the drive at a low frequency (10 Hz) and verify the motor rotates in the correct direction for the pump or fan. Observe the pump shaft or impeller direction against the arrow marked on the pump casing. If the direction is reversed, either swap any two motor phase cables at the drive output terminals (U↔V, for example) or change parameter 99.12 to reverse the phase rotation in software. Do not swap phases on the supply input side.",
        descId:
          "Jog drive pada frekuensi rendah (10 Hz) dan verifikasi motor berputar ke arah yang benar untuk pompa atau fan. Amati arah poros pompa atau impeller terhadap tanda panah yang tercetak pada casing pompa. Jika arah terbalik, tukar salah satu dari dua kabel fase motor di terminal output drive (misalnya U↔V) atau ubah parameter 99.12 untuk membalik rotasi fase dalam software. Jangan menukar fase pada sisi input suplai.",
        params: [
          {
            code: "99.12",
            nameEn: "Motor Phase Rotation",
            nameId: "Rotasi Fase Motor",
            setValue: "ABC (default) or ACB (reverse)",
            unit: "",
            note: "Change to ACB to reverse rotation without rewiring; document which setting is used",
          },
        ],
      },
      {
        titleEn: "Full Speed Test and Output Verification",
        titleId: "Uji Kecepatan Penuh dan Verifikasi Output",
        descEn:
          "Ramp the drive to full speed (50 Hz) using panel control. Monitor the actual output values from the drive's diagnostics menu. Compare measured output current against the motor nameplate rated current. If output current significantly exceeds In at no-load, recheck motor data entry in group 99. Record all readings as the commissioning baseline.",
        descId:
          "Ramping drive ke kecepatan penuh (50 Hz) menggunakan kontrol panel. Monitor nilai output aktual dari menu diagnostik drive. Bandingkan arus output terukur dengan arus nominal pada nameplate motor. Jika arus output jauh melebihi In pada kondisi tanpa beban, periksa kembali entri data motor di grup 99. Catat semua pembacaan sebagai baseline commissioning.",
        params: [
          {
            code: "01.03",
            nameEn: "Output Frequency",
            nameId: "Frekuensi Output",
            setValue: "Read actual value",
            unit: "Hz",
            note: "Should read ~50.0 Hz at full speed command",
          },
          {
            code: "01.04",
            nameEn: "Output Current",
            nameId: "Arus Output",
            setValue: "Read actual value",
            unit: "A",
            note: "Compare to nameplate In; no-load current typically 30–50% of In for induction motors",
          },
        ],
      },
    ],
    limitSettings: [
      {
        param: "30.11",
        nameEn: "Minimum Frequency",
        nameId: "Frekuensi Minimum",
        min: "0",
        max: "30.12 value",
        typical: "0",
        unit: "Hz",
      },
      {
        param: "30.12",
        nameEn: "Maximum Frequency",
        nameId: "Frekuensi Maksimum",
        min: "30.11 value",
        max: "50",
        typical: "50",
        unit: "Hz",
      },
      {
        param: "30.17",
        nameEn: "Maximum Current",
        nameId: "Arus Maksimum",
        min: "In",
        max: "1.5 × In",
        typical: "1.15 × In",
        unit: "A",
      },
      {
        param: "30.20",
        nameEn: "Motor Overload Power",
        nameId: "Daya Overload Motor",
        min: "100",
        max: "150",
        typical: "110–120",
        unit: "%",
      },
      {
        param: "23.01",
        nameEn: "Ramp Up Time",
        nameId: "Waktu Ramp Up",
        min: "5",
        max: "60",
        typical: "10",
        unit: "s",
      },
      {
        param: "23.02",
        nameEn: "Ramp Down Time",
        nameId: "Waktu Ramp Down",
        min: "5",
        max: "60",
        typical: "10",
        unit: "s",
      },
    ],
    manualRef: "ACQ580 User's Manual 3AUA0000085967",
    estimatedMinutes: 30,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACQ580 — Multipump Challenge
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "acq580-multipump",
    drive: "ACQ580",
    difficulty: 2,
    titleEn: "Multipump Challenge",
    titleId: "Tantangan Multipump",
    objectiveEn:
      "Configure an ACQ580 as PFC (Pump and Fan Control) master drive for dual or triple pump sequencing with closed-loop PID pressure control using a 4–20 mA pressure transmitter on AI1.",
    objectiveId:
      "Mengkonfigurasi ACQ580 sebagai drive master PFC (Pump and Fan Control) untuk pengurutan pompa ganda atau tiga pompa dengan kontrol tekanan PID loop tertutup menggunakan transmitter tekanan 4–20 mA pada AI1.",
    prerequisitesEn: [
      "Master drive fully commissioned using acq580-simple procedure (motor data, ID run, direction verified)",
      "Auxiliary pump MCB and contactor wiring complete (RO1→Pump2 contactor, RO2→Pump3 contactor)",
      "Pressure transmitter (4–20 mA, 2-wire or 3-wire) wired to AI1 terminals X2:2 (+) and X2:3 (−)",
      "Contactor auxiliary feedback contacts wired to DI3 (pump 2 interlock) and DI4 (pump 3 interlock)",
    ],
    prerequisitesId: [
      "Drive master telah di-commissioning penuh menggunakan prosedur acq580-simple (data motor, ID run, arah putaran diverifikasi)",
      "Kabel MCB dan kontaktor pompa bantu sudah lengkap (RO1→kontaktor Pompa2, RO2→kontaktor Pompa3)",
      "Transmitter tekanan (4–20 mA, 2-kawat atau 3-kawat) terpasang ke terminal AI1 X2:2 (+) dan X2:3 (−)",
      "Kontak feedback bantu kontaktor terpasang ke DI3 (interlock pompa 2) dan DI4 (interlock pompa 3)",
    ],
    steps: [
      {
        titleEn: "Confirm Master Drive Basic Commissioning",
        titleId: "Konfirmasi Commissioning Dasar Drive Master",
        descEn:
          "Before configuring PFC, verify that the master drive is running correctly: motor data group 99 complete, ID run status 'done', speed limits confirmed, direction correct. Run the drive at 40 Hz manually and verify stable operation. The PFC logic overlays on top of a working drive — if the base configuration has errors, PFC will not function reliably.",
        descId:
          "Sebelum mengkonfigurasi PFC, verifikasi bahwa drive master berjalan dengan benar: grup data motor 99 lengkap, status ID run 'done', batas kecepatan dikonfirmasi, arah putaran benar. Jalankan drive secara manual pada 40 Hz dan verifikasi operasi stabil. Logika PFC overlay di atas drive yang berfungsi — jika konfigurasi dasar ada kesalahan, PFC tidak akan berfungsi dengan andal.",
        params: [],
      },
      {
        titleEn: "Configure PFC Master Settings",
        titleId: "Konfigurasi Pengaturan Master PFC",
        descEn:
          "Enable the PFC function and define the system topology. Parameter 76.01 enables the entire PFC block. Parameter 76.02 sets the speed reference source that the PFC logic uses to determine when to start/stop auxiliary pumps. Parameter 76.03 tells the drive how many pumps are in the system (master + auxiliaries).",
        descId:
          "Aktifkan fungsi PFC dan tentukan topologi sistem. Parameter 76.01 mengaktifkan seluruh blok PFC. Parameter 76.02 menetapkan sumber referensi kecepatan yang digunakan logika PFC untuk menentukan kapan memulai/menghentikan pompa bantu. Parameter 76.03 memberitahu drive berapa banyak pompa dalam sistem (master + bantu).",
        params: [
          {
            code: "76.01",
            nameEn: "PFC Enable",
            nameId: "Aktifkan PFC",
            setValue: "Enable",
            unit: "",
            note: "Enables the Pump and Fan Control multipump sequencing function",
          },
          {
            code: "76.02",
            nameEn: "PFC Auxiliary Speed Reference Source",
            nameId: "Sumber Referensi Kecepatan Bantu PFC",
            setValue: "Speed ref 1",
            unit: "",
            note: "Uses the main frequency setpoint as the basis for start/stop threshold comparisons",
          },
          {
            code: "76.03",
            nameEn: "PFC Number of Pumps",
            nameId: "Jumlah Pompa PFC",
            setValue: "2 or 3",
            unit: "",
            note: "Total number of pumps including master: set 2 for dual-pump or 3 for triple-pump system",
          },
        ],
      },
      {
        titleEn: "Set Auxiliary Pump Start and Stop Frequency Levels",
        titleId: "Atur Level Frekuensi Start dan Stop Pompa Bantu",
        descEn:
          "Define the frequency thresholds at which the master drive commands auxiliary pumps to start and stop. When the master drive output frequency reaches the start threshold (demand is high), the next pump is started. When frequency drops to the stop threshold (demand is low), the auxiliary pump is stopped. Hysteresis between start and stop levels prevents rapid cycling.",
        descId:
          "Tentukan ambang batas frekuensi di mana drive master memerintahkan pompa bantu untuk mulai dan berhenti. Ketika frekuensi output drive master mencapai ambang batas start (permintaan tinggi), pompa berikutnya dinyalakan. Ketika frekuensi turun ke ambang batas stop (permintaan rendah), pompa bantu dihentikan. Histeresis antara level start dan stop mencegah cycling cepat.",
        params: [
          {
            code: "76.11",
            nameEn: "Pump 2 Start Frequency",
            nameId: "Frekuensi Start Pompa 2",
            setValue: "35",
            unit: "Hz",
            note: "Master must reach 35 Hz before pump 2 is commanded ON; adjust based on system curve",
          },
          {
            code: "76.12",
            nameEn: "Pump 2 Stop Frequency",
            nameId: "Frekuensi Stop Pompa 2",
            setValue: "25",
            unit: "Hz",
            note: "Master drops to 25 Hz before pump 2 is commanded OFF; must be lower than 76.11",
          },
          {
            code: "76.13",
            nameEn: "Pump 3 Start Frequency",
            nameId: "Frekuensi Start Pompa 3",
            setValue: "45",
            unit: "Hz",
            note: "Used only when 76.03 = 3; master at 45 Hz triggers pump 3 start",
          },
          {
            code: "76.14",
            nameEn: "Pump 3 Stop Frequency",
            nameId: "Frekuensi Stop Pompa 3",
            setValue: "30",
            unit: "Hz",
            note: "Used only when 76.03 = 3; master drops to 30 Hz before pump 3 is stopped",
          },
        ],
      },
      {
        titleEn: "Configure PID Pressure Control (Group 40)",
        titleId: "Konfigurasi Kontrol Tekanan PID (Grup 40)",
        descEn:
          "Set up the closed-loop PID controller that regulates system pressure. The PID output becomes the drive frequency reference. Start with conservative Kp and Ti values and tune after the system is running. Derivative term (Td) is typically kept at 0 for pump systems due to noisy pressure feedback signals.",
        descId:
          "Atur kontroler PID loop tertutup yang mengatur tekanan sistem. Output PID menjadi referensi frekuensi drive. Mulai dengan nilai Kp dan Ti yang konservatif dan lakukan tuning setelah sistem berjalan. Suku derivatif (Td) biasanya dipertahankan pada 0 untuk sistem pompa karena sinyal feedback tekanan yang noisy.",
        params: [
          {
            code: "40.07",
            nameEn: "PID Setpoint Source",
            nameId: "Sumber Setpoint PID",
            setValue: "Constant setpoint 1",
            unit: "",
            note: "Use internal constant setpoint for fixed pressure; can be changed to AI2 for remote setpoint",
          },
          {
            code: "40.08",
            nameEn: "PID Setpoint 1",
            nameId: "Setpoint PID 1",
            setValue: "Pressure setpoint in bar (e.g. 4.0)",
            unit: "bar",
            note: "Enter the desired system pressure; must be within the transmitter range set in 12.17/12.18",
          },
          {
            code: "40.09",
            nameEn: "PID Feedback Source",
            nameId: "Sumber Feedback PID",
            setValue: "AI1 scaled",
            unit: "",
            note: "Selects scaled AI1 value (0–100%) as PID process variable input",
          },
          {
            code: "40.26",
            nameEn: "PID Proportional Gain (Kp)",
            nameId: "Gain Proporsional PID (Kp)",
            setValue: "1.0",
            unit: "",
            note: "Start at 1.0; increase for faster response but too high causes oscillation",
          },
          {
            code: "40.27",
            nameEn: "PID Integration Time (Ti)",
            nameId: "Waktu Integrasi PID (Ti)",
            setValue: "10",
            unit: "s",
            note: "Integral time in seconds; lower value = faster integral action; typical pump range 5–30 s",
          },
          {
            code: "40.28",
            nameEn: "PID Derivative Time (Td)",
            nameId: "Waktu Derivatif PID (Td)",
            setValue: "0",
            unit: "s",
            note: "Keep at 0 for pump systems; pressure transmitters have sufficient noise to destabilize derivative action",
          },
        ],
      },
      {
        titleEn: "Scale Pressure Transmitter on AI1",
        titleId: "Skalakan Transmitter Tekanan pada AI1",
        descEn:
          "Map the physical current signal from the pressure transmitter (4–20 mA) to the engineering pressure range (0–10 bar, or as appropriate for the transmitter). The drive converts the raw analog input to a 0–100% internal representation used by the PID feedback block. Verify actual current reading in parameter 12.01 before proceeding.",
        descId:
          "Petakan sinyal arus fisik dari transmitter tekanan (4–20 mA) ke rentang tekanan engineering (0–10 bar, atau sesuai dengan transmitter). Drive mengkonversi input analog mentah ke representasi internal 0–100% yang digunakan oleh blok feedback PID. Verifikasi pembacaan arus aktual di parameter 12.01 sebelum melanjutkan.",
        params: [
          {
            code: "12.17",
            nameEn: "AI1 Minimum Value",
            nameId: "Nilai Minimum AI1",
            setValue: "4.0",
            unit: "mA",
            note: "4 mA = 0 bar (or minimum pressure); dead band trip point if signal drops below this",
          },
          {
            code: "12.18",
            nameEn: "AI1 Maximum Value",
            nameId: "Nilai Maksimum AI1",
            setValue: "20.0",
            unit: "mA",
            note: "20 mA = full-scale bar rating of transmitter (e.g. 10 bar for 0–10 bar transmitter)",
          },
        ],
      },
      {
        titleEn: "Enable PFC Autochange (Pump Wear Equalisation)",
        titleId: "Aktifkan PFC Autochange (Penyamaan Keausan Pompa)",
        descEn:
          "The autochange function periodically rotates which pump acts as master to equalise running hours and mechanical wear across all pumps in the system. The interval is typically set to 24 hours. When autochange occurs, the current master ramps down and the next pump in the sequence takes over, creating a seamless handover without pressure interruption.",
        descId:
          "Fungsi autochange secara berkala merotasi pompa mana yang bertindak sebagai master untuk menyamakan jam operasi dan keausan mekanis di semua pompa dalam sistem. Interval biasanya diatur ke 24 jam. Ketika autochange terjadi, master saat ini ramps down dan pompa berikutnya dalam urutan mengambil alih, menciptakan serah terima yang mulus tanpa gangguan tekanan.",
        params: [
          {
            code: "76.31",
            nameEn: "PFC Auto Change Enable",
            nameId: "Aktifkan Auto Change PFC",
            setValue: "Enable",
            unit: "",
            note: "Enables automatic rotation of master pump assignment based on running hours",
          },
          {
            code: "76.32",
            nameEn: "PFC Auto Change Time",
            nameId: "Waktu Auto Change PFC",
            setValue: "24",
            unit: "h",
            note: "Hours between autochange events; 24 h = daily rotation; adjust based on site requirements",
          },
        ],
      },
      {
        titleEn: "Set Pump Interlock Signals",
        titleId: "Atur Sinyal Interlock Pompa",
        descEn:
          "Interlock inputs confirm that the auxiliary pump's contactor has actually closed before the PFC logic considers the pump running. If the contactor feedback is not received within a timeout period, the drive generates a fault. Wire contactor auxiliary contacts to the assigned digital inputs and configure the source parameters.",
        descId:
          "Input interlock mengkonfirmasi bahwa kontaktor pompa bantu sebenarnya telah menutup sebelum logika PFC mempertimbangkan pompa berjalan. Jika feedback kontaktor tidak diterima dalam periode timeout, drive menghasilkan fault. Pasang kontak bantu kontaktor ke input digital yang ditugaskan dan konfigurasi parameter sumber.",
        params: [
          {
            code: "76.41",
            nameEn: "Pump 2 Interlock Source",
            nameId: "Sumber Interlock Pompa 2",
            setValue: "DI3",
            unit: "",
            note: "Wire Pump 2 contactor auxiliary NC/NO feedback to DI3; drive faults if contactor fails to close",
          },
          {
            code: "76.42",
            nameEn: "Pump 3 Interlock Source",
            nameId: "Sumber Interlock Pompa 3",
            setValue: "DI4",
            unit: "",
            note: "Wire Pump 3 contactor auxiliary feedback to DI4; only needed when 76.03 = 3",
          },
        ],
      },
      {
        titleEn: "Test PFC Sequence Operation",
        titleId: "Uji Operasi Urutan PFC",
        descEn:
          "Start the system with low demand (close a bypass valve slightly to lower system demand). The master pump should run at low frequency under PID control. Gradually increase demand by opening system valves. Verify that at 35 Hz the drive starts pump 2 (contactor energises, DI3 feedback received). Verify that pressure is regulated around the setpoint with pump 2 running. Reduce demand and verify pump 2 stops when master drops to 25 Hz. Log all results.",
        descId:
          "Mulai sistem dengan permintaan rendah (tutup sedikit bypass valve untuk mengurangi permintaan sistem). Pompa master harus berjalan pada frekuensi rendah di bawah kontrol PID. Tingkatkan permintaan secara bertahap dengan membuka katup sistem. Verifikasi bahwa pada 35 Hz drive memulai pompa 2 (kontaktor energi, feedback DI3 diterima). Verifikasi bahwa tekanan diatur di sekitar setpoint dengan pompa 2 berjalan. Kurangi permintaan dan verifikasi pompa 2 berhenti ketika master turun ke 25 Hz. Catat semua hasil.",
        params: [],
      },
    ],
    limitSettings: [
      {
        param: "76.11",
        nameEn: "Pump 2 Start Frequency",
        nameId: "Frekuensi Start Pompa 2",
        min: "30",
        max: "45",
        typical: "35",
        unit: "Hz",
      },
      {
        param: "76.12",
        nameEn: "Pump 2 Stop Frequency",
        nameId: "Frekuensi Stop Pompa 2",
        min: "20",
        max: "30",
        typical: "25",
        unit: "Hz",
      },
      {
        param: "40.26",
        nameEn: "PID Proportional Gain (Kp)",
        nameId: "Gain Proporsional PID (Kp)",
        min: "0.1",
        max: "10",
        typical: "1.0",
        unit: "",
      },
      {
        param: "40.27",
        nameEn: "PID Integration Time (Ti)",
        nameId: "Waktu Integrasi PID (Ti)",
        min: "0.1",
        max: "300",
        typical: "10",
        unit: "s",
      },
      {
        param: "30.12",
        nameEn: "Maximum Frequency",
        nameId: "Frekuensi Maksimum",
        min: "40",
        max: "50",
        typical: "50",
        unit: "Hz",
      },
      {
        param: "12.17",
        nameEn: "AI1 Minimum (4 mA = 0 bar)",
        nameId: "Minimum AI1 (4 mA = 0 bar)",
        min: "4.0",
        max: "4.0",
        typical: "4.0",
        unit: "mA",
      },
      {
        param: "12.18",
        nameEn: "AI1 Maximum (20 mA = max bar)",
        nameId: "Maksimum AI1 (20 mA = bar maks)",
        min: "20.0",
        max: "20.0",
        typical: "20.0",
        unit: "mA",
      },
    ],
    manualRef: "ACQ580 User's Manual 3AUA0000085967 (Chapter: PFC)",
    estimatedMinutes: 60,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACQ580 — Timed Function
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "acq580-timer",
    drive: "ACQ580",
    difficulty: 2,
    titleEn: "Timed Function",
    titleId: "Fungsi Timer",
    objectiveEn:
      "Configure the ACQ580 timer function with a real-time clock (RTC) for automatic scheduled start and stop of HVAC fans or pump systems, including weekday scheduling, a boost period timer, manual override via digital input, and holiday exception days.",
    objectiveId:
      "Mengkonfigurasi fungsi timer ACQ580 dengan real-time clock (RTC) untuk start dan stop otomatis terjadwal untuk fan HVAC atau sistem pompa, termasuk penjadwalan hari kerja, timer periode boost, override manual melalui input digital, dan hari pengecualian libur.",
    prerequisitesEn: [
      "Basic motor commissioning completed (motor data, ID run, direction verified)",
      "RTC backup battery installed and good (CR2032 or equivalent in drive control unit)",
      "Digital input DI1 wired to manual override push-button or selector switch",
      "Relay output RO1 wired to running indicator light (optional but recommended for verification)",
    ],
    prerequisitesId: [
      "Commissioning motor dasar selesai (data motor, ID run, arah putaran diverifikasi)",
      "Baterai backup RTC terpasang dan baik (CR2032 atau setara di unit kontrol drive)",
      "Input digital DI1 terpasang ke tombol override manual atau switch selektor",
      "Relay output RO1 terpasang ke lampu indikator running (opsional tetapi direkomendasikan untuk verifikasi)",
    ],
    steps: [
      {
        titleEn: "Enable Timer Function and Set Drive Date/Time",
        titleId: "Aktifkan Fungsi Timer dan Atur Tanggal/Waktu Drive",
        descEn:
          "Enable the timer function block (parameter 34.01) and then navigate to the RTC settings in the panel to set the correct current date and time. Accurate time is essential — a wrong RTC setting will cause the drive to start/stop at wrong times. Confirm that the RTC retains time after a power cycle (battery test).",
        descId:
          "Aktifkan blok fungsi timer (parameter 34.01) lalu navigasi ke pengaturan RTC di panel untuk mengatur tanggal dan waktu saat ini yang benar. Waktu yang akurat sangat penting — pengaturan RTC yang salah akan menyebabkan drive mulai/berhenti pada waktu yang salah. Konfirmasi bahwa RTC mempertahankan waktu setelah siklus daya (uji baterai).",
        params: [
          {
            code: "34.01",
            nameEn: "Timer Function Enable",
            nameId: "Aktifkan Fungsi Timer",
            setValue: "Enable",
            unit: "",
            note: "Must be enabled before any timer or RTC parameters are active",
          },
        ],
      },
      {
        titleEn: "Configure Timer 1 On-Time and Off-Time",
        titleId: "Konfigurasi Waktu On dan Off Timer 1",
        descEn:
          "Set the daily start time and stop time for Timer 1. This defines the primary operating window. Times are entered in 24-hour HH:MM format. For a typical office building HVAC schedule, 06:00 to 18:00 covers normal occupancy hours.",
        descId:
          "Atur waktu mulai harian dan waktu berhenti untuk Timer 1. Ini mendefinisikan jendela operasi utama. Waktu dimasukkan dalam format 24 jam HH:MM. Untuk jadwal HVAC gedung perkantoran tipikal, 06:00 hingga 18:00 mencakup jam hunian normal.",
        params: [
          {
            code: "34.10",
            nameEn: "Timer 1 Start Time",
            nameId: "Waktu Start Timer 1",
            setValue: "06:00",
            unit: "HH:MM",
            note: "Adjust to match site operating schedule; enter in 24-hour format",
          },
          {
            code: "34.11",
            nameEn: "Timer 1 Stop Time",
            nameId: "Waktu Stop Timer 1",
            setValue: "18:00",
            unit: "HH:MM",
            note: "Drive will automatically stop at this time unless manual override (DI1) is active",
          },
        ],
      },
      {
        titleEn: "Set Timer 1 Weekday Mask",
        titleId: "Atur Masker Hari Kerja Timer 1",
        descEn:
          "Define which days of the week Timer 1 is active using a bitmask. The mask uses 7 bits where bit 1 = Monday, bit 2 = Tuesday, through bit 7 = Sunday. A value of 62 (binary 0111110) activates Monday through Friday only, leaving weekends inactive. Calculate the correct value for the site schedule.",
        descId:
          "Tentukan hari-hari dalam seminggu ketika Timer 1 aktif menggunakan bitmask. Mask menggunakan 7 bit di mana bit 1 = Senin, bit 2 = Selasa, sampai bit 7 = Minggu. Nilai 62 (biner 0111110) mengaktifkan Senin hingga Jumat saja, membiarkan akhir pekan tidak aktif. Hitung nilai yang benar untuk jadwal situs.",
        params: [
          {
            code: "34.12",
            nameEn: "Timer 1 Weekday Mask",
            nameId: "Masker Hari Kerja Timer 1",
            setValue: "62",
            unit: "bitmask",
            note: "62 = Mon–Fri; 127 = all days; 96 = Sat+Sun only. Bit values: Mon=2, Tue=4, Wed=8, Thu=16, Fri=32, Sat=64, Sun=1",
          },
        ],
      },
      {
        titleEn: "Configure Timer 1 Action and Output Frequency",
        titleId: "Konfigurasi Aksi Timer 1 dan Frekuensi Output",
        descEn:
          "Map the timer output to the drive's start/stop reference and set the frequency setpoint to use when the timer is active. When Timer 1 fires, the drive starts automatically and runs at the configured timer frequency setpoint.",
        descId:
          "Petakan output timer ke referensi start/stop drive dan atur setpoint frekuensi yang digunakan saat timer aktif. Ketika Timer 1 aktif, drive memulai secara otomatis dan berjalan pada setpoint frekuensi timer yang dikonfigurasi.",
        params: [
          {
            code: "34.20",
            nameEn: "Timer 1 Action Source",
            nameId: "Sumber Aksi Timer 1",
            setValue: "Start/stop reference",
            unit: "",
            note: "Routes timer output as the start/stop command source for Ext1 or Ext2 as configured in 20.01",
          },
          {
            code: "34.21",
            nameEn: "Timer 1 Frequency Setpoint",
            nameId: "Setpoint Frekuensi Timer 1",
            setValue: "50",
            unit: "Hz",
            note: "Drive will run at this frequency during the timer window; set to system design speed",
          },
        ],
      },
      {
        titleEn: "Configure Timer 2 — Morning Boost Period",
        titleId: "Konfigurasi Timer 2 — Periode Boost Pagi",
        descEn:
          "Configure a second timer to run a pre-conditioning boost cycle 30 minutes before the main timer starts. This is common for HVAC systems to pre-cool or pre-heat a space before occupants arrive. Timer 2 feeds into the same drive start command and operates at the same frequency.",
        descId:
          "Konfigurasi timer kedua untuk menjalankan siklus boost pre-conditioning 30 menit sebelum timer utama dimulai. Ini umum untuk sistem HVAC untuk mendinginkan atau memanaskan terlebih dahulu ruangan sebelum penghuni tiba. Timer 2 masuk ke perintah start drive yang sama dan beroperasi pada frekuensi yang sama.",
        params: [
          {
            code: "34.30",
            nameEn: "Timer 2 Enable",
            nameId: "Aktifkan Timer 2",
            setValue: "Enable",
            unit: "",
            note: "Enable Timer 2 for the boost pre-schedule",
          },
          {
            code: "34.31",
            nameEn: "Timer 2 Start Time",
            nameId: "Waktu Start Timer 2",
            setValue: "05:30",
            unit: "HH:MM",
            note: "30 min before Timer 1 start; adjust to match required pre-conditioning duration",
          },
          {
            code: "34.32",
            nameEn: "Timer 2 Stop Time",
            nameId: "Waktu Stop Timer 2",
            setValue: "06:00",
            unit: "HH:MM",
            note: "Timer 2 stops when Timer 1 begins — seamless handover to normal schedule",
          },
          {
            code: "34.33",
            nameEn: "Timer 2 Weekday Mask",
            nameId: "Masker Hari Kerja Timer 2",
            setValue: "62",
            unit: "bitmask",
            note: "Match Timer 1 weekday mask for the same days of the week",
          },
        ],
      },
      {
        titleEn: "Configure Manual Override via DI1",
        titleId: "Konfigurasi Override Manual via DI1",
        descEn:
          "Allow operators to manually start the drive outside the scheduled timer window using digital input DI1. When DI1 is asserted, the drive starts and runs regardless of timer status. The drive will continue running until DI1 is released, then return to timer control. This is essential for out-of-schedule events such as weekend emergency operation.",
        descId:
          "Izinkan operator untuk memulai drive secara manual di luar jendela timer yang dijadwalkan menggunakan input digital DI1. Ketika DI1 diaktifkan, drive mulai dan berjalan terlepas dari status timer. Drive akan terus berjalan sampai DI1 dilepas, kemudian kembali ke kontrol timer. Ini sangat penting untuk acara di luar jadwal seperti operasi darurat akhir pekan.",
        params: [
          {
            code: "20.01",
            nameEn: "Ext1 Commands",
            nameId: "Perintah Ext1",
            setValue: "DI1 (manual override) combined with Timer output (scheduled)",
            unit: "",
            note: "Configure so that DI1 asserted = force start; timer output = scheduled start; either source can start the drive",
          },
        ],
      },
      {
        titleEn: "Test Timer Function by Advancing RTC",
        titleId: "Uji Fungsi Timer dengan Memajukan RTC",
        descEn:
          "To verify timer function without waiting for the scheduled time, temporarily advance the RTC clock to just before the Timer 1 start time. Observe the drive auto-start at the configured time. Then advance past the stop time and verify auto-stop. Reset the RTC to the correct time after testing. Record the test results with timestamps.",
        descId:
          "Untuk memverifikasi fungsi timer tanpa menunggu waktu yang dijadwalkan, majukan sementara jam RTC ke tepat sebelum waktu start Timer 1. Amati drive auto-start pada waktu yang dikonfigurasi. Kemudian majukan melewati waktu stop dan verifikasi auto-stop. Reset RTC ke waktu yang benar setelah pengujian. Catat hasil pengujian dengan timestamp.",
        params: [],
      },
      {
        titleEn: "Configure Holiday / Exception Day Shutdown",
        titleId: "Konfigurasi Shutdown Hari Libur / Hari Pengecualian",
        descEn:
          "Program annual exception days (public holidays, planned shutdowns) so the drive does not start on those dates even if the timer would normally fire. Exception days override the weekday mask. In Indonesia, program at minimum the 14 national holidays and any company-specific shutdown dates.",
        descId:
          "Program hari pengecualian tahunan (hari libur nasional, shutdown terencana) sehingga drive tidak mulai pada tanggal tersebut meskipun timer biasanya akan aktif. Hari pengecualian mengganti masker hari kerja. Di Indonesia, program setidaknya 14 hari libur nasional dan tanggal shutdown khusus perusahaan.",
        params: [
          {
            code: "34.40",
            nameEn: "Exception Day Enable",
            nameId: "Aktifkan Hari Pengecualian",
            setValue: "Enable",
            unit: "",
            note: "Must be enabled to allow exception day entries to take effect",
          },
          {
            code: "34.41",
            nameEn: "Exception Day 1 Date",
            nameId: "Tanggal Hari Pengecualian 1",
            setValue: "DD/MM (e.g. 17/08 for Indonesian Independence Day)",
            unit: "DD/MM",
            note: "Enter year-recurring date; drive will not auto-start on this day regardless of timer",
          },
        ],
      },
    ],
    limitSettings: [
      {
        param: "34.10",
        nameEn: "Timer 1 Start Time",
        nameId: "Waktu Start Timer 1",
        min: "00:00",
        max: "23:59",
        typical: "06:00",
        unit: "HH:MM",
      },
      {
        param: "34.11",
        nameEn: "Timer 1 Stop Time",
        nameId: "Waktu Stop Timer 1",
        min: "00:00",
        max: "23:59",
        typical: "18:00",
        unit: "HH:MM",
      },
      {
        param: "34.21",
        nameEn: "Timer Frequency Setpoint",
        nameId: "Setpoint Frekuensi Timer",
        min: "0",
        max: "50",
        typical: "50",
        unit: "Hz",
      },
      {
        param: "34.31",
        nameEn: "Boost Pre-Start Lead Time Before Main Schedule",
        nameId: "Waktu Awal Boost Sebelum Jadwal Utama",
        min: "15",
        max: "30",
        typical: "30",
        unit: "min",
      },
    ],
    manualRef: "ACQ580 User's Manual 3AUA0000085967 (Chapter: Timer function)",
    estimatedMinutes: 45,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACQ580 — Analog Scaling
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "acq580-analog",
    drive: "ACQ580",
    difficulty: 1,
    titleEn: "Analog Scaling",
    titleId: "Penskalaan Analog",
    objectiveEn:
      "Scale the ACQ580 analog input AI1 to accept a 4–20 mA remote frequency setpoint from a PLC, SCADA, or positioner, mapping 4 mA to 0 Hz and 20 mA to 50 Hz with signal noise filtering and under-signal supervision alarm.",
    objectiveId:
      "Menskalakan input analog ACQ580 AI1 untuk menerima setpoint frekuensi remote 4–20 mA dari PLC, SCADA, atau positioner, memetakan 4 mA ke 0 Hz dan 20 mA ke 50 Hz dengan filtering noise sinyal dan alarm supervisi sinyal di bawah minimum.",
    prerequisitesEn: [
      "Signal source (PLC output, SCADA AO card, or loop calibrator) wired to AI1 terminals X2:2 (+) and X2:3 (−)",
      "Shielded cable used for AI1 signal wiring; shield grounded at drive end only",
      "Basic motor commissioning completed (motor data, ID run done)",
      "Drive in remote (REM) control mode with Ext1 active",
    ],
    prerequisitesId: [
      "Sumber sinyal (output PLC, kartu AO SCADA, atau loop calibrator) terpasang ke terminal AI1 X2:2 (+) dan X2:3 (−)",
      "Kabel berpelindung digunakan untuk kabel sinyal AI1; pelindung diground di sisi drive saja",
      "Commissioning motor dasar selesai (data motor, ID run selesai)",
      "Drive dalam mode kontrol remote (REM) dengan Ext1 aktif",
    ],
    steps: [
      {
        titleEn: "Select AI1 Input Signal Type",
        titleId: "Pilih Tipe Sinyal Input AI1",
        descEn:
          "Configure AI1 to accept a current signal (mA) rather than a voltage signal (V). The ACQ580 AI1 is configurable for either 0–10 V or 0/4–20 mA via a hardware jumper on the I/O board AND a software parameter. Both must match. Check the drive installation manual for the correct jumper position, then set the software parameter.",
        descId:
          "Konfigurasi AI1 untuk menerima sinyal arus (mA) daripada sinyal tegangan (V). AI1 ACQ580 dapat dikonfigurasi untuk 0–10 V atau 0/4–20 mA melalui jumper hardware di papan I/O DAN parameter software. Keduanya harus sesuai. Periksa manual instalasi drive untuk posisi jumper yang benar, lalu atur parameter software.",
        params: [
          {
            code: "12.15",
            nameEn: "AI1 Unit Selection",
            nameId: "Seleksi Unit AI1",
            setValue: "mA",
            unit: "",
            note: "Set to 'mA' for 4–20 mA current loop signal; set to 'V' for 0–10 V voltage signal. Verify hardware jumper matches.",
          },
        ],
      },
      {
        titleEn: "Set AI1 Signal Range",
        titleId: "Atur Rentang Sinyal AI1",
        descEn:
          "Define the minimum and maximum physical values of the incoming signal. For a 4–20 mA transmitter or PLC output, 4 mA represents the minimum condition (0 Hz / 0 bar) and 20 mA represents the maximum condition (50 Hz / full scale). These raw signal boundaries are used by the drive to calculate the 0–100% internal scaling.",
        descId:
          "Tentukan nilai fisik minimum dan maksimum dari sinyal yang masuk. Untuk transmitter 4–20 mA atau output PLC, 4 mA mewakili kondisi minimum (0 Hz / 0 bar) dan 20 mA mewakili kondisi maksimum (50 Hz / skala penuh). Batas sinyal mentah ini digunakan drive untuk menghitung penskalaan internal 0–100%.",
        params: [
          {
            code: "12.17",
            nameEn: "AI1 Minimum Value",
            nameId: "Nilai Minimum AI1",
            setValue: "4.0",
            unit: "mA",
            note: "Lower physical signal boundary; 4.0 mA for standard current loop",
          },
          {
            code: "12.18",
            nameEn: "AI1 Maximum Value",
            nameId: "Nilai Maksimum AI1",
            setValue: "20.0",
            unit: "mA",
            note: "Upper physical signal boundary; 20.0 mA for standard current loop",
          },
        ],
      },
      {
        titleEn: "Set AI1 Filter Time Constant",
        titleId: "Atur Konstanta Waktu Filter AI1",
        descEn:
          "Apply a low-pass filter to the AI1 input to smooth out electrical noise from the signal cable or source. A filter time of 0.3 s is a good starting value for VSD setpoint signals — it removes most 50 Hz noise without introducing excessive lag. If the drive hunts or responds erratically, increase the filter time. If response is sluggish, decrease it.",
        descId:
          "Terapkan filter low-pass pada input AI1 untuk menghaluskan noise listrik dari kabel sinyal atau sumber. Waktu filter 0,3 detik adalah nilai awal yang baik untuk sinyal setpoint VSD — ini menghilangkan sebagian besar noise 50 Hz tanpa menimbulkan lag yang berlebihan. Jika drive hunting atau merespons secara tidak teratur, tingkatkan waktu filter. Jika respons lambat, kurangi.",
        params: [
          {
            code: "12.16",
            nameEn: "AI1 Filter Time",
            nameId: "Waktu Filter AI1",
            setValue: "0.3",
            unit: "s",
            note: "Range 0.0–30.0 s; 0 = no filtering; 0.1–1.0 s typical for setpoint signals",
          },
        ],
      },
      {
        titleEn: "Map AI1 to External Frequency Reference",
        titleId: "Petakan AI1 ke Referensi Frekuensi Eksternal",
        descEn:
          "Configure the drive's external reference chain to use the scaled AI1 value as the frequency setpoint for Ext1 control. Set the reference minimum and maximum values to match the desired output frequency range corresponding to 4 mA and 20 mA respectively.",
        descId:
          "Konfigurasi rantai referensi eksternal drive untuk menggunakan nilai AI1 yang diskalakan sebagai setpoint frekuensi untuk kontrol Ext1. Atur nilai minimum dan maksimum referensi agar sesuai dengan rentang frekuensi output yang diinginkan yang bersesuaian dengan 4 mA dan 20 mA.",
        params: [
          {
            code: "28.11",
            nameEn: "Ext1 Frequency Reference 1 Source",
            nameId: "Sumber Referensi Frekuensi 1 Ext1",
            setValue: "AI1 scaled",
            unit: "",
            note: "Routes the 0–100% scaled AI1 value into the Ext1 frequency reference chain",
          },
          {
            code: "28.13",
            nameEn: "Ext1 Reference 1 Minimum",
            nameId: "Minimum Referensi 1 Ext1",
            setValue: "0",
            unit: "Hz",
            note: "Frequency output when AI1 = 4 mA (minimum signal); set to minimum process speed if >0",
          },
          {
            code: "28.14",
            nameEn: "Ext1 Reference 1 Maximum",
            nameId: "Maksimum Referensi 1 Ext1",
            setValue: "50",
            unit: "Hz",
            note: "Frequency output when AI1 = 20 mA (maximum signal); must not exceed 30.12 max frequency",
          },
        ],
      },
      {
        titleEn: "Verify Live Analog Reading",
        titleId: "Verifikasi Pembacaan Analog Live",
        descEn:
          "Using a loop calibrator or the PLC output, inject exactly 4.0 mA into AI1 and read parameter 12.01 (AI1 actual mA value) from the panel — it should read 4.0 mA. Then check parameter 12.03 (AI1 scaled %) — it should read 0.0%. Inject 20.0 mA and verify 12.01 = 20.0 mA and 12.03 = 100.0%. Any deviation indicates a wiring issue or hardware jumper mismatch.",
        descId:
          "Menggunakan loop calibrator atau output PLC, injeksikan tepat 4,0 mA ke AI1 dan baca parameter 12.01 (nilai mA aktual AI1) dari panel — harus membaca 4,0 mA. Kemudian periksa parameter 12.03 (AI1 diskalakan %) — harus membaca 0,0%. Injeksikan 20,0 mA dan verifikasi 12.01 = 20,0 mA dan 12.03 = 100,0%. Setiap deviasi mengindikasikan masalah kabel atau ketidaksesuaian jumper hardware.",
        params: [
          {
            code: "12.01",
            nameEn: "AI1 Actual Value",
            nameId: "Nilai Aktual AI1",
            setValue: "Read actual — verify matches injected mA",
            unit: "mA",
            note: "Monitor parameter: actual mA reading at AI1 terminal; compare to source output",
          },
          {
            code: "12.03",
            nameEn: "AI1 Scaled Value",
            nameId: "Nilai Terskalakan AI1",
            setValue: "Read actual — 0% at 4 mA, 100% at 20 mA",
            unit: "%",
            note: "Internal 0–100% representation after range scaling; drives frequency reference when mapped via 28.11",
          },
        ],
      },
      {
        titleEn: "Set AI1 Dead Band",
        titleId: "Atur Dead Band AI1",
        descEn:
          "Configure a dead band near the minimum signal value to prevent the drive from responding to noise near the 4 mA floor. Without a dead band, noise on the signal cable can cause the drive to hunt between stopped and very low speed when the commanded setpoint is near zero. A 0.5 mA dead band means the drive ignores signal variations between 4.0 and 4.5 mA.",
        descId:
          "Konfigurasi dead band dekat nilai sinyal minimum untuk mencegah drive merespons noise dekat lantai 4 mA. Tanpa dead band, noise pada kabel sinyal dapat menyebabkan drive hunting antara berhenti dan kecepatan sangat rendah ketika setpoint mendekati nol. Dead band 0,5 mA berarti drive mengabaikan variasi sinyal antara 4,0 dan 4,5 mA.",
        params: [
          {
            code: "12.19",
            nameEn: "AI1 Dead Band",
            nameId: "Dead Band AI1",
            setValue: "0.5",
            unit: "mA",
            note: "Applies hysteresis around the minimum signal; prevents jitter near 4 mA threshold",
          },
        ],
      },
      {
        titleEn: "Test Full Analog Range",
        titleId: "Uji Rentang Analog Penuh",
        descEn:
          "Using a loop calibrator, ramp the AI1 signal slowly from 4 mA to 20 mA in increments (4, 8, 12, 16, 20 mA) while observing the drive output frequency displayed on parameter 01.03. Verify linearity: each 4 mA step should produce a 12.5 Hz increase. Record all readings. If there is non-linearity or offset, recheck parameters 12.17, 12.18, 28.13, and 28.14.",
        descId:
          "Menggunakan loop calibrator, naikkan sinyal AI1 perlahan dari 4 mA ke 20 mA dalam increment (4, 8, 12, 16, 20 mA) sambil mengamati frekuensi output drive yang ditampilkan pada parameter 01.03. Verifikasi linearitas: setiap kenaikan 4 mA harus menghasilkan kenaikan 12,5 Hz. Catat semua pembacaan. Jika ada non-linearitas atau offset, periksa kembali parameter 12.17, 12.18, 28.13, dan 28.14.",
        params: [
          {
            code: "01.03",
            nameEn: "Output Frequency",
            nameId: "Frekuensi Output",
            setValue: "Read actual — should be linear with AI1",
            unit: "Hz",
            note: "Expected: 4 mA=0 Hz, 8 mA=12.5 Hz, 12 mA=25 Hz, 16 mA=37.5 Hz, 20 mA=50 Hz",
          },
        ],
      },
      {
        titleEn: "Configure AI1 Under-Signal Supervision Alarm",
        titleId: "Konfigurasi Alarm Supervisi AI1 Di Bawah Minimum",
        descEn:
          "Enable under-signal supervision to generate a warning or fault if the AI1 signal drops below the minimum threshold. This detects a broken wire (0 mA on a 4–20 mA loop) or a failed transmitter. Configure supervision mode to generate warning F-0072 (Signal below minimum) without stopping the drive, allowing the process to continue at a safe fallback speed.",
        descId:
          "Aktifkan supervisi under-signal untuk menghasilkan peringatan atau fault jika sinyal AI1 turun di bawah ambang batas minimum. Ini mendeteksi kabel putus (0 mA pada loop 4–20 mA) atau transmitter yang rusak. Konfigurasi mode supervisi untuk menghasilkan peringatan F-0072 (Sinyal di bawah minimum) tanpa menghentikan drive, memungkinkan proses berlanjut pada kecepatan fallback yang aman.",
        params: [
          {
            code: "12.21",
            nameEn: "AI1 Supervision Mode",
            nameId: "Mode Supervisi AI1",
            setValue: "Below minimum → warning F-0072",
            unit: "",
            note: "Options: No action / Warning / Fault; 'Warning' recommended to alert without stopping process",
          },
        ],
      },
    ],
    limitSettings: [
      {
        param: "12.17",
        nameEn: "AI1 Minimum",
        nameId: "Minimum AI1",
        min: "4.0",
        max: "4.0",
        typical: "4.0",
        unit: "mA",
      },
      {
        param: "12.18",
        nameEn: "AI1 Maximum",
        nameId: "Maksimum AI1",
        min: "20.0",
        max: "20.0",
        typical: "20.0",
        unit: "mA",
      },
      {
        param: "28.13",
        nameEn: "Reference Minimum",
        nameId: "Referensi Minimum",
        min: "0",
        max: "30.12",
        typical: "0",
        unit: "Hz",
      },
      {
        param: "28.14",
        nameEn: "Reference Maximum",
        nameId: "Referensi Maksimum",
        min: "10",
        max: "50",
        typical: "50",
        unit: "Hz",
      },
      {
        param: "12.16",
        nameEn: "AI1 Filter Time",
        nameId: "Waktu Filter AI1",
        min: "0.1",
        max: "1.0",
        typical: "0.3",
        unit: "s",
      },
      {
        param: "12.19",
        nameEn: "AI1 Dead Band",
        nameId: "Dead Band AI1",
        min: "0.3",
        max: "0.5",
        typical: "0.5",
        unit: "mA",
      },
    ],
    manualRef: "ACQ580 User's Manual 3AUA0000085967 (Chapter: I/O configuration)",
    estimatedMinutes: 20,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACS880 — Initial Commissioning
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "acs880-initial",
    drive: "ACS880",
    difficulty: 2,
    titleEn: "Initial Commissioning",
    titleId: "Commissioning Awal",
    objectiveEn:
      "Perform first-time commissioning of an ACS880 drive for a general industrial motor load using ABB Direct Torque Control (DTC), including safety checks, motor data entry, standstill ID run, and first controlled run.",
    objectiveId:
      "Melakukan commissioning pertama kali drive ACS880 untuk beban motor industri umum menggunakan ABB Direct Torque Control (DTC), termasuk pemeriksaan keselamatan, entri data motor, standstill ID run, dan running terkontrol pertama.",
    prerequisitesEn: [
      "Power connections verified: L1/L2/L3 input, PE bonding, and U/V/W output to motor terminals",
      "Motor nameplate data available (Un, fn, nn, In, Pn, cos φ, torque Nm if available)",
      "DC bus voltage confirmed <5 V with calibrated multimeter before opening drive cabinet (capacitor bleed-down period observed)",
      "Safety interlocks and emergency stop wiring complete and tested",
    ],
    prerequisitesId: [
      "Koneksi daya diverifikasi: input L1/L2/L3, bonding PE, dan output U/V/W ke terminal motor",
      "Data nameplate motor tersedia (Un, fn, nn, In, Pn, cos φ, torsi Nm jika tersedia)",
      "Tegangan DC bus dikonfirmasi <5 V dengan multimeter yang dikalibrasi sebelum membuka kabinet drive (periode bleeding kapasitor diobservasi)",
      "Kabel interlock keselamatan dan emergency stop lengkap dan diuji",
    ],
    steps: [
      {
        titleEn: "Pre-Commissioning Safety Verification",
        titleId: "Verifikasi Keselamatan Pra-Commissioning",
        descEn:
          "Perform full LOTO before any physical inspection. Measure DC bus voltage between DC+ and DC− terminals with a calibrated multimeter — must be <5 V to confirm capacitors are fully discharged; ACS880 requires up to 5 minutes bleed-down after power-off. Megger motor windings at 500 V DC — result must be >100 MΩ to earth for each phase. Verify PE continuity from motor frame to drive PE busbar ≤1 Ω. Confirm cooling fan rotation direction if forced-air cooled model.",
        descId:
          "Lakukan LOTO penuh sebelum inspeksi fisik apapun. Ukur tegangan DC bus antara terminal DC+ dan DC− dengan multimeter yang dikalibrasi — harus <5 V untuk mengkonfirmasi kapasitor sepenuhnya terisi; ACS880 membutuhkan hingga 5 menit bleed-down setelah power-off. Megger belitan motor pada 500 V DC — hasilnya harus >100 MΩ ke ground untuk setiap fase. Verifikasi kontinuitas PE dari rangka motor ke busbar PE drive ≤1 Ω. Konfirmasi arah putaran kipas pendingin jika model pendingin udara paksa.",
        params: [],
      },
      {
        titleEn: "Initial Power-Up Without Motor Run",
        titleId: "Power-Up Awal Tanpa Menjalankan Motor",
        descEn:
          "Apply supply power to the drive without issuing any start command. The ACS880 control panel should illuminate and display the startup screen, then settle on READY or OFF status with no active faults. If any fault appears on first power-up, read the fault code and diagnose before proceeding. Common first-power-up faults include supply phase loss (A-3181) or DC undervoltage (A-3220) — verify supply connections if these appear.",
        descId:
          "Terapkan suplai daya ke drive tanpa mengeluarkan perintah start apapun. Panel kontrol ACS880 harus menyala dan menampilkan layar startup, kemudian menetap pada status READY atau OFF tanpa fault aktif. Jika ada fault yang muncul saat power-up pertama, baca kode fault dan diagnosa sebelum melanjutkan. Fault power-up pertama yang umum termasuk phase loss suplai (A-3181) atau DC undervoltage (A-3220) — verifikasi koneksi suplai jika ini muncul.",
        params: [],
      },
      {
        titleEn: "Motor Nameplate Data Entry",
        titleId: "Entri Data Nameplate Motor",
        descEn:
          "Enter the complete motor nameplate data into parameter group 99. For ACS880 DTC, accurate motor data is essential because the DTC motor model is built directly from these values — errors in nameplate entry propagate directly into current and torque accuracy. If motor torque (Nm) is not printed on the nameplate, calculate it: Tn = (Pn × 9549) / nn.",
        descId:
          "Masukkan data nameplate motor lengkap ke dalam grup parameter 99. Untuk ACS880 DTC, data motor yang akurat sangat penting karena model motor DTC dibangun langsung dari nilai-nilai ini — kesalahan dalam entri nameplate merambat langsung ke akurasi arus dan torsi. Jika torsi motor (Nm) tidak tercetak pada nameplate, hitung: Tn = (Pn × 9549) / nn.",
        params: [
          {
            code: "99.04",
            nameEn: "Motor Nominal Voltage",
            nameId: "Tegangan Nominal Motor",
            setValue: "Motor nameplate Un",
            unit: "V",
            note: "Match connection: star (Y) voltage or delta (Δ) voltage as wired; e.g. 400 V star",
          },
          {
            code: "99.05",
            nameEn: "Motor Nominal Frequency",
            nameId: "Frekuensi Nominal Motor",
            setValue: "50",
            unit: "Hz",
            note: "50 Hz for Indonesia; verify nameplate explicitly",
          },
          {
            code: "99.06",
            nameEn: "Motor Nominal Speed",
            nameId: "Kecepatan Nominal Motor",
            setValue: "Motor nameplate nn",
            unit: "rpm",
            note: "Slip-corrected nameplate speed (e.g. 1470 rpm for 4-pole), not synchronous speed",
          },
          {
            code: "99.07",
            nameEn: "Motor Nominal Current",
            nameId: "Arus Nominal Motor",
            setValue: "Motor nameplate In",
            unit: "A",
            note: "Use rated current for the configured voltage (star or delta) — critical for DTC accuracy",
          },
          {
            code: "99.08",
            nameEn: "Motor Nominal Power",
            nameId: "Daya Nominal Motor",
            setValue: "Motor nameplate Pn",
            unit: "kW",
            note: "Enter in kW; if HP on nameplate, multiply by 0.746",
          },
          {
            code: "99.09",
            nameEn: "Motor Nominal Cos Phi",
            nameId: "Cos Phi Nominal Motor",
            setValue: "Motor nameplate cos φ",
            unit: "",
            note: "Power factor from nameplate; typically 0.75–0.92 for standard induction motors",
          },
          {
            code: "99.10",
            nameEn: "Motor Nominal Torque",
            nameId: "Torsi Nominal Motor",
            setValue: "Motor nameplate Tn (or Pn × 9549 / nn)",
            unit: "Nm",
            note: "Optional but recommended for ACS880 DTC; improves torque reference accuracy",
          },
        ],
      },
      {
        titleEn: "Select Motor Control Mode — DTC",
        titleId: "Pilih Mode Kontrol Motor — DTC",
        descEn:
          "Set the motor control mode to DTC (Direct Torque Control). This is the default and recommended mode for ACS880 drives with induction motors. DTC provides accurate torque and flux estimation without an encoder, making it suitable for most industrial applications. Scalar (V/Hz) mode is only needed for special applications such as multiple motors on one drive or very long motor cables.",
        descId:
          "Atur mode kontrol motor ke DTC (Direct Torque Control). Ini adalah mode default dan yang direkomendasikan untuk drive ACS880 dengan motor induksi. DTC memberikan estimasi torsi dan fluks yang akurat tanpa encoder, sehingga cocok untuk sebagian besar aplikasi industri. Mode Scalar (V/Hz) hanya dibutuhkan untuk aplikasi khusus seperti beberapa motor pada satu drive atau kabel motor yang sangat panjang.",
        params: [
          {
            code: "99.04",
            nameEn: "Motor Control Mode",
            nameId: "Mode Kontrol Motor",
            setValue: "DTC",
            unit: "",
            note: "DTC = Direct Torque Control; default for ACS880. Requires ID run after selection. Scalar mode available for special cases.",
          },
        ],
      },
      {
        titleEn: "Perform Standstill ID Run",
        titleId: "Lakukan Standstill ID Run",
        descEn:
          "Select Standstill ID run when the motor cannot be decoupled from the load (coupled to gearbox or pump). The standstill ID run applies DC and AC test signals to the motor without rotating the shaft — it identifies stator resistance and leakage inductance but cannot identify the full magnetisation curve. Result accuracy is lower than a rotating ID run but acceptable for most pumping and fan applications. Press START and wait for 'ID run done' — do NOT interrupt. Duration approximately 2–5 minutes.",
        descId:
          "Pilih Standstill ID run ketika motor tidak dapat dilepas dari beban (terhubung ke gearbox atau pompa). Standstill ID run menerapkan sinyal uji DC dan AC ke motor tanpa memutar poros — ini mengidentifikasi resistansi stator dan induktansi bocor tetapi tidak dapat mengidentifikasi kurva magnetisasi penuh. Akurasi hasil lebih rendah dari rotating ID run tetapi dapat diterima untuk sebagian besar aplikasi pemompaan dan fan. Tekan START dan tunggu 'ID run done' — JANGAN menghentikan. Durasi sekitar 2–5 menit.",
        params: [
          {
            code: "99.13",
            nameEn: "ID Run Selection",
            nameId: "Seleksi ID Run",
            setValue: "Standstill",
            unit: "",
            note: "Motor does NOT rotate during standstill ID run. Safe for coupled loads. Use 'Rotating' if shaft can be freed for better accuracy.",
          },
        ],
      },
      {
        titleEn: "Set Torque and Speed Limits",
        titleId: "Atur Batas Torsi dan Kecepatan",
        descEn:
          "Configure operating envelope limits. For unidirectional pump or fan applications, set minimum speed to 0 rpm and maximum speed to rated speed. For bidirectional or reversing loads, set negative minimum speed. Torque limits define the maximum torque the drive will produce — 300% is appropriate for standard induction motors; for pump applications where motoring torque only is needed, set minimum torque to 0%.",
        descId:
          "Konfigurasi batas envelope operasi. Untuk aplikasi pompa atau fan satu arah, atur kecepatan minimum ke 0 rpm dan kecepatan maksimum ke kecepatan nominal. Untuk beban dua arah atau reversing, atur kecepatan minimum negatif. Batas torsi menentukan torsi maksimum yang akan dihasilkan drive — 300% sesuai untuk motor induksi standar; untuk aplikasi pompa di mana hanya torsi motoring yang dibutuhkan, atur torsi minimum ke 0%.",
        params: [
          {
            code: "30.11",
            nameEn: "Minimum Speed",
            nameId: "Kecepatan Minimum",
            setValue: "0 rpm (pumps) or −Nmax (reversing)",
            unit: "rpm",
            note: "0 for unidirectional applications; set negative value only for loads requiring reversal",
          },
          {
            code: "30.12",
            nameEn: "Maximum Speed",
            nameId: "Kecepatan Maksimum",
            setValue: "1500 (4-pole 50 Hz) or 3000 (2-pole 50 Hz)",
            unit: "rpm",
            note: "Set to 100–105% of motor nameplate speed; 4-pole synchronous = 1500, nameplate ~1450–1480 rpm",
          },
          {
            code: "30.26",
            nameEn: "Maximum Torque 1",
            nameId: "Torsi Maksimum 1",
            setValue: "300",
            unit: "%",
            note: "Maximum motoring torque as % of nominal; 200–300% for standard industrial loads",
          },
          {
            code: "30.27",
            nameEn: "Minimum Torque 1",
            nameId: "Torsi Minimum 1",
            setValue: "0 (pump) or −300 (reversing/regenerative)",
            unit: "%",
            note: "0% for pump/fan (motoring only); negative value for loads requiring regenerative braking torque",
          },
        ],
      },
      {
        titleEn: "First Controlled Run at 30% Speed",
        titleId: "Running Terkontrol Pertama pada 30% Kecepatan",
        descEn:
          "Issue a start command from the panel and ramp to approximately 30% of rated speed (e.g., 450 rpm for a 1500 rpm motor). Monitor the drive's actual output values. Compare output current to expected no-load current (30–50% of In). If current is much higher than expected at no load, recheck motor data entry and ID run completion status before proceeding to full speed.",
        descId:
          "Keluarkan perintah start dari panel dan ramping ke sekitar 30% dari kecepatan nominal (misalnya, 450 rpm untuk motor 1500 rpm). Monitor nilai output aktual drive. Bandingkan arus output dengan arus tanpa beban yang diharapkan (30–50% dari In). Jika arus jauh lebih tinggi dari yang diharapkan pada tanpa beban, periksa kembali entri data motor dan status penyelesaian ID run sebelum melanjutkan ke kecepatan penuh.",
        params: [
          {
            code: "01.01",
            nameEn: "Motor Speed Actual",
            nameId: "Kecepatan Motor Aktual",
            setValue: "Read actual",
            unit: "rpm",
            note: "Monitor: should track speed reference closely; excessive deviation indicates DTC issue",
          },
          {
            code: "01.03",
            nameEn: "Output Frequency",
            nameId: "Frekuensi Output",
            setValue: "Read actual",
            unit: "Hz",
            note: "Monitor at 30% speed: ~15 Hz for 50 Hz motor",
          },
          {
            code: "01.04",
            nameEn: "Output Current",
            nameId: "Arus Output",
            setValue: "Read actual — compare to nameplate In",
            unit: "A",
            note: "No-load current at 30% speed typically 25–45% of In; higher indicates magnetisation issue",
          },
        ],
      },
      {
        titleEn: "Optional Rotating ID Run for Better Accuracy",
        titleId: "ID Run Berputar Opsional untuk Akurasi Lebih Baik",
        descEn:
          "If the motor can be uncoupled from the load (shaft free to rotate), perform a Rotating ID run for superior DTC motor model accuracy. The rotating ID run spins the motor up to approximately 70% of rated speed, fully identifying the magnetisation curve and rotor time constant. This is required for demanding applications such as winders, extruders, or hoists. After the rotating ID run, the drive replaces the standstill model with the more complete rotating model.",
        descId:
          "Jika motor dapat dilepas dari beban (poros bebas berputar), lakukan Rotating ID run untuk akurasi model motor DTC yang superior. Rotating ID run memutar motor hingga sekitar 70% dari kecepatan nominal, sepenuhnya mengidentifikasi kurva magnetisasi dan konstanta waktu rotor. Ini diperlukan untuk aplikasi yang menuntut akurasi torsi dinamis tinggi seperti winder, ekstruder, atau hoist. Setelah rotating ID run, drive menggantikan model standstill dengan model yang lebih lengkap dari rotating.",
        params: [
          {
            code: "99.13",
            nameEn: "ID Run Selection",
            nameId: "Seleksi ID Run",
            setValue: "Rotating",
            unit: "",
            note: "Motor rotates to ~70% rated speed during this ID run. Motor must be uncoupled from load. Better model accuracy than standstill.",
          },
        ],
      },
    ],
    limitSettings: [
      {
        param: "30.11",
        nameEn: "Minimum Speed",
        nameId: "Kecepatan Minimum",
        min: "0",
        max: "0",
        typical: "0 (pumps/fans) or −Nmax (reversing)",
        unit: "rpm",
      },
      {
        param: "30.12",
        nameEn: "Maximum Speed",
        nameId: "Kecepatan Maksimum",
        min: "Nrated",
        max: "1.05 × Nrated",
        typical: "1500 (4-pole 50 Hz) or 3000 (2-pole 50 Hz)",
        unit: "rpm",
      },
      {
        param: "30.26",
        nameEn: "Maximum Torque",
        nameId: "Torsi Maksimum",
        min: "150",
        max: "300",
        typical: "300",
        unit: "%",
      },
      {
        param: "30.17",
        nameEn: "Maximum Current",
        nameId: "Arus Maksimum",
        min: "In",
        max: "1.5 × In",
        typical: "1.5 × In",
        unit: "A",
      },
      {
        param: "30.20",
        nameEn: "Motor Overload Power",
        nameId: "Daya Overload Motor",
        min: "100",
        max: "150",
        typical: "110–120",
        unit: "%",
      },
      {
        param: "28.71",
        nameEn: "Acceleration Ramp 1",
        nameId: "Ramp Akselerasi 1",
        min: "5",
        max: "30",
        typical: "10",
        unit: "s",
      },
    ],
    manualRef: "ACS880 Primary Control Program Firmware Manual 3AUA0000085967 rev E",
    estimatedMinutes: 90,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACS880 — N5050 Crane Program
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "acs880-n5050",
    drive: "ACS880",
    difficulty: 3,
    titleEn: "N5050 Crane Program",
    titleId: "Program Crane N5050",
    objectiveEn:
      "Activate and configure the ACS880 N5050 crane option firmware package for an overhead crane hoist application, including mechanical brake control, torque proving, overspeed monitoring, anti-sway (for bridge/crab axes), and end-of-travel limit switch integration.",
    objectiveId:
      "Mengaktifkan dan mengkonfigurasi paket firmware opsi crane ACS880 N5050 untuk aplikasi hoist overhead crane, termasuk kontrol rem mekanis, torque proving, monitoring overspeed, anti-sway (untuk sumbu bridge/crab), dan integrasi limit switch end-of-travel.",
    prerequisitesEn: [
      "ACS880 drive with N5050 crane control firmware loaded and licensed (verify with ABB before delivery)",
      "Mechanical brake verified functional and wired to BCU (Brake Control Unit) module if fitted; brake coil voltage and current confirmed",
      "Encoder (HTL or TTL type) connected to FEN-01 or FEN-02 encoder interface module if speed feedback is required",
      "Crane application type determined (hoist / bridge / crab/traverse) and crane duty cycle class known (standard or high-cycle)",
      "Torque proving output wiring to brake release circuit complete and verified against crane electrical schematic",
    ],
    prerequisitesId: [
      "Drive ACS880 dengan firmware kontrol crane N5050 dimuat dan dilisensikan (verifikasi dengan ABB sebelum pengiriman)",
      "Rem mekanis diverifikasi berfungsi dan terpasang ke modul BCU (Brake Control Unit) jika terpasang; tegangan dan arus koil rem dikonfirmasi",
      "Encoder (tipe HTL atau TTL) terhubung ke modul antarmuka encoder FEN-01 atau FEN-02 jika feedback kecepatan diperlukan",
      "Tipe aplikasi crane ditentukan (hoist / bridge / crab/traverse) dan kelas siklus tugas crane diketahui (standar atau high-cycle)",
      "Kabel output torque proving ke sirkuit pelepas rem lengkap dan diverifikasi terhadap skema listrik crane",
    ],
    steps: [
      {
        titleEn: "Verify N5050 Crane Firmware Active",
        titleId: "Verifikasi Firmware Crane N5050 Aktif",
        descEn:
          "Confirm that the crane-specific N5050 firmware package is loaded and active on the ACS880 drive. Read parameters 06.01 and 06.02 from the panel. If the software version string (06.01) does not include 'CRANE' and the application name (06.02) does not read 'N5050 Crane Control', the standard firmware is loaded — contact ABB to obtain and load the correct N5050 crane firmware image. Do not attempt crane parameter configuration with standard firmware.",
        descId:
          "Konfirmasi bahwa paket firmware N5050 khusus crane dimuat dan aktif pada drive ACS880. Baca parameter 06.01 dan 06.02 dari panel. Jika string versi software (06.01) tidak menyertakan 'CRANE' dan nama aplikasi (06.02) tidak membaca 'N5050 Crane Control', firmware standar yang dimuat — hubungi ABB untuk mendapatkan dan memuat image firmware crane N5050 yang benar. Jangan mencoba konfigurasi parameter crane dengan firmware standar.",
        params: [
          {
            code: "06.01",
            nameEn: "Software Version",
            nameId: "Versi Software",
            setValue: "Read — must contain 'CRANE'",
            unit: "",
            note: "Verify crane firmware is active; string must include 'CRANE' identifier",
          },
          {
            code: "06.02",
            nameEn: "Application Name",
            nameId: "Nama Aplikasi",
            setValue: "N5050 Crane Control",
            unit: "",
            note: "If this reads something else, standard firmware is loaded — N5050 crane firmware is required",
          },
        ],
      },
      {
        titleEn: "Set Crane Application Type and Duty Class",
        titleId: "Atur Tipe Aplikasi Crane dan Kelas Tugas",
        descEn:
          "Define the crane axis being commissioned. The N5050 firmware has different control strategies for hoist (vertical lifting), bridge (main horizontal travel), and crab/traverse (cross-travel on the bridge girder). Anti-sway and brake logic behaviour differ between these types. Also define the duty cycle class — high-cycle applications require different thermal derating and control parameters.",
        descId:
          "Tentukan sumbu crane yang sedang di-commissioning. Firmware N5050 memiliki strategi kontrol yang berbeda untuk hoist (pengangkat vertikal), bridge (perjalanan horizontal utama), dan crab/traverse (perjalanan melintang pada girder jembatan). Perilaku logika anti-sway dan rem berbeda antara tipe-tipe ini. Juga tentukan kelas siklus tugas — aplikasi high-cycle memerlukan derating termal dan parameter kontrol yang berbeda.",
        params: [
          {
            code: "03.05",
            nameEn: "Crane Type",
            nameId: "Tipe Crane",
            setValue: "1=Hoist / 2=Bridge / 3=Crab",
            unit: "",
            note: "1=Hoist (vertical); 2=Bridge (main travel); 3=Crab (cross-travel). Anti-sway only active for Bridge and Crab types.",
          },
          {
            code: "03.06",
            nameEn: "Crane Application",
            nameId: "Aplikasi Crane",
            setValue: "0=Standard / 1=High cycle",
            unit: "",
            note: "Standard for normal industrial overhead cranes; High cycle for intensive-duty port/steel mill cranes",
          },
        ],
      },
      {
        titleEn: "Configure Mechanical Brake Control",
        titleId: "Konfigurasi Kontrol Rem Mekanis",
        descEn:
          "The N5050 crane firmware includes an integrated mechanical brake control sequence that manages brake open and close timing around drive start and stop commands. Correct configuration prevents load slippage at brake release and ensures smooth brake engagement at stop. The brake is opened only after torque proving confirms the drive is holding the load.",
        descId:
          "Firmware crane N5050 menyertakan urutan kontrol rem mekanis terintegrasi yang mengelola waktu buka dan tutup rem di sekitar perintah start dan stop drive. Konfigurasi yang benar mencegah slip beban saat pelepasan rem dan memastikan keterlibatan rem yang mulus saat berhenti. Rem hanya dibuka setelah torque proving mengkonfirmasi drive sedang menahan beban.",
        params: [
          {
            code: "44.01",
            nameEn: "Brake Control Enable",
            nameId: "Aktifkan Kontrol Rem",
            setValue: "Enable",
            unit: "",
            note: "Enables the integrated crane brake control state machine in the N5050 firmware",
          },
          {
            code: "44.06",
            nameEn: "Brake Open Delay",
            nameId: "Delay Buka Rem",
            setValue: "0.2",
            unit: "s",
            note: "Time between torque proving completion and brake release signal; 0.1–0.5 s typical; longer for mechanical brake with slow coil response",
          },
          {
            code: "44.07",
            nameEn: "Brake Close Speed",
            nameId: "Kecepatan Tutup Rem",
            setValue: "2",
            unit: "% of rated speed",
            note: "Speed threshold at which brake is applied during deceleration; 2% prevents brake closing at running speed",
          },
          {
            code: "44.08",
            nameEn: "Brake Hold Current",
            nameId: "Arus Tahan Rem",
            setValue: "Per brake datasheet (% of motor In)",
            unit: "% of In",
            note: "DC injection current to hold motor flux during brake delay period; prevents shaft movement before brake closes",
          },
        ],
      },
      {
        titleEn: "Configure Torque Proving",
        titleId: "Konfigurasi Torque Proving",
        descEn:
          "Torque proving is a safety-critical function that confirms the drive can produce sufficient torque to hold the load before releasing the mechanical brake. If the drive cannot prove torque (motor fault, broken phase), the brake remains closed and the load does not drop. Set the proving level above 100% to ensure the drive can hold the rated load including dynamic effects.",
        descId:
          "Torque proving adalah fungsi kritis keselamatan yang mengkonfirmasi drive dapat menghasilkan torsi yang cukup untuk menahan beban sebelum melepaskan rem mekanis. Jika drive tidak dapat membuktikan torsi (fault motor, fase putus), rem tetap tertutup dan beban tidak jatuh. Atur level proving di atas 100% untuk memastikan drive benar-benar dapat menahan beban nominal termasuk efek dinamis.",
        params: [
          {
            code: "44.16",
            nameEn: "Torque Proving Mode",
            nameId: "Mode Torque Proving",
            setValue: "Enable",
            unit: "",
            note: "Enable torque proving before brake open; critical safety function — do not disable for hoist applications",
          },
          {
            code: "44.17",
            nameEn: "Torque Proving Level",
            nameId: "Level Torque Proving",
            setValue: "120",
            unit: "% of nominal torque",
            note: "Drive must produce this torque level before releasing brake; 100–130% for hoists; accounts for static friction and load variation",
          },
          {
            code: "44.18",
            nameEn: "Torque Proving Time",
            nameId: "Waktu Torque Proving",
            setValue: "0.5",
            unit: "s",
            note: "Duration the drive must sustain the proving torque before brake opens; 0.3–1.0 s; longer for high-inertia loads",
          },
        ],
      },
      {
        titleEn: "Configure Speed Monitoring and Overspeed Protection",
        titleId: "Konfigurasi Monitoring Kecepatan dan Proteksi Overspeed",
        descEn:
          "Set overspeed trip limit and zero-speed detection threshold. Overspeed protection is mandatory for crane hoists — if the load causes the motor to accelerate beyond the trip limit (runaway condition during braking failure), the drive will trip and close the brake. Configure speed feedback source — if encoder is fitted, select encoder; otherwise, use DTC estimated speed.",
        descId:
          "Atur batas trip overspeed dan ambang batas deteksi kecepatan nol. Proteksi overspeed wajib untuk hoist crane — jika beban menyebabkan motor berakselerasi melebihi batas trip (kondisi runaway selama kegagalan pengereman), drive akan trip dan menutup rem. Konfigurasi sumber feedback kecepatan — jika encoder terpasang, pilih encoder; jika tidak, gunakan kecepatan estimasi DTC.",
        params: [
          {
            code: "24.01",
            nameEn: "Overspeed Trip Limit",
            nameId: "Batas Trip Overspeed",
            setValue: "120",
            unit: "% of maximum speed",
            note: "Drive trips if actual speed exceeds this % of 30.12 max speed; mandatory safety function for hoists",
          },
          {
            code: "24.02",
            nameEn: "Zero Speed Detection Level",
            nameId: "Level Deteksi Kecepatan Nol",
            setValue: "2",
            unit: "% of rated speed",
            note: "Speed below which the drive considers itself at zero speed; used in brake close and anti-sway logic",
          },
          {
            code: "90.01",
            nameEn: "Speed Feedback Selection",
            nameId: "Seleksi Feedback Kecepatan",
            setValue: "Encoder (if FEN-01/02 fitted) or Estimated (DTC)",
            unit: "",
            note: "Encoder gives more precise brake control and overspeed detection; DTC estimate sufficient for many hoist applications",
          },
        ],
      },
      {
        titleEn: "Configure Anti-Sway Function (Bridge and Crab Axes Only)",
        titleId: "Konfigurasi Fungsi Anti-Sway (Hanya Sumbu Bridge dan Crab)",
        descEn:
          "Anti-sway filters the drive acceleration profile to null out the natural pendulum oscillation of the suspended load. It is only applicable to bridge and crab (traverse) axes — NOT for hoists. The key input is the actual rope or chain length, which determines the pendulum natural frequency. The anti-sway gain adjusts the correction strength. Start with gain = 1.0 and tune upward in 0.2 steps while observing load swing after stopping.",
        descId:
          "Anti-sway memfilter profil akselerasi drive untuk menghilangkan osilasi pendulum alami dari beban yang digantung. Ini hanya berlaku untuk sumbu bridge dan crab (traverse) — TIDAK untuk hoist. Input utama adalah panjang tali atau rantai aktual, yang menentukan frekuensi alami pendulum. Gain anti-sway menyesuaikan kekuatan koreksi. Mulai dengan gain = 1,0 dan naikkan dalam langkah 0,2 sambil mengamati ayunan beban setelah berhenti.",
        params: [
          {
            code: "75.01",
            nameEn: "Anti-Sway Enable",
            nameId: "Aktifkan Anti-Sway",
            setValue: "Enable (bridge/crab only)",
            unit: "",
            note: "Enable only for bridge and crab axes; has no effect and should NOT be enabled for hoist drives",
          },
          {
            code: "75.02",
            nameEn: "Anti-Sway Rope Length",
            nameId: "Panjang Tali Anti-Sway",
            setValue: "Actual rope/chain length at hook",
            unit: "m",
            note: "Measure actual hanging length from trolley sheave to hook; tune at mid-height working position",
          },
          {
            code: "75.03",
            nameEn: "Anti-Sway Gain",
            nameId: "Gain Anti-Sway",
            setValue: "1.0",
            unit: "",
            note: "Start at 1.0; increase in 0.2 steps during load tests; optimal value eliminates residual swing after stop without overshoot",
          },
        ],
      },
      {
        titleEn: "Configure End-of-Travel Limit Switches",
        titleId: "Konfigurasi Limit Switch End-of-Travel",
        descEn:
          "Wire and configure the end-of-travel (EOT) limit switches to protect against over-travel in all crane motions. Typically there are two levels: a slow-down (pre-limit) switch that reduces speed to creep speed, and a final limit switch that triggers emergency stop. The creep speed during approach to the limit gives the mechanical brake time to stop the load precisely without impact.",
        descId:
          "Pasang dan konfigurasi limit switch end-of-travel (EOT) untuk melindungi dari over-travel di semua gerakan crane. Biasanya ada dua level: switch slow-down (pre-limit) yang mengurangi kecepatan ke kecepatan merangkak, dan limit switch akhir yang memicu emergency stop. Kecepatan merangkak selama pendekatan ke limit memberi waktu rem mekanis untuk menghentikan beban dengan tepat tanpa benturan.",
        params: [
          {
            code: "20.01",
            nameEn: "DI5 Source Assignment",
            nameId: "Penugasan Sumber DI5",
            setValue: "High speed limit (slow-down limit switch)",
            unit: "",
            note: "Wire pre-travel limit switch (slow-down) to DI5; drive reduces to creep speed when DI5 opens",
          },
          {
            code: "20.02",
            nameEn: "DI6 Source Assignment",
            nameId: "Penugasan Sumber DI6",
            setValue: "Final limit (emergency stop travel limit)",
            unit: "",
            note: "Wire final travel limit switch to DI6; drive performs emergency stop when DI6 opens",
          },
          {
            code: "44.25",
            nameEn: "Creep Speed",
            nameId: "Kecepatan Merangkak",
            setValue: "5",
            unit: "Hz",
            note: "Output frequency after slow-down limit switch activates; 3–10 Hz typical; gives brake time to stop load precisely",
          },
        ],
      },
      {
        titleEn: "Commissioning Test Sequence — No Load and Load Tests",
        titleId: "Urutan Uji Commissioning — Uji Tanpa Beban dan Dengan Beban",
        descEn:
          "Follow a structured commissioning test sequence. No-load test first: command hoist up and verify (1) torque proving completes within 44.18 time, (2) brake opens after torque proven, (3) hoist runs at commanded speed, (4) on stop command brake closes at speed at or below 44.07, (5) overspeed trip can be verified by temporarily lowering 24.01. Then load test in steps: 25%, 50%, and 100% of rated load. At each step verify smooth start, stable lift speed, and clean stop. Document all timings.",
        descId:
          "Ikuti urutan uji commissioning terstruktur. Uji tanpa beban terlebih dahulu: perintahkan hoist naik dan verifikasi (1) torque proving selesai dalam waktu 44.18, (2) rem terbuka setelah torsi terbukti, (3) hoist berjalan pada kecepatan yang diperintahkan, (4) pada perintah stop rem menutup pada kecepatan di atau di bawah 44.07, (5) trip overspeed dapat diverifikasi dengan sementara menurunkan 24.01. Kemudian uji beban dalam langkah: 25%, 50%, dan 100% beban nominal. Pada setiap langkah verifikasi start yang mulus, kecepatan angkat yang stabil, dan stop yang bersih. Dokumentasikan semua waktu.",
        params: [],
      },
    ],
    limitSettings: [
      {
        param: "44.06",
        nameEn: "Brake Open Delay",
        nameId: "Delay Buka Rem",
        min: "0.1",
        max: "0.5",
        typical: "0.2",
        unit: "s",
      },
      {
        param: "44.17",
        nameEn: "Torque Proving Level",
        nameId: "Level Torque Proving",
        min: "100",
        max: "150",
        typical: "120",
        unit: "%",
      },
      {
        param: "44.18",
        nameEn: "Torque Proving Time",
        nameId: "Waktu Torque Proving",
        min: "0.3",
        max: "1.0",
        typical: "0.5",
        unit: "s",
      },
      {
        param: "24.01",
        nameEn: "Overspeed Trip Limit",
        nameId: "Batas Trip Overspeed",
        min: "110",
        max: "125",
        typical: "120",
        unit: "% of rated speed",
      },
      {
        param: "44.25",
        nameEn: "Creep Speed",
        nameId: "Kecepatan Merangkak",
        min: "3",
        max: "10",
        typical: "5",
        unit: "Hz",
      },
      {
        param: "75.03",
        nameEn: "Anti-Sway Gain",
        nameId: "Gain Anti-Sway",
        min: "0.5",
        max: "3.0",
        typical: "1.0 (tune on site)",
        unit: "",
      },
    ],
    manualRef: "ACS880-N5050 Crane Control Program Application Manual 3AXD10000036193",
    estimatedMinutes: 120,
  },
  // ── ACQ580 Pump Curve + Sensorless Flow ──────────────────────────────────
  {
    id: "acq580-pump-curve",
    drive: "ACQ580",
    difficulty: 2,
    titleEn: "Pump Q-H Curve & Sensorless Flow Calculation",
    titleId: "Kurva Q-H Pompa & Kalkulasi Aliran Sensorless",
    objectiveEn:
      "Enter the pump's H-Q characteristic curve into the ACQ580, activate the sensorless flow calculation, and verify the drive's estimated flow matches a reference measurement — eliminating the need for an external flow meter.",
    objectiveId:
      "Memasukkan kurva karakteristik H-Q pompa ke ACQ580, mengaktifkan kalkulasi aliran sensorless, dan memverifikasi estimasi aliran drive sesuai dengan pengukuran referensi — menghilangkan kebutuhan flow meter eksternal.",
    prerequisitesEn: [
      "Pump datasheet available: H-Q table at rated speed (min 3 operating points: shutoff, BEP, max flow)",
      "Pump rated speed (rpm), rated flow (m³/h), rated head (m), and BEP efficiency (%) known",
      "Motor nameplate data entered and ID run completed (acq580-simple prerequisite)",
      "Pressure transmitter on discharge side wired to AI1 (for head feedback during calibration)",
      "Drive Composer Pro connected — group 46 parameter visibility requires engineering-level access",
    ],
    prerequisitesId: [
      "Datasheet pompa tersedia: tabel H-Q pada kecepatan rated (min 3 titik: shutoff, BEP, aliran maksimum)",
      "Kecepatan rated pompa (rpm), aliran rated (m³/h), head rated (m), dan efisiensi BEP (%) diketahui",
      "Data nameplate motor sudah diinput dan ID run selesai (prasyarat acq580-simple)",
      "Transmitter tekanan pada sisi discharge terkabel ke AI1 (untuk feedback head saat kalibrasi)",
      "Drive Composer Pro terhubung — visibilitas parameter grup 46 memerlukan akses level engineering",
    ],
    steps: [
      {
        titleEn: "Extract pump datasheet curve points",
        titleId: "Ekstrak titik kurva dari datasheet pompa",
        descEn:
          "From the pump manufacturer's H-Q curve at rated speed, read at least 5 operating points: (1) shutoff head Q=0, (2) 25% rated flow, (3) 50% rated flow / BEP vicinity, (4) rated flow, (5) maximum flow (end of curve). Record head in metres and flow in m³/h. These will be entered directly into ACQ580 parameter group 46.",
        descId:
          "Dari kurva H-Q pabrikan pompa pada kecepatan rated, baca minimal 5 titik operasi: (1) shutoff head Q=0, (2) 25% aliran rated, (3) 50% aliran rated / sekitar BEP, (4) aliran rated, (5) aliran maksimum. Catat head dalam meter dan aliran dalam m³/h. Ini akan diinput langsung ke grup parameter 46 ACQ580.",
      },
      {
        titleEn: "Enable sensorless flow function",
        titleId: "Aktifkan fungsi aliran sensorless",
        descEn:
          "Activate the pump curve feature and select the sensorless flow calculation method. Parameter 46.01 arms the feature. Set parameter 46.02 to 'Sensorless' to use motor power + pump curve for flow estimation rather than an AI signal.",
        descId:
          "Aktifkan fitur pump curve dan pilih metode kalkulasi aliran sensorless. Parameter 46.01 mengaktifkan fitur ini. Set parameter 46.02 ke 'Sensorless' untuk menggunakan daya motor + kurva pompa sebagai estimasi aliran, bukan sinyal AI.",
        params: [
          { code: "46.01", nameEn: "Pump curve enable", nameId: "Aktifkan pump curve", setValue: "Enable", note: "Enables group 46 pump characteristic entry" },
          { code: "46.02", nameEn: "Flow calculation source", nameId: "Sumber kalkulasi aliran", setValue: "Sensorless", note: "Sensorless = uses motor power + curve; Sensor = uses AI input" },
          { code: "46.11", nameEn: "Pump rated flow", nameId: "Aliran rated pompa", setValue: "From nameplate", unit: "m³/h", note: "Nominal flow at rated speed and rated head" },
          { code: "46.12", nameEn: "Pump rated head", nameId: "Head rated pompa", setValue: "From nameplate", unit: "m", note: "Head corresponding to rated flow point" },
          { code: "46.13", nameEn: "Rated pump speed for curve", nameId: "Kecepatan rated pompa untuk kurva", setValue: "From nameplate", unit: "rpm", note: "Speed at which the H-Q curve was measured" },
        ],
      },
      {
        titleEn: "Enter H-Q curve — shutoff and low-flow points",
        titleId: "Input kurva H-Q — titik shutoff dan aliran rendah",
        descEn:
          "Enter the first two curve points: point 1 is the shutoff head (H at Q=0, maximum head), and point 2 is the low-flow / pre-BEP operating point. The ACQ580 interpolates between entered points. Accuracy of shutoff head directly affects the sensorless flow estimate at low speeds.",
        descId:
          "Input dua titik kurva pertama: titik 1 adalah shutoff head (H pada Q=0, head maksimum), dan titik 2 adalah titik operasi aliran rendah / sebelum BEP. ACQ580 menginterpolasi di antara titik yang diinput. Akurasi shutoff head langsung mempengaruhi estimasi aliran sensorless pada kecepatan rendah.",
        params: [
          { code: "46.21", nameEn: "Curve point 1 flow (shutoff)", nameId: "Aliran titik kurva 1 (shutoff)", setValue: "0", unit: "m³/h", note: "Q=0 at shutoff — motor running, valve closed" },
          { code: "46.22", nameEn: "Curve point 1 head (shutoff)", nameId: "Head titik kurva 1 (shutoff)", setValue: "From datasheet", unit: "m", note: "Maximum head of the pump" },
          { code: "46.23", nameEn: "Curve point 2 flow", nameId: "Aliran titik kurva 2", setValue: "~25% of rated", unit: "m³/h" },
          { code: "46.24", nameEn: "Curve point 2 head", nameId: "Head titik kurva 2", setValue: "From datasheet", unit: "m" },
        ],
      },
      {
        titleEn: "Enter H-Q curve — BEP and high-flow points",
        titleId: "Input kurva H-Q — titik BEP dan aliran tinggi",
        descEn:
          "Enter the BEP (Best Efficiency Point) and the maximum flow point. The BEP is where the pump operates most efficiently; always try to design the system to operate near BEP. The maximum flow point defines the flat end of the curve where head drops sharply.",
        descId:
          "Input titik BEP (Best Efficiency Point) dan titik aliran maksimum. BEP adalah di mana pompa beroperasi paling efisien; selalu usahakan sistem beroperasi mendekati BEP. Titik aliran maksimum mendefinisikan ujung datar kurva di mana head turun tajam.",
        params: [
          { code: "46.25", nameEn: "Curve point 3 flow (BEP vicinity)", nameId: "Aliran titik kurva 3 (sekitar BEP)", setValue: "~50–60% of rated", unit: "m³/h" },
          { code: "46.26", nameEn: "Curve point 3 head", nameId: "Head titik kurva 3", setValue: "From datasheet", unit: "m" },
          { code: "46.27", nameEn: "Curve point 4 flow (rated)", nameId: "Aliran titik kurva 4 (rated)", setValue: "Rated flow from nameplate", unit: "m³/h" },
          { code: "46.28", nameEn: "Curve point 4 head", nameId: "Head titik kurva 4 (rated)", setValue: "Rated head from nameplate", unit: "m" },
          { code: "46.29", nameEn: "Curve point 5 flow (max)", nameId: "Aliran titik kurva 5 (maks)", setValue: "Max flow from datasheet", unit: "m³/h" },
          { code: "46.30", nameEn: "Curve point 5 head", nameId: "Head titik kurva 5 (maks)", setValue: "Head at max flow", unit: "m" },
        ],
      },
      {
        titleEn: "Enter pump efficiency at BEP",
        titleId: "Input efisiensi pompa pada BEP",
        descEn:
          "The drive uses pump efficiency (η) at BEP to calculate motor power demand at each operating point. This directly improves the accuracy of the sensorless flow estimate. BEP efficiency is found on the pump datasheet performance curve, typically 70–85% for centrifugal pumps.",
        descId:
          "Drive menggunakan efisiensi pompa (η) pada BEP untuk menghitung kebutuhan daya motor pada setiap titik operasi. Ini langsung meningkatkan akurasi estimasi aliran sensorless. Efisiensi BEP ada di kurva kinerja datasheet pompa, biasanya 70–85% untuk pompa sentrifugal.",
        params: [
          { code: "46.14", nameEn: "Pump efficiency at BEP", nameId: "Efisiensi pompa pada BEP", setValue: "From datasheet (%)", unit: "%", note: "Typical: 72–85% for centrifugal pumps" },
          { code: "46.15", nameEn: "Fluid density", nameId: "Densitas fluida", setValue: "1000", unit: "kg/m³", note: "1000 for water; adjust for other fluids (e.g. 900 for light oil)" },
        ],
      },
      {
        titleEn: "Verify sensorless flow estimate at known point",
        titleId: "Verifikasi estimasi aliran sensorless di titik yang diketahui",
        descEn:
          "Run the pump at rated speed with the discharge valve fully open. Read the estimated flow from parameter 01.72 in Drive Composer Pro. Compare against a reference measurement (ultrasonic clamp-on meter, or existing flow meter). Acceptable deviation ≤ ±5% of rated flow at BEP; ±10% acceptable at off-BEP points.",
        descId:
          "Jalankan pompa pada kecepatan rated dengan katup discharge terbuka penuh. Baca estimasi aliran dari parameter 01.72 di Drive Composer Pro. Bandingkan dengan pengukuran referensi (ultrasonic clamp-on meter, atau flow meter yang ada). Deviasi yang dapat diterima ≤ ±5% dari aliran rated di BEP; ±10% dapat diterima di titik off-BEP.",
        params: [
          { code: "01.72", nameEn: "Estimated flow (actual value, read-only)", nameId: "Estimasi aliran (nilai aktual, baca saja)", setValue: "Monitor", unit: "m³/h", note: "Compare vs reference measurement; target ≤ ±5% at BEP" },
          { code: "01.73", nameEn: "Estimated head (actual value, read-only)", nameId: "Estimasi head (nilai aktual, baca saja)", setValue: "Monitor", unit: "m", note: "Cross-check against pressure gauge on discharge" },
        ],
      },
      {
        titleEn: "Apply flow offset calibration if needed",
        titleId: "Terapkan kalibrasi offset aliran jika diperlukan",
        descEn:
          "If estimated flow deviates beyond tolerance, apply a calibration offset or gain correction. Parameter 46.31 (flow gain) multiplies the raw estimate — set it so estimated flow matches reference at BEP. Parameter 46.32 (flow offset) adds a constant correction for systematic bias. Recheck at 50% and 100% speed after calibration.",
        descId:
          "Jika estimasi aliran menyimpang lebih dari toleransi, terapkan kalibrasi offset atau koreksi gain. Parameter 46.31 (flow gain) mengalikan estimasi mentah — set agar estimasi aliran sesuai referensi pada BEP. Parameter 46.32 (flow offset) menambah koreksi konstan untuk bias sistematis. Periksa ulang pada 50% dan 100% kecepatan setelah kalibrasi.",
        params: [
          { code: "46.31", nameEn: "Flow calculation gain", nameId: "Gain kalkulasi aliran", setValue: "1.0 (adjust ±)", unit: "", note: "1.0 = no correction; 0.95 reduces estimate by 5%" },
          { code: "46.32", nameEn: "Flow calculation offset", nameId: "Offset kalkulasi aliran", setValue: "0.0", unit: "m³/h", note: "Use only for constant systematic bias at all speeds" },
        ],
      },
      {
        titleEn: "Set flow-based process alarm and monitoring",
        titleId: "Set alarm proses berbasis aliran dan monitoring",
        descEn:
          "Configure alarms based on estimated flow to detect abnormal conditions: low flow alarm (possible cavitation or closed valve), high flow alarm (overload / runout condition). Wire estimated flow to AO1 (0–10V or 4–20mA) if SCADA logging is required.",
        descId:
          "Konfigurasi alarm berdasarkan estimasi aliran untuk mendeteksi kondisi abnormal: alarm aliran rendah (kemungkinan kavitasi atau katup tertutup), alarm aliran tinggi (kelebihan beban / kondisi runout). Hubungkan estimasi aliran ke AO1 (0–10V atau 4–20mA) jika diperlukan logging SCADA.",
        params: [
          { code: "46.41", nameEn: "Low flow alarm level", nameId: "Level alarm aliran rendah", setValue: "15–20% of rated", unit: "m³/h", note: "Alarm when flow drops below this — indicates dry run or cavitation risk" },
          { code: "46.42", nameEn: "Low flow alarm delay", nameId: "Delay alarm aliran rendah", setValue: "5–10", unit: "s", note: "Delay prevents false alarms during start-up transient" },
          { code: "46.43", nameEn: "High flow alarm level", nameId: "Level alarm aliran tinggi", setValue: "110% of rated", unit: "m³/h", note: "Alarm when pump operates in runout zone (beyond BEP)" },
          { code: "15.07", nameEn: "AO1 source (for SCADA)", nameId: "Sumber AO1 (untuk SCADA)", setValue: "01.72 (estimated flow)", unit: "", note: "Maps sensorless flow to 4–20 mA analogue output" },
        ],
      },
    ],
    limitSettings: [
      { param: "46.11", nameEn: "Rated pump flow", nameId: "Aliran rated pompa", typical: "From nameplate", unit: "m³/h" },
      { param: "46.12", nameEn: "Rated pump head", nameId: "Head rated pompa", typical: "From nameplate", unit: "m" },
      { param: "46.14", nameEn: "BEP efficiency", nameId: "Efisiensi BEP", min: "65", max: "90", typical: "75", unit: "%" },
      { param: "46.15", nameEn: "Fluid density", nameId: "Densitas fluida", typical: "1000", unit: "kg/m³" },
      { param: "46.31", nameEn: "Flow gain", nameId: "Gain aliran", min: "0.8", max: "1.2", typical: "1.0", unit: "" },
      { param: "46.41", nameEn: "Low flow alarm", nameId: "Alarm aliran rendah", typical: "15–20% rated", unit: "m³/h" },
      { param: "46.43", nameEn: "High flow alarm", nameId: "Alarm aliran tinggi", typical: "110% rated", unit: "m³/h" },
    ],
    manualRef: "ACQ580 User Manual 3AUA0000085967 — Chapter: Pump Characteristics & Energy Optimization",
    estimatedMinutes: 50,
  },

  // ── ACQ580 Anti-Cavitation Tuning ─────────────────────────────────────────
  {
    id: "acq580-anti-cavitation",
    drive: "ACQ580",
    difficulty: 2,
    titleEn: "Anti-Cavitation Tuning",
    titleId: "Tuning Anti-Kavitasi",
    objectiveEn:
      "Protect the pump from cavitation damage using a multi-layer strategy: minimum speed limit to prevent low-flow cavitation, suction pressure supervision via AI1, PID output floor, and automatic speed reduction or trip when cavitation is detected — without requiring a dedicated cavitation sensor.",
    objectiveId:
      "Melindungi pompa dari kerusakan kavitasi menggunakan strategi multi-lapis: batas kecepatan minimum untuk mencegah kavitasi aliran rendah, supervisi tekanan suction via AI1, lantai output PID, dan pengurangan kecepatan otomatis atau trip saat kavitasi terdeteksi — tanpa memerlukan sensor kavitasi khusus.",
    prerequisitesEn: [
      "Pump NPSHr (Net Positive Suction Head required) known from datasheet for the operating flow range",
      "Suction pressure transmitter (0–10 bar, 4–20 mA) wired to AI2 (separate from discharge AI1)",
      "Pump Q-H curve entered (acq580-pump-curve challenge completed, or 46.x parameters set)",
      "Sensorless flow calculation active — parameter 01.72 available as estimated flow",
      "System filled and vented — no air in suction line before test",
    ],
    prerequisitesId: [
      "NPSHr pompa (Net Positive Suction Head yang diperlukan) diketahui dari datasheet untuk rentang aliran operasi",
      "Transmitter tekanan suction (0–10 bar, 4–20 mA) terkabel ke AI2 (terpisah dari discharge AI1)",
      "Kurva Q-H pompa sudah diinput (tantangan acq580-pump-curve selesai, atau parameter 46.x sudah diset)",
      "Kalkulasi aliran sensorless aktif — parameter 01.72 tersedia sebagai estimasi aliran",
      "Sistem terisi dan terventilasi — tidak ada udara di jalur suction sebelum pengujian",
    ],
    steps: [
      {
        titleEn: "Understand cavitation thresholds from datasheet",
        titleId: "Pahami ambang batas kavitasi dari datasheet",
        descEn:
          "Cavitation occurs when local pressure at the pump impeller eye drops below the vapour pressure of the fluid. From the pump datasheet, read NPSHr at each flow point — NPSHr increases steeply at low and high flow extremes. Also identify the minimum recommended flow (Qmin) below which the pump manufacturer prohibits continuous operation. These two values drive all parameter settings in this challenge.",
        descId:
          "Kavitasi terjadi ketika tekanan lokal di mata impeller pompa turun di bawah tekanan uap fluida. Dari datasheet pompa, baca NPSHr di setiap titik aliran — NPSHr meningkat tajam pada aliran rendah dan tinggi. Identifikasi juga aliran minimum yang direkomendasikan (Qmin) di mana pabrikan pompa melarang operasi kontinu. Dua nilai ini mendorong semua pengaturan parameter dalam tantangan ini.",
      },
      {
        titleEn: "Set minimum frequency to enforce Qmin",
        titleId: "Set frekuensi minimum untuk menegakkan Qmin",
        descEn:
          "Using the pump affinity law, calculate the speed (frequency) that corresponds to Qmin. Since Q ∝ n, the minimum frequency f_min = 50 × (Qmin / Qrated). Add a 5–10% safety margin above this calculated value. This is the first layer of anti-cavitation protection: the drive never slows below this speed, ensuring minimum flow is always maintained.",
        descId:
          "Menggunakan hukum afinitas pompa, hitung kecepatan (frekuensi) yang sesuai dengan Qmin. Karena Q ∝ n, frekuensi minimum f_min = 50 × (Qmin / Qrated). Tambahkan margin keamanan 5–10% di atas nilai yang dihitung. Ini adalah lapisan pertama perlindungan anti-kavitasi: drive tidak pernah melambat di bawah kecepatan ini, memastikan aliran minimum selalu terjaga.",
        params: [
          { code: "30.11", nameEn: "Minimum frequency", nameId: "Frekuensi minimum", setValue: "50 × (Qmin/Qrated) + 10% margin", unit: "Hz", note: "Example: Qmin=20m³/h, Qrated=100m³/h → f_min≈50×0.2×1.1=11 Hz" },
          { code: "40.02", nameEn: "PID output minimum", nameId: "Output minimum PID", setValue: "= 30.11 value", unit: "Hz", note: "Prevents PID from commanding speed below cavitation floor" },
        ],
      },
      {
        titleEn: "Configure AI2 supervision for suction pressure",
        titleId: "Konfigurasi supervisi AI2 untuk tekanan suction",
        descEn:
          "Scale AI2 to match the suction pressure transmitter range. Set AI2 supervision to alarm when suction pressure (converted from NPSHa = gauge_pressure_abs − vapour_pressure) drops below NPSHr + 0.5 m safety margin. This is the second protection layer: detecting the symptom before damage occurs.",
        descId:
          "Skalakan AI2 untuk menyesuaikan rentang transmitter tekanan suction. Set supervisi AI2 untuk alarm ketika tekanan suction (dikonversi dari NPSHa = tekanan_gauge_abs − tekanan_uap) turun di bawah NPSHr + margin keamanan 0,5 m. Ini adalah lapisan perlindungan kedua: mendeteksi gejala sebelum kerusakan terjadi.",
        params: [
          { code: "12.25", nameEn: "AI2 unit selection", nameId: "Pilihan unit AI2", setValue: "2 (mA)", note: "4–20 mA for suction pressure transmitter" },
          { code: "12.27", nameEn: "AI2 min value", nameId: "Nilai min AI2", setValue: "4.0", unit: "mA", note: "4 mA = 0 bar gauge" },
          { code: "12.28", nameEn: "AI2 max value", nameId: "Nilai maks AI2", setValue: "20.0", unit: "mA", note: "20 mA = transmitter full scale (e.g. 10 bar)" },
          { code: "12.31", nameEn: "AI2 supervision mode", nameId: "Mode supervisi AI2", setValue: "3 (Below min → Warning)", note: "3 = generates Warning A-xxxx when signal drops below supervision level" },
          { code: "12.32", nameEn: "AI2 supervision level", nameId: "Level supervisi AI2", setValue: "NPSHr + 0.5 m margin (in % of range)", unit: "%", note: "Convert NPSHr pressure to % of AI2 range; add 5% safety margin" },
        ],
      },
      {
        titleEn: "Enable automatic speed reduction on suction pressure drop",
        titleId: "Aktifkan pengurangan kecepatan otomatis saat tekanan suction turun",
        descEn:
          "Configure the drive to automatically reduce speed when the suction pressure alarm fires, rather than immediately tripping. This allows the pump to recover: lower speed = lower flow = higher NPSHa. Link the AI2 supervision output to a speed override that reduces output to the Qmin frequency. If pressure does not recover within the delay time, escalate to a fault trip.",
        descId:
          "Konfigurasi drive untuk secara otomatis mengurangi kecepatan saat alarm tekanan suction aktif, bukan langsung trip. Ini memungkinkan pompa pulih: kecepatan lebih rendah = aliran lebih rendah = NPSHa lebih tinggi. Hubungkan output supervisi AI2 ke override kecepatan yang mengurangi output ke frekuensi Qmin. Jika tekanan tidak pulih dalam waktu delay, eskalasi ke fault trip.",
        params: [
          { code: "20.51", nameEn: "Run permissive 1 source", nameId: "Sumber izin jalan 1", setValue: "AI2 supervision OK (inverted if needed)", note: "Stops drive if suction pressure critically low — last-resort protection" },
          { code: "21.06", nameEn: "Auto-restart number of trials", nameId: "Jumlah percobaan auto-restart", setValue: "3", note: "After cavitation trip: try restart 3× before permanent fault" },
          { code: "21.07", nameEn: "Auto-restart time between trials", nameId: "Waktu antar percobaan auto-restart", setValue: "30", unit: "s", note: "30 s wait allows suction condition to recover between attempts" },
        ],
      },
      {
        titleEn: "Configure dry-run / low-flow detection via estimated flow",
        titleId: "Konfigurasi deteksi kering / aliran rendah via estimasi aliran",
        descEn:
          "Use the sensorless estimated flow (01.72) as a cavitation indicator. If the pump is running at full speed but flow estimate is near zero, this strongly indicates: closed valve, dry run, or severe cavitation. Set parameter 46.41 low-flow alarm to trigger at ≤15% of rated flow when frequency is above 80% of rated — this pattern is physically impossible unless flow is blocked or lost.",
        descId:
          "Gunakan estimasi aliran sensorless (01.72) sebagai indikator kavitasi. Jika pompa berjalan pada kecepatan penuh tetapi estimasi aliran mendekati nol, ini sangat mengindikasikan: katup tertutup, dry run, atau kavitasi parah. Set alarm aliran rendah parameter 46.41 untuk memicu pada ≤15% aliran rated ketika frekuensi di atas 80% rated — pola ini secara fisik tidak mungkin kecuali aliran tersumbat atau hilang.",
        params: [
          { code: "46.41", nameEn: "Low flow alarm level", nameId: "Level alarm aliran rendah", setValue: "15% of rated flow", unit: "m³/h", note: "Cavitation / dry-run / closed valve indicator when combined with high speed" },
          { code: "46.42", nameEn: "Low flow alarm delay", nameId: "Delay alarm aliran rendah", setValue: "8", unit: "s", note: "Delay prevents false alarm during start-up ramp" },
        ],
      },
      {
        titleEn: "Tune the anti-cavitation response with a controlled test",
        titleId: "Tuning respon anti-kavitasi dengan pengujian terkontrol",
        descEn:
          "With the pump running at rated speed: slowly close the suction isolation valve while observing parameters 12.26 (AI2 actual — suction pressure), 01.72 (estimated flow), and 01.02 (drive output current). Watch for current drop concurrent with flow estimate drop — this is the onset of cavitation. Verify that the warning alarm fires before critical pressure is reached. Note the actual pressure values at alarm point for final parameter adjustment.",
        descId:
          "Dengan pompa berjalan pada kecepatan rated: perlahan tutup katup isolasi suction sambil mengamati parameter 12.26 (AI2 aktual — tekanan suction), 01.72 (estimasi aliran), dan 01.02 (arus output drive). Perhatikan penurunan arus bersamaan dengan penurunan estimasi aliran — ini adalah awal kavitasi. Verifikasi bahwa alarm peringatan aktif sebelum tekanan kritis tercapai. Catat nilai tekanan aktual pada titik alarm untuk penyesuaian parameter akhir.",
        params: [
          { code: "12.26", nameEn: "AI2 actual value (suction pressure, live)", nameId: "Nilai aktual AI2 (tekanan suction, langsung)", setValue: "Monitor", unit: "% / bar", note: "Watch this drop during suction valve closure test" },
          { code: "01.02", nameEn: "Motor current actual (live)", nameId: "Arus motor aktual (langsung)", setValue: "Monitor", unit: "A", note: "Current drop + flow drop = cavitation onset signature" },
        ],
      },
      {
        titleEn: "Set final alarm thresholds and document",
        titleId: "Set ambang batas alarm akhir dan dokumentasikan",
        descEn:
          "Based on the controlled test results, fine-tune the AI2 supervision level to fire 10–15% above the actual cavitation onset pressure observed. Set the fault trip threshold 5% below the alarm level as a final backstop. Document all final parameter values in the panel commissioning record — these are site-specific and must be updated if the pump or pipework changes.",
        descId:
          "Berdasarkan hasil pengujian terkontrol, sesuaikan level supervisi AI2 agar aktif 10–15% di atas tekanan onset kavitasi aktual yang diamati. Set ambang batas fault trip 5% di bawah level alarm sebagai backstop terakhir. Dokumentasikan semua nilai parameter akhir dalam catatan commissioning panel — ini spesifik lokasi dan harus diperbarui jika pompa atau perpipaan berubah.",
        params: [
          { code: "12.32", nameEn: "AI2 supervision level (final tuned)", nameId: "Level supervisi AI2 (akhir setelah tuning)", setValue: "Onset pressure + 10–15% margin", unit: "%", note: "Fine-tune after live cavitation onset test" },
        ],
      },
    ],
    limitSettings: [
      { param: "30.11", nameEn: "Min frequency (Qmin floor)", nameId: "Frekuensi min (lantai Qmin)", typical: "50 × (Qmin/Qrated) × 1.1", unit: "Hz" },
      { param: "40.02", nameEn: "PID output min", nameId: "Output min PID", typical: "Equal to 30.11", unit: "Hz" },
      { param: "12.32", nameEn: "AI2 supervision level", nameId: "Level supervisi AI2", typical: "NPSHr + 0.5 m (converted to %)", unit: "%" },
      { param: "21.07", nameEn: "Auto-restart wait time", nameId: "Waktu tunggu auto-restart", min: "20", max: "60", typical: "30", unit: "s" },
      { param: "46.41", nameEn: "Low flow alarm level", nameId: "Level alarm aliran rendah", typical: "15% of rated", unit: "m³/h" },
      { param: "46.42", nameEn: "Low flow alarm delay", nameId: "Delay alarm aliran rendah", min: "5", max: "15", typical: "8", unit: "s" },
    ],
    manualRef: "ACQ580 User Manual 3AUA0000085967 — Chapters: AI Supervision, PFC Protection, Pump Characteristics",
    estimatedMinutes: 35,
  },
];

export const challengesByDrive = (drive: "ACQ580" | "ACS880") =>
  vsdChallenges.filter((c) => c.drive === drive);
