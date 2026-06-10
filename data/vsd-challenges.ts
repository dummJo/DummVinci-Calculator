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
  {
    id: "acq580-multipump-basic",
    drive: "ACQ580",
    difficulty: 1,
    titleEn: "ACQ580 Multipump — Basic PID Setup",
    titleId: "ACQ580 Multipump — Pengaturan PID Dasar",
    objectiveEn:
      "Commission a single-pump PID pressure control loop on the ACQ580, set reference source to AI1, and verify the drive follows the 4–20 mA pressure transducer signal.",
    objectiveId:
      "Commissioning loop PID tekanan satu pompa pada ACQ580, set sumber referensi ke AI1, dan verifikasi drive mengikuti sinyal transducer tekanan 4–20 mA.",
    prerequisitesEn: [
      "ACQ580 powered and display showing 'READY'",
      "Pressure transducer wired to AI1 (4–20 mA, 0–10 bar)",
      "Motor wired to U2/V2/W2 with correct phase rotation confirmed",
      "Drive Composer Pro connected via USB or Ethernet",
    ],
    prerequisitesId: [
      "ACQ580 menyala dan display menampilkan 'READY'",
      "Transducer tekanan terkabel ke AI1 (4–20 mA, 0–10 bar)",
      "Motor terkabel ke U2/V2/W2 dengan rotasi fasa yang benar telah dikonfirmasi",
      "Drive Composer Pro terhubung via USB atau Ethernet",
    ],
    steps: [
      {
        titleEn: "Set Application Macro",
        titleId: "Set Makro Aplikasi",
        descEn:
          "Navigate to parameter group 96 and set the application macro to PID control. This resets all PID-relevant parameters to factory defaults for a clean commissioning start.",
        descId:
          "Navigasi ke grup parameter 96 dan set makro aplikasi ke kontrol PID. Ini mereset semua parameter relevan PID ke default pabrik untuk commissioning yang bersih.",
        params: [
          {
            code: "96.04",
            nameEn: "Macro select",
            nameId: "Pilih makro",
            setValue: "3",
            note: "3 = PID Control macro",
          },
        ],
      },
      {
        titleEn: "Configure Analog Input AI1",
        titleId: "Konfigurasi Input Analog AI1",
        descEn:
          "Set AI1 for 4–20 mA current loop input and define the signal scaling to match the pressure transducer range. Signal minimum (4 mA) maps to 0 bar; signal maximum (20 mA) maps to 10 bar.",
        descId:
          "Set AI1 untuk input loop arus 4–20 mA dan definisikan skala sinyal untuk cocok dengan rentang transducer tekanan. Minimum sinyal (4 mA) dipetakan ke 0 bar; maksimum sinyal (20 mA) dipetakan ke 10 bar.",
        params: [
          {
            code: "12.15",
            nameEn: "AI1 unit selection",
            nameId: "Pilihan unit AI1",
            setValue: "2",
            unit: "",
            note: "2 = mA",
          },
          {
            code: "12.17",
            nameEn: "AI1 min",
            nameId: "AI1 min",
            setValue: "4",
            unit: "mA",
          },
          {
            code: "12.18",
            nameEn: "AI1 max",
            nameId: "AI1 max",
            setValue: "20",
            unit: "mA",
          },
          {
            code: "12.19",
            nameEn: "AI1 scaled min",
            nameId: "AI1 skala min",
            setValue: "0.00",
            unit: "%",
            note: "0% = 0 bar",
          },
          {
            code: "12.20",
            nameEn: "AI1 scaled max",
            nameId: "AI1 skala max",
            setValue: "100.00",
            unit: "%",
            note: "100% = 10 bar",
          },
        ],
      },
      {
        titleEn: "Configure PID Setpoint Source",
        titleId: "Konfigurasi Sumber Setpoint PID",
        descEn:
          "Set the PID setpoint source to AI2 (panel potentiometer) for manual commissioning control. In the final installation, this is typically changed to a remote SCADA reference.",
        descId:
          "Set sumber setpoint PID ke AI2 (potensiometer panel) untuk kontrol commissioning manual. Pada instalasi final, ini biasanya diubah ke referensi SCADA jarak jauh.",
        params: [
          {
            code: "40.16",
            nameEn: "PID setpoint 1 source",
            nameId: "Sumber setpoint PID 1",
            setValue: "12.26",
            note: "12.26 = AI2 scaled value",
          },
          {
            code: "40.14",
            nameEn: "PID feedback 1 source",
            nameId: "Sumber feedback PID 1",
            setValue: "12.21",
            note: "12.21 = AI1 scaled value",
          },
        ],
      },
      {
        titleEn: "Set PID Gain Parameters",
        titleId: "Set Parameter Gain PID",
        descEn:
          "Apply initial PID tuning values for a centrifugal pump in a closed pipe system. These are conservative starting values — refine by observing step response in Drive Composer Pro.",
        descId:
          "Terapkan nilai tuning PID awal untuk pompa sentrifugal dalam sistem pipa tertutup. Ini adalah nilai awal yang konservatif — sempurnakan dengan mengamati respons step di Drive Composer Pro.",
        params: [
          {
            code: "40.32",
            nameEn: "PID proportional gain",
            nameId: "Gain proporsional PID",
            setValue: "1.5",
            unit: "",
          },
          {
            code: "40.33",
            nameEn: "PID integration time",
            nameId: "Waktu integrasi PID",
            setValue: "2.0",
            unit: "s",
          },
          {
            code: "40.34",
            nameEn: "PID derivative time",
            nameId: "Waktu derivatif PID",
            setValue: "0.0",
            unit: "s",
            note: "Start with D=0; add only if oscillation persists",
          },
        ],
      },
      {
        titleEn: "Enable PID and Verify",
        titleId: "Aktifkan PID dan Verifikasi",
        descEn:
          "Enable PID operation mode and run the drive at minimum speed to verify feedback signal is live. Confirm AI1 actual value changes when pressure changes. The drive should hold setpoint within ±0.5 bar.",
        descId:
          "Aktifkan mode operasi PID dan jalankan drive pada kecepatan minimum untuk memverifikasi sinyal feedback aktif. Konfirmasikan nilai aktual AI1 berubah saat tekanan berubah. Drive harus mempertahankan setpoint dalam ±0,5 bar.",
        params: [
          {
            code: "40.07",
            nameEn: "PID operation mode",
            nameId: "Mode operasi PID",
            setValue: "1",
            note: "1 = Active (PID enabled)",
          },
        ],
      },
    ],
    limitSettings: [
      {
        param: "30.12",
        nameEn: "Maximum speed",
        nameId: "Kecepatan maksimum",
        min: "0",
        max: "1500",
        typical: "1450",
        unit: "rpm",
      },
      {
        param: "30.13",
        nameEn: "Minimum speed",
        nameId: "Kecepatan minimum",
        min: "0",
        max: "300",
        typical: "150",
        unit: "rpm",
      },
      {
        param: "30.17",
        nameEn: "Maximum current",
        nameId: "Arus maksimum",
        typical: "110",
        unit: "% of In",
        min: "50",
        max: "150",
      },
      {
        param: "23.11",
        nameEn: "Ramp-up time",
        nameId: "Waktu ramp naik",
        min: "5",
        max: "120",
        typical: "20",
        unit: "s",
      },
      {
        param: "23.12",
        nameEn: "Ramp-down time",
        nameId: "Waktu ramp turun",
        min: "5",
        max: "120",
        typical: "20",
        unit: "s",
      },
    ],
    manualRef: "ACQ580 Firmware Manual — Chapter 9: PID Control (3AXD50000016097)",
    estimatedMinutes: 30,
  },
  {
    id: "acq580-multipump-advanced",
    drive: "ACQ580",
    difficulty: 2,
    titleEn: "ACQ580 Multipump — Lead/Lag Pump Sequencing",
    titleId: "ACQ580 Multipump — Sequencing Pompa Lead/Lag",
    objectiveEn:
      "Configure the ACQ580 multipump logic to manage two pumps in lead/lag alternation, with automatic switchover based on pressure demand and run-time equalization.",
    objectiveId:
      "Konfigurasi logika multipump ACQ580 untuk mengelola dua pompa dalam alternasi lead/lag, dengan switchover otomatis berdasarkan permintaan tekanan dan equalisasi jam operasi.",
    prerequisitesEn: [
      "Single-pump PID loop commissioned (see Challenge 1)",
      "Second pump motor wired to relay output DO1 (DOL starter for lag pump)",
      "Digital input DI4 wired for lag pump run feedback",
      "Both pump suction and discharge valves confirmed open",
    ],
    prerequisitesId: [
      "Loop PID satu pompa telah di-commission (lihat Tantangan 1)",
      "Motor pompa kedua terkabel ke relay output DO1 (starter DOL untuk pompa lag)",
      "Input digital DI4 terkabel untuk feedback operasi pompa lag",
      "Valve suction dan discharge kedua pompa telah dikonfirmasi terbuka",
    ],
    steps: [
      {
        titleEn: "Enable Multipump Mode",
        titleId: "Aktifkan Mode Multipump",
        descEn:
          "Set the multipump mode to activate the built-in sequencing logic. The ACQ580 will act as the drive for the lead pump and use its relay outputs to start/stop the auxiliary pumps.",
        descId:
          "Set mode multipump untuk mengaktifkan logika sequencing built-in. ACQ580 akan bertindak sebagai drive untuk pompa lead dan menggunakan relay output-nya untuk start/stop pompa auxiliary.",
        params: [
          {
            code: "76.01",
            nameEn: "Multipump mode",
            nameId: "Mode multipump",
            setValue: "1",
            note: "1 = Autochange enabled",
          },
          {
            code: "76.02",
            nameEn: "Number of pumps",
            nameId: "Jumlah pompa",
            setValue: "2",
          },
        ],
      },
      {
        titleEn: "Set Auxiliary Pump Start/Stop Thresholds",
        titleId: "Set Ambang Start/Stop Pompa Auxiliary",
        descEn:
          "Define the frequency thresholds at which the lead pump requests the lag pump to start (high demand) or stop (low demand). These values must be set relative to the motor nominal frequency.",
        descId:
          "Definisikan ambang frekuensi di mana pompa lead meminta pompa lag untuk start (permintaan tinggi) atau stop (permintaan rendah). Nilai-nilai ini harus diset relatif terhadap frekuensi nominal motor.",
        params: [
          {
            code: "76.11",
            nameEn: "Auxiliary pump start frequency",
            nameId: "Frekuensi start pompa auxiliary",
            setValue: "48.0",
            unit: "Hz",
            note: "Lead pump at ~96% speed → start lag pump",
          },
          {
            code: "76.12",
            nameEn: "Auxiliary pump stop frequency",
            nameId: "Frekuensi stop pompa auxiliary",
            setValue: "30.0",
            unit: "Hz",
            note: "Lead pump drops to ~60% → stop lag pump",
          },
          {
            code: "76.13",
            nameEn: "Auxiliary pump start delay",
            nameId: "Delay start pompa auxiliary",
            setValue: "10",
            unit: "s",
            note: "Prevent hunting on transient demand spikes",
          },
        ],
      },
      {
        titleEn: "Configure Autochange (Run-Time Equalization)",
        titleId: "Konfigurasi Autochange (Equalisasi Jam Operasi)",
        descEn:
          "Enable the autochange function so the drive rotates which physical pump is the 'lead' at regular intervals. This equalizes wear across both pumps.",
        descId:
          "Aktifkan fungsi autochange agar drive merotasi pompa fisik mana yang menjadi 'lead' pada interval reguler. Ini menyamakan keausan di kedua pompa.",
        params: [
          {
            code: "76.30",
            nameEn: "Autochange mode",
            nameId: "Mode autochange",
            setValue: "1",
            note: "1 = Time-based rotation",
          },
          {
            code: "76.31",
            nameEn: "Autochange interval",
            nameId: "Interval autochange",
            setValue: "168",
            unit: "h",
            note: "Rotate every 7 days (168 hours)",
          },
        ],
      },
      {
        titleEn: "Map Relay Outputs to Pump Control",
        titleId: "Petakan Relay Output ke Kontrol Pompa",
        descEn:
          "Assign relay output DO1 to the auxiliary pump 1 start command. This relay will energize the DOL contactor for the lag pump when the sequencing logic demands it.",
        descId:
          "Tetapkan relay output DO1 ke perintah start pompa auxiliary 1. Relay ini akan mengenergi kontaktor DOL untuk pompa lag saat logika sequencing menuntutnya.",
        params: [
          {
            code: "10.24",
            nameEn: "RO1 source",
            nameId: "Sumber RO1",
            setValue: "76.101",
            note: "76.101 = Aux pump 1 start command",
          },
        ],
      },
      {
        titleEn: "Test Sequence Under Live Conditions",
        titleId: "Uji Sequence dalam Kondisi Live",
        descEn:
          "Gradually open the system discharge valve to increase demand above the start threshold. Observe DO1 energizing and confirm the lag pump starts within the configured delay. Monitor pressure stability during handover.",
        descId:
          "Buka secara bertahap valve discharge sistem untuk meningkatkan permintaan di atas ambang start. Amati DO1 yang mengenergi dan konfirmasikan pompa lag start dalam delay yang dikonfigurasi. Monitor stabilitas tekanan selama handover.",
      },
    ],
    limitSettings: [
      {
        param: "76.11",
        nameEn: "Aux pump start frequency",
        nameId: "Frekuensi start pompa aux",
        min: "40",
        max: "50",
        typical: "48",
        unit: "Hz",
      },
      {
        param: "76.12",
        nameEn: "Aux pump stop frequency",
        nameId: "Frekuensi stop pompa aux",
        min: "20",
        max: "40",
        typical: "30",
        unit: "Hz",
      },
      {
        param: "76.31",
        nameEn: "Autochange interval",
        nameId: "Interval autochange",
        min: "24",
        max: "720",
        typical: "168",
        unit: "h",
      },
      {
        param: "30.12",
        nameEn: "Maximum speed",
        nameId: "Kecepatan maksimum",
        min: "0",
        max: "1500",
        typical: "1450",
        unit: "rpm",
      },
    ],
    manualRef: "ACQ580 Firmware Manual — Chapter 12: Multipump (3AXD50000016097)",
    estimatedMinutes: 45,
  },
  {
    id: "acq580-sleep-boost",
    drive: "ACQ580",
    difficulty: 3,
    titleEn: "ACQ580 — Sleep/Boost & Anti-Cavitation",
    titleId: "ACQ580 — Sleep/Boost & Anti-Kavitasi",
    objectiveEn:
      "Configure the ACQ580 sleep function to stop the pump during low-demand periods, set boost pressure on wake-up, and enable the anti-cavitation protection to prevent dry-run damage.",
    objectiveId:
      "Konfigurasi fungsi sleep ACQ580 untuk menghentikan pompa selama periode permintaan rendah, set tekanan boost saat bangun, dan aktifkan proteksi anti-kavitasi untuk mencegah kerusakan dry-run.",
    prerequisitesEn: [
      "Multipump PID loop operational (Challenge 1 or 2 completed)",
      "Level sensor wired to AI2 for dry-run detection",
      "System pressure setpoint defined and stable under normal load",
    ],
    prerequisitesId: [
      "Loop PID multipump operasional (Tantangan 1 atau 2 selesai)",
      "Sensor level terkabel ke AI2 untuk deteksi dry-run",
      "Setpoint tekanan sistem telah ditentukan dan stabil di bawah beban normal",
    ],
    steps: [
      {
        titleEn: "Configure Sleep Function",
        titleId: "Konfigurasi Fungsi Sleep",
        descEn:
          "Enable the sleep function so the drive stops when the PID output (frequency demand) drops below the sleep threshold for the configured duration. This saves energy during overnight low-demand periods.",
        descId:
          "Aktifkan fungsi sleep agar drive berhenti saat output PID (permintaan frekuensi) turun di bawah ambang sleep selama durasi yang dikonfigurasi. Ini menghemat energi selama periode permintaan rendah semalam.",
        params: [
          {
            code: "40.43",
            nameEn: "Sleep level",
            nameId: "Level sleep",
            setValue: "15.0",
            unit: "Hz",
            note: "Stop pump when demand < 15 Hz for sleep delay",
          },
          {
            code: "40.44",
            nameEn: "Sleep delay",
            nameId: "Delay sleep",
            setValue: "30",
            unit: "s",
          },
        ],
      },
      {
        titleEn: "Set Boost Pressure on Wake",
        titleId: "Set Tekanan Boost saat Bangun",
        descEn:
          "Configure the boost setpoint that overrides the normal PID setpoint briefly when the drive wakes from sleep. This pre-pressurizes the system before handing control back to PID, preventing a dip in supply pressure.",
        descId:
          "Konfigurasi setpoint boost yang menggantikan setpoint PID normal secara singkat saat drive bangun dari sleep. Ini melakukan pre-pressurize sistem sebelum menyerahkan kontrol kembali ke PID, mencegah penurunan tekanan suplai.",
        params: [
          {
            code: "40.47",
            nameEn: "Boost setpoint",
            nameId: "Setpoint boost",
            setValue: "110",
            unit: "%",
            note: "110% of normal PID setpoint on wake-up",
          },
          {
            code: "40.48",
            nameEn: "Boost time",
            nameId: "Waktu boost",
            setValue: "5",
            unit: "s",
          },
        ],
      },
      {
        titleEn: "Enable Anti-Cavitation Protection",
        titleId: "Aktifkan Proteksi Anti-Kavitasi",
        descEn:
          "Set AI2 as the dry-run supervision input. If the level sensor signal drops below the minimum threshold, the drive trips on fault F7030 (Dry Run) before cavitation damage occurs. Set the level threshold to 20% of tank depth.",
        descId:
          "Set AI2 sebagai input supervisi dry-run. Jika sinyal sensor level turun di bawah ambang minimum, drive trip pada fault F7030 (Dry Run) sebelum kerusakan kavitasi terjadi. Set ambang level ke 20% kedalaman tangki.",
        params: [
          {
            code: "44.11",
            nameEn: "Dry run supervision source",
            nameId: "Sumber supervisi dry run",
            setValue: "12.26",
            note: "12.26 = AI2 scaled value",
          },
          {
            code: "44.12",
            nameEn: "Dry run level",
            nameId: "Level dry run",
            setValue: "20.0",
            unit: "%",
            note: "Trip when tank level < 20%",
          },
          {
            code: "44.13",
            nameEn: "Dry run delay",
            nameId: "Delay dry run",
            setValue: "5",
            unit: "s",
            note: "Allow for sensor transients before tripping",
          },
        ],
      },
    ],
    limitSettings: [
      {
        param: "40.43",
        nameEn: "Sleep level",
        nameId: "Level sleep",
        min: "5",
        max: "30",
        typical: "15",
        unit: "Hz",
      },
      {
        param: "40.44",
        nameEn: "Sleep delay",
        nameId: "Delay sleep",
        min: "10",
        max: "120",
        typical: "30",
        unit: "s",
      },
      {
        param: "40.47",
        nameEn: "Boost setpoint",
        nameId: "Setpoint boost",
        min: "100",
        max: "150",
        typical: "110",
        unit: "%",
      },
      {
        param: "44.12",
        nameEn: "Dry run level",
        nameId: "Level dry run",
        min: "10",
        max: "40",
        typical: "20",
        unit: "%",
      },
    ],
    manualRef:
      "ACQ580 Firmware Manual — Chapter 9: Sleep & Boost (3AXD50000016097)",
    estimatedMinutes: 40,
  },
  {
    id: "acs880-dtc-crane-basic",
    drive: "ACS880",
    difficulty: 1,
    titleEn: "ACS880 — DTC Motor ID Run (Crane Hoist)",
    titleId: "ACS880 — ID Run Motor DTC (Crane Hoist)",
    objectiveEn:
      "Perform the ACS880 motor identification run (ID Run) for a crane hoist motor to calibrate the DTC (Direct Torque Control) model, and verify the motor model parameters are correctly identified.",
    objectiveId:
      "Lakukan motor identification run (ID Run) ACS880 untuk motor crane hoist guna kalibrasi model DTC (Direct Torque Control), dan verifikasi parameter model motor teridentifikasi dengan benar.",
    prerequisitesEn: [
      "Motor nameplate data available: kW, V, A, Hz, rpm, cos φ",
      "Motor mechanically coupled to empty crane (no load on hook)",
      "Braking resistor wired and verified per Braking Resistor Calculator",
      "Emergency stop circuit hardwired and tested",
    ],
    prerequisitesId: [
      "Data nameplate motor tersedia: kW, V, A, Hz, rpm, cos φ",
      "Motor terkopel secara mekanis ke crane kosong (tidak ada beban di hook)",
      "Braking resistor terkabel dan diverifikasi sesuai Kalkulator Braking Resistor",
      "Sirkuit emergency stop terkabel keras dan diuji",
    ],
    steps: [
      {
        titleEn: "Enter Motor Nameplate Data",
        titleId: "Masukkan Data Nameplate Motor",
        descEn:
          "Enter all motor nameplate parameters accurately. These values seed the DTC motor model — errors here will result in poor torque accuracy and potential overcurrent trips during hoist operation.",
        descId:
          "Masukkan semua parameter nameplate motor dengan akurat. Nilai-nilai ini menjadi seed model motor DTC — kesalahan di sini akan menghasilkan akurasi torsi yang buruk dan potensi trip overcurrent selama operasi hoist.",
        params: [
          {
            code: "99.06",
            nameEn: "Motor nominal current",
            nameId: "Arus nominal motor",
            setValue: "[nameplate In]",
            unit: "A",
          },
          {
            code: "99.07",
            nameEn: "Motor nominal voltage",
            nameId: "Tegangan nominal motor",
            setValue: "[nameplate Un]",
            unit: "V",
          },
          {
            code: "99.08",
            nameEn: "Motor nominal frequency",
            nameId: "Frekuensi nominal motor",
            setValue: "[nameplate Hz]",
            unit: "Hz",
          },
          {
            code: "99.09",
            nameEn: "Motor nominal speed",
            nameId: "Kecepatan nominal motor",
            setValue: "[nameplate rpm]",
            unit: "rpm",
          },
          {
            code: "99.10",
            nameEn: "Motor nominal power",
            nameId: "Daya nominal motor",
            setValue: "[nameplate kW]",
            unit: "kW",
          },
        ],
      },
      {
        titleEn: "Select DTC Control Mode",
        titleId: "Pilih Mode Kontrol DTC",
        descEn:
          "Set the motor control mode to DTC for crane/hoist applications. DTC provides torque response in microseconds, which is mandatory for safe load handling at zero speed.",
        descId:
          "Set mode kontrol motor ke DTC untuk aplikasi crane/hoist. DTC memberikan respons torsi dalam mikrodetik, yang wajib untuk penanganan beban yang aman pada kecepatan nol.",
        params: [
          {
            code: "99.04",
            nameEn: "Motor control mode",
            nameId: "Mode kontrol motor",
            setValue: "1",
            note: "1 = DTC (Direct Torque Control)",
          },
        ],
      },
      {
        titleEn: "Run Motor Identification",
        titleId: "Jalankan Identifikasi Motor",
        descEn:
          "Initiate the ID Run. The drive will run the motor through a series of test sequences at reduced speed to measure stator resistance, rotor time constant, and leakage inductance. The motor will rotate — ensure the hoist is unloaded and the hook path is clear.",
        descId:
          "Inisiasi ID Run. Drive akan menjalankan motor melalui serangkaian urutan uji pada kecepatan rendah untuk mengukur resistansi stator, konstanta waktu rotor, dan induktansi bocor. Motor akan berputar — pastikan hoist tidak bermuatan dan jalur hook bebas.",
        params: [
          {
            code: "99.13",
            nameEn: "ID Run request",
            nameId: "Permintaan ID Run",
            setValue: "2",
            note: "2 = Normal ID Run (motor rotates)",
          },
        ],
      },
      {
        titleEn: "Verify Identified Motor Parameters",
        titleId: "Verifikasi Parameter Motor yang Teridentifikasi",
        descEn:
          "After ID Run completes, inspect the identified motor parameters in group 99. The stator resistance (99.21) should be within 5–15% of the expected value based on motor rating. If values are extreme, re-check motor wiring and repeat.",
        descId:
          "Setelah ID Run selesai, periksa parameter motor yang teridentifikasi di grup 99. Resistansi stator (99.21) harus dalam 5–15% dari nilai yang diharapkan berdasarkan rating motor. Jika nilai ekstrem, periksa kembali kabel motor dan ulangi.",
        params: [
          {
            code: "99.21",
            nameEn: "Motor stator resistance",
            nameId: "Resistansi stator motor",
            setValue: "[check result]",
            unit: "Ω",
            note: "Verify post-ID Run; should be consistent with motor kW rating",
          },
        ],
      },
    ],
    limitSettings: [
      {
        param: "99.06",
        nameEn: "Motor nominal current",
        nameId: "Arus nominal motor",
        typical: "Per nameplate",
        unit: "A",
      },
      {
        param: "30.17",
        nameEn: "Max current limit",
        nameId: "Batas arus maks",
        min: "100",
        max: "160",
        typical: "150",
        unit: "% In",
      },
      {
        param: "01.03",
        nameEn: "Motor torque",
        nameId: "Torsi motor",
        typical: "0 at standstill pre-test",
        unit: "Nm",
      },
    ],
    manualRef:
      "ACS880 Firmware Manual — Chapter 6: Motor Control (3AUA0000085967)",
    estimatedMinutes: 25,
  },
  {
    id: "acs880-hoist-safety",
    drive: "ACS880",
    difficulty: 2,
    titleEn: "ACS880 — Mechanical Brake Control (Hoist)",
    titleId: "ACS880 — Kontrol Rem Mekanis (Hoist)",
    objectiveEn:
      "Configure the ACS880 mechanical brake control function to ensure the hoist brake opens only when the drive has established sufficient holding torque, and closes before motor de-energization.",
    objectiveId:
      "Konfigurasi fungsi kontrol rem mekanis ACS880 untuk memastikan rem hoist hanya terbuka ketika drive telah membangun torsi penahan yang cukup, dan menutup sebelum de-energisasi motor.",
    prerequisitesEn: [
      "DTC ID Run completed (Challenge 4)",
      "Mechanical brake (Precima or equivalent) wired to DO2 relay",
      "Brake acknowledge wired to DI5",
      "Encoder feedback verified if applicable",
    ],
    prerequisitesId: [
      "ID Run DTC selesai (Tantangan 4)",
      "Rem mekanis (Precima atau setara) terkabel ke relay DO2",
      "Acknowledge rem terkabel ke DI5",
      "Feedback encoder diverifikasi jika berlaku",
    ],
    steps: [
      {
        titleEn: "Enable Mechanical Brake Control",
        titleId: "Aktifkan Kontrol Rem Mekanis",
        descEn:
          "Enable the built-in mechanical brake control function. When active, the drive manages the brake open/close sequence automatically based on torque and speed thresholds.",
        descId:
          "Aktifkan fungsi kontrol rem mekanis built-in. Saat aktif, drive mengelola urutan buka/tutup rem secara otomatis berdasarkan ambang torsi dan kecepatan.",
        params: [
          {
            code: "44.06",
            nameEn: "Mechanical brake control",
            nameId: "Kontrol rem mekanis",
            setValue: "1",
            note: "1 = Enabled",
          },
        ],
      },
      {
        titleEn: "Set Brake Open Torque Threshold",
        titleId: "Set Ambang Torsi Buka Rem",
        descEn:
          "Define the minimum torque the drive must develop before opening the brake. For hoist applications, this must exceed the gravitational torque of the expected maximum load to prevent the load from dropping when the brake opens.",
        descId:
          "Definisikan torsi minimum yang harus dikembangkan drive sebelum membuka rem. Untuk aplikasi hoist, ini harus melebihi torsi gravitasi beban maksimum yang diharapkan untuk mencegah beban jatuh saat rem terbuka.",
        params: [
          {
            code: "44.08",
            nameEn: "Brake open torque",
            nameId: "Torsi buka rem",
            setValue: "30",
            unit: "% Tn",
            note: "Minimum 30% of nominal torque before brake opens",
          },
          {
            code: "44.09",
            nameEn: "Brake open delay",
            nameId: "Delay buka rem",
            setValue: "0.3",
            unit: "s",
            note: "Allow torque to build before mechanical release",
          },
        ],
      },
      {
        titleEn: "Set Brake Close Speed Threshold",
        titleId: "Set Ambang Kecepatan Tutup Rem",
        descEn:
          "Define the speed at which the brake closes during stopping. The drive must hold the load magnetically until the brake has physically clamped. This prevents load slip between the time the brake command is issued and the mechanical brake fully engages.",
        descId:
          "Definisikan kecepatan di mana rem menutup selama penghentian. Drive harus menahan beban secara magnetis sampai rem secara fisik menjepit. Ini mencegah slip beban antara waktu perintah rem dikeluarkan dan rem mekanis sepenuhnya terlibat.",
        params: [
          {
            code: "44.10",
            nameEn: "Brake close speed",
            nameId: "Kecepatan tutup rem",
            setValue: "5",
            unit: "rpm",
          },
          {
            code: "44.11",
            nameEn: "Brake close delay",
            nameId: "Delay tutup rem",
            setValue: "0.5",
            unit: "s",
            note: "Hold magnetized until brake confirms closed via DI5",
          },
        ],
      },
      {
        titleEn: "Map Brake Relay Output",
        titleId: "Petakan Relay Output Rem",
        descEn:
          "Assign relay DO2 to the brake open/close command generated by the mechanical brake control function.",
        descId:
          "Tetapkan relay DO2 ke perintah buka/tutup rem yang dihasilkan oleh fungsi kontrol rem mekanis.",
        params: [
          {
            code: "10.27",
            nameEn: "RO2 source",
            nameId: "Sumber RO2",
            setValue: "44.01",
            note: "44.01 = Mechanical brake command",
          },
        ],
      },
      {
        titleEn: "Load Test Verification",
        titleId: "Verifikasi Uji Beban",
        descEn:
          "Perform a loaded hoist test at 10% SWL. Command a hoist-up, observe the brake open sequence in the drive event log, then command stop and confirm no load drop. Increase to 50% and 100% SWL progressively.",
        descId:
          "Lakukan uji hoist bermuatan pada 10% SWL. Perintahkan hoist-up, amati urutan buka rem di event log drive, kemudian perintahkan stop dan konfirmasikan tidak ada penurunan beban. Tingkatkan ke 50% dan 100% SWL secara bertahap.",
      },
    ],
    limitSettings: [
      {
        param: "44.08",
        nameEn: "Brake open torque",
        nameId: "Torsi buka rem",
        min: "20",
        max: "80",
        typical: "30",
        unit: "% Tn",
      },
      {
        param: "44.09",
        nameEn: "Brake open delay",
        nameId: "Delay buka rem",
        min: "0.1",
        max: "1.0",
        typical: "0.3",
        unit: "s",
      },
      {
        param: "44.10",
        nameEn: "Brake close speed",
        nameId: "Kecepatan tutup rem",
        min: "2",
        max: "20",
        typical: "5",
        unit: "rpm",
      },
      {
        param: "44.11",
        nameEn: "Brake close delay",
        nameId: "Delay tutup rem",
        min: "0.2",
        max: "2.0",
        typical: "0.5",
        unit: "s",
      },
    ],
    manualRef:
      "ACS880 Firmware Manual — Chapter 16: Mechanical Brake Control (3AUA0000085967)",
    estimatedMinutes: 35,
  },
  {
    id: "acs880-fieldbus-profinet",
    drive: "ACS880",
    difficulty: 3,
    titleEn: "ACS880 — PROFINET I/O Control from Siemens PLC",
    titleId: "ACS880 — Kontrol PROFINET I/O dari PLC Siemens",
    objectiveEn:
      "Configure the ACS880 FPBA-01 PROFINET adapter to accept speed reference and control word from a Siemens S7-1200/S7-1500, map the process data objects, and verify PLC handshake via Drive Composer Pro diagnostics.",
    objectiveId:
      "Konfigurasi adapter PROFINET FPBA-01 ACS880 untuk menerima referensi kecepatan dan control word dari Siemens S7-1200/S7-1500, petakan process data object, dan verifikasi handshake PLC melalui diagnostik Drive Composer Pro.",
    prerequisitesEn: [
      "FPBA-01 PROFINET adapter installed in drive option slot",
      "Siemens TIA Portal project with drive GSD file imported",
      "Ethernet cable from drive to PLC PROFINET port",
      "Drive IP address assigned and PLC subnet matches",
    ],
    prerequisitesId: [
      "Adapter PROFINET FPBA-01 terpasang di slot opsi drive",
      "Proyek TIA Portal Siemens dengan file GSD drive yang diimport",
      "Kabel Ethernet dari drive ke port PROFINET PLC",
      "Alamat IP drive ditetapkan dan subnet PLC cocok",
    ],
    steps: [
      {
        titleEn: "Configure PROFINET Adapter IP Address",
        titleId: "Konfigurasi Alamat IP Adapter PROFINET",
        descEn:
          "Set the FPBA-01 IP address, subnet mask, and gateway via the drive parameter group 51. The IP must be in the same subnet as the PLC PROFINET interface.",
        descId:
          "Set alamat IP FPBA-01, subnet mask, dan gateway melalui grup parameter drive 51. IP harus berada di subnet yang sama dengan interface PROFINET PLC.",
        params: [
          {
            code: "51.02",
            nameEn: "FBA IP address 1",
            nameId: "Alamat IP FBA 1",
            setValue: "[drive IP octet 1]",
          },
          {
            code: "51.03",
            nameEn: "FBA IP address 2",
            nameId: "Alamat IP FBA 2",
            setValue: "[drive IP octet 2]",
          },
          {
            code: "51.04",
            nameEn: "FBA IP address 3",
            nameId: "Alamat IP FBA 3",
            setValue: "[drive IP octet 3]",
          },
          {
            code: "51.05",
            nameEn: "FBA IP address 4",
            nameId: "Alamat IP FBA 4",
            setValue: "[drive IP octet 4]",
          },
        ],
      },
      {
        titleEn: "Set Fieldbus Control Word Source",
        titleId: "Set Sumber Control Word Fieldbus",
        descEn:
          "Switch the drive's control word and speed reference sources to the fieldbus adapter. This makes the PLC the master for start/stop and speed commands.",
        descId:
          "Alihkan sumber control word dan referensi kecepatan drive ke adapter fieldbus. Ini menjadikan PLC sebagai master untuk perintah start/stop dan kecepatan.",
        params: [
          {
            code: "20.01",
            nameEn: "Ext1 commands",
            nameId: "Perintah Ext1",
            setValue: "10",
            note: "10 = Fieldbus adapter A",
          },
          {
            code: "22.11",
            nameEn: "Speed ref1 source",
            nameId: "Sumber referensi kecepatan 1",
            setValue: "3.01",
            note: "3.01 = FBA A data word 1 (speed ref from PLC)",
          },
        ],
      },
      {
        titleEn: "Map Process Data Objects (PDO)",
        titleId: "Petakan Process Data Object (PDO)",
        descEn:
          "Configure what data the drive sends to the PLC (status word, actual speed, actual current) and what the PLC sends to the drive (control word, speed reference). These mappings must match the TIA Portal I/O configuration.",
        descId:
          "Konfigurasi data apa yang dikirim drive ke PLC (status word, kecepatan aktual, arus aktual) dan apa yang dikirim PLC ke drive (control word, referensi kecepatan). Pemetaan ini harus cocok dengan konfigurasi I/O TIA Portal.",
        params: [
          {
            code: "50.01",
            nameEn: "FBA A type",
            nameId: "Tipe FBA A",
            setValue: "FPBA-01",
            note: "Confirm adapter type detected correctly",
          },
          {
            code: "50.07",
            nameEn: "FBA A comm loss timeout",
            nameId: "Timeout kehilangan komunikasi FBA A",
            setValue: "3.0",
            unit: "s",
            note: "Trip fault if PLC communication lost > 3s",
          },
          {
            code: "50.08",
            nameEn: "FBA A comm loss function",
            nameId: "Fungsi kehilangan komunikasi FBA A",
            setValue: "1",
            note: "1 = Fault (trip and stop on comms loss)",
          },
        ],
      },
      {
        titleEn: "Refresh Fieldbus Configuration",
        titleId: "Refresh Konfigurasi Fieldbus",
        descEn:
          "After all parameter changes to the FBA group, refresh the fieldbus configuration to apply the new mappings. This is required after every FBA parameter change.",
        descId:
          "Setelah semua perubahan parameter ke grup FBA, refresh konfigurasi fieldbus untuk menerapkan pemetaan baru. Ini diperlukan setelah setiap perubahan parameter FBA.",
        params: [
          {
            code: "51.27",
            nameEn: "FBA par refresh",
            nameId: "Refresh parameter FBA",
            setValue: "1",
            note: "Set to 1 to refresh; auto-resets to 0",
          },
        ],
      },
      {
        titleEn: "Verify PLC Handshake and Control",
        titleId: "Verifikasi Handshake PLC dan Kontrol",
        descEn:
          "In TIA Portal, go Online and navigate to the drive device in the network view. Confirm the PROFINET connection status is green. From the PLC, send control word 0x047E (Ready to switch on) followed by 0x047F (Run). Confirm drive runs and actual speed feedback reaches the PLC.",
        descId:
          "Di TIA Portal, pergi Online dan navigasi ke perangkat drive di tampilan jaringan. Konfirmasikan status koneksi PROFINET berwarna hijau. Dari PLC, kirim control word 0x047E (Siap untuk switch on) diikuti oleh 0x047F (Run). Konfirmasikan drive berjalan dan feedback kecepatan aktual mencapai PLC.",
      },
    ],
    limitSettings: [
      {
        param: "50.07",
        nameEn: "Comm loss timeout",
        nameId: "Timeout kehilangan komunikasi",
        min: "0.5",
        max: "30",
        typical: "3.0",
        unit: "s",
      },
      {
        param: "20.01",
        nameEn: "Ext1 command source",
        nameId: "Sumber perintah Ext1",
        typical: "10 (Fieldbus)",
        unit: "",
      },
    ],
    manualRef:
      "ACS880 FPBA-01 PROFINET Adapter Manual (3AXD50000158638) + ACS880 Fieldbus Control (3AUA0000085967 Ch.21)",
    estimatedMinutes: 60,
  },
];

export function challengesByDrive(drive: "ACQ580" | "ACS880"): VsdChallenge[] {
  return vsdChallenges.filter((c) => c.drive === drive);
}
