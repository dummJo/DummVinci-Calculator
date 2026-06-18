// ABB Drive Status Word bit definitions
// Source: ABB Drive Status Word Guide (ACS/ACH/ACQ series)
// Parameters 06.11, 06.16, 06.17, 06.18, 06.19, 06.21

export type Severity = "ok" | "warn" | "fault" | "info" | "reserved";

export interface BitDef {
  bit: number;
  name: string;
  true: string;    // description when bit = 1
  false: string;   // description when bit = 0
  impl: string;    // diagnostic implication
  implId: string;  // Indonesian diagnostic implication
  severity: Severity; // severity when bit = 1
}

export interface StatusWordDef {
  param: string;   // e.g. "06.11"
  label: string;   // e.g. "Main Status Word"
  labelId: string; // Indonesian label
  desc: string;
  descId: string;
  bits: BitDef[];
}

const R: BitDef = {
  bit: -1, name: "Reserved", true: "Reserved", false: "Reserved",
  impl: "Internal firmware reserved — always ignore this bit.",
  implId: "Bit cadangan firmware internal — abaikan.",
  severity: "reserved",
};
const reserved = (bit: number): BitDef => ({ ...R, bit });

export const STATUS_WORDS: StatusWordDef[] = [
  // ─────────────────────────────────────────────────────────────
  // 06.11 — Main Status Word
  // ─────────────────────────────────────────────────────────────
  {
    param: "06.11",
    label: "Main Status Word",
    labelId: "Status Word Utama",
    desc: "Primary read-only register — indicates state machine transitions inside the drive.",
    descId: "Register read-only utama — indikator transisi state machine internal drive.",
    bits: [
      {
        bit: 0, name: "RDY_ON",
        true: "Ready to switch ON",
        false: "Not ready to switch ON",
        impl: "1: Main supply active, rectifier ready. 0: Input power lost.",
        implId: "1: Jaringan daya utama aktif, sirkuit penyearah siap. 0: Kehilangan daya input.",
        severity: "ok",
      },
      {
        bit: 1, name: "RDY_RUN",
        true: "Ready run",
        false: "OFF1 active",
        impl: "1: DC bus charged and ready. 0: OFF1 interlock blocking start.",
        implId: "1: Sirkuit DC bus telah terisi daya dan siap. 0: Sinyal interlock OFF1 memblokir start.",
        severity: "ok",
      },
      {
        bit: 2, name: "RDY_REF",
        true: "Ready ref",
        false: "Operation inhibited",
        impl: "1: Inverter ready to follow speed reference. 0: Inverter modulation blocked.",
        implId: "1: Inverter siap mengikuti referensi kecepatan. 0: Modulasi inverter diblokir.",
        severity: "ok",
      },
      {
        bit: 3, name: "TRIPPED",
        true: "Tripped",
        false: "No fault",
        impl: "1: Drive has experienced a system fault (fault trip). 0: Normal operation.",
        implId: "1: Drive mengalami kegagalan sistem (fault trip). 0: Kondisi operasi normal.",
        severity: "fault",
      },
      {
        bit: 4, name: "OFF_2_STATUS",
        true: "Off 2 inactive",
        false: "Off 2 active",
        impl: "1: OFF2 stop circuit safe. 0: Emergency OFF active — motor coasting.",
        implId: "1: Sirkuit penghenti OFF2 aman. 0: Emergency OFF aktif, motor meluncur bebas (coast).",
        severity: "ok",
      },
      {
        bit: 5, name: "OFF_3_STATUS",
        true: "Off 3 inactive",
        false: "Off 3 active",
        impl: "1: OFF3 stop circuit safe. 0: Emergency Stop active — motor fast ramp down.",
        implId: "1: Sirkuit penghenti OFF3 aman. 0: Emergency Stop aktif, motor deselerasi cepat (ramp).",
        severity: "ok",
      },
      {
        bit: 6, name: "SWC_ON_INHIB",
        true: "Switch-on inhibited",
        false: "Inactive",
        impl: "1: Start lock active after fault reset or emergency stop. 0: Normal start permitted.",
        implId: "1: Kunci start aktif pasca fault reset atau stop darurat. 0: Start normal diizinkan.",
        severity: "warn",
      },
      {
        bit: 7, name: "Warning",
        true: "Warning active",
        false: "No warning",
        impl: "1: Minor deviation detected (warning) before trip. 0: No active warning.",
        implId: "1: Deviasi minor terdeteksi (warning) sebelum trip. 0: Tidak ada warning aktif.",
        severity: "warn",
      },
      {
        bit: 8, name: "AT_SETPOINT",
        true: "At setpoint",
        false: "Not at setpoint",
        impl: "1: Motor speed stable at reference value. 0: Motor accelerating/decelerating.",
        implId: "1: Kecepatan aktual motor telah stabil sesuai nilai referensi. 0: Motor melambat/akselerasi.",
        severity: "ok",
      },
      {
        bit: 9, name: "REMOTE",
        true: "Remote control",
        false: "Local control",
        impl: "1: Drive controlled by PLC/fieldbus. 0: Drive controlled locally via keypad.",
        implId: "1: Drive dikendalikan PLC/fieldbus. 0: Drive dikendalikan lokal via keypad.",
        severity: "info",
      },
      {
        bit: 10, name: "ABOVE_LIMIT",
        true: "Above limit",
        false: "Within limit",
        impl: "1: Selected physical parameter exceeded safe threshold. 0: Normal operation within limits.",
        implId: "1: Parameter fisik terpilih melampaui ambang batas aman. 0: Operasi dalam batas normal.",
        severity: "warn",
      },
      {
        bit: 11, name: "USER_BIT_0",
        true: "User bit 0",
        false: "Inactive",
        impl: "Custom external binary status per parameter configuration.",
        implId: "Status biner kustom eksternal sesuai konfigurasi parameter.",
        severity: "info",
      },
      {
        bit: 12, name: "USER_BIT_1",
        true: "User bit 1",
        false: "Inactive",
        impl: "Custom binary status, often mapped to Run Permissive.",
        implId: "Status biner kustom, sering dipetakan ke Run Permissive.",
        severity: "info",
      },
      {
        bit: 13, name: "USER_BIT_2",
        true: "User bit 2",
        false: "Inactive",
        impl: "Custom binary status per parameter configuration.",
        implId: "Status biner kustom sesuai konfigurasi parameter.",
        severity: "info",
      },
      {
        bit: 14, name: "USER_BIT_3",
        true: "User bit 3",
        false: "Inactive",
        impl: "Custom binary status per parameter configuration.",
        implId: "Status biner kustom sesuai konfigurasi parameter.",
        severity: "info",
      },
      reserved(15),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 06.16 — Drive Status Word 1
  // ─────────────────────────────────────────────────────────────
  {
    param: "06.16",
    label: "Drive Status Word 1",
    labelId: "Drive Status Word 1",
    desc: "Shows internal program logic interaction with IGBT switching gates.",
    descId: "Menunjukkan interaksi logika internal program dengan gerbang pensakelaran IGBT.",
    bits: [
      {
        bit: 0, name: "Enabled",
        true: "Enabled",
        false: "Disabled",
        impl: "1: Run Enable AND Start Enable signals both present simultaneously. 0: Power circuit inactive.",
        implId: "1: Sinyal fisik Run Enable dan Start Enable aktif secara bersamaan. 0: Sirkuit daya tidak aktif.",
        severity: "ok",
      },
      {
        bit: 1, name: "Inhibited",
        true: "Inhibited",
        false: "Not inhibited",
        impl: "1: Start blocked by inhibit condition — restart signal cycle required. Check par. 06.18.",
        implId: "1: Start diblokir oleh kondisi inhibit, butuh siklus ulang sinyal start. Periksa par. 06.18.",
        severity: "fault",
      },
      {
        bit: 2, name: "DC charged",
        true: "DC charged",
        false: "Not charged",
        impl: "1: DC bus capacitor charged above undervoltage threshold. 0: Bus not charged.",
        implId: "1: Kapasitor DC bus terisi penuh di atas ambang batas undervoltage. 0: Bus tidak terisi.",
        severity: "ok",
      },
      {
        bit: 3, name: "Ready to start",
        true: "Ready to start",
        false: "Not ready",
        impl: "1: VFD ready to receive start command. 0: Drive not ready.",
        implId: "1: VFD siap menerima perintah start. 0: Drive belum siap.",
        severity: "ok",
      },
      {
        bit: 4, name: "Following reference",
        true: "Following reference",
        false: "Not ready",
        impl: "1: Inverter ready to follow input reference. 0: Not following reference.",
        implId: "1: Inverter siap mengikuti referensi input. 0: Tidak mengikuti referensi.",
        severity: "ok",
      },
      {
        bit: 5, name: "Started",
        true: "Started",
        false: "Not started",
        impl: "1: Drive received start command and modulation started. 0: No start received.",
        implId: "1: Drive telah menerima perintah start dan memulai modulasi. 0: Belum menerima start.",
        severity: "ok",
      },
      {
        bit: 6, name: "Modulating",
        true: "Modulating",
        false: "Not modulating",
        impl: "1: IGBT actively switching, emitting voltage pulses to motor. 0: No modulation.",
        implId: "1: IGBT sedang beroperasi memancarkan pulsa tegangan ke motor. 0: Tidak ada modulasi.",
        severity: "ok",
      },
      {
        bit: 7, name: "Limiting",
        true: "Limiting",
        false: "Not limiting",
        impl: "1: Output limited by current, torque, or voltage limits. 0: No active limiting.",
        implId: "1: Output dibatasi oleh limit arus, torsi, atau tegangan. 0: Tidak ada pembatasan aktif.",
        severity: "warn",
      },
      {
        bit: 8, name: "Local control",
        true: "Local control",
        false: "Remote control",
        impl: "Active control location is local panel/keypad.",
        implId: "Lokasi kontrol aktif berada di panel/keypad lokal.",
        severity: "info",
      },
      {
        bit: 9, name: "Network control",
        true: "Network control",
        false: "Non-network control",
        impl: "Binary control received via active fieldbus network interface.",
        implId: "Kontrol biner diterima melalui antarmuka jaringan fieldbus aktif.",
        severity: "info",
      },
      {
        bit: 10, name: "Ext1 active",
        true: "Ext1 active",
        false: "Ext1 inactive",
        impl: "1: External control location 1 is selected and active.",
        implId: "1: Lokasi kontrol eksternal 1 sedang dipilih dan aktif.",
        severity: "info",
      },
      {
        bit: 11, name: "Ext2 active",
        true: "Ext2 active",
        false: "Ext2 inactive",
        impl: "1: External control location 2 is selected and active.",
        implId: "1: Lokasi kontrol eksternal 2 sedang dipilih dan aktif.",
        severity: "info",
      },
      {
        bit: 12, name: "Charging active",
        true: "Charging active",
        false: "Charging inactive",
        impl: "1: DC capacitor pre-charging circuit is active.",
        implId: "1: Sirkuit pengisian daya kapasitor (pre-charging) sedang aktif.",
        severity: "info",
      },
      {
        bit: 13, name: "MCW control",
        true: "MCW control active",
        false: "MCW inactive",
        impl: "1: Control location driven by Main Control Word via fieldbus.",
        implId: "1: Lokasi kontrol saat ini dikendalikan oleh Main Control Word fieldbus.",
        severity: "info",
      },
      {
        bit: 14, name: "Running",
        true: "Running",
        false: "Not running",
        impl: "1: Motor rotating and producing active torque/speed. 0: Motor stopped.",
        implId: "1: Motor berputar dan menghasilkan torsi/kecepatan aktif. 0: Motor berhenti.",
        severity: "ok",
      },
      reserved(15),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 06.17 — Drive Status Word 2
  // ─────────────────────────────────────────────────────────────
  {
    param: "06.17",
    label: "Drive Status Word 2",
    labelId: "Drive Status Word 2",
    desc: "Reflects dynamic control modes and physical motor status.",
    descId: "Mencerminkan mode kontrol dinamis dan status fisis motor.",
    bits: [
      {
        bit: 0, name: "Identification run",
        true: "ID run active",
        false: "ID run inactive",
        impl: "1: Motor characteristic identification (ID run) is in progress. Do not stop drive.",
        implId: "1: Proses identifikasi karakteristik motor (ID run) sedang berjalan. Jangan hentikan drive.",
        severity: "info",
      },
      {
        bit: 1, name: "Magnetized",
        true: "Magnetized",
        false: "Not magnetized",
        impl: "1: Motor magnetic flux fully established. Ready for torque generation.",
        implId: "1: Fluks magnetik pada motor telah terbentuk sepenuhnya. Siap menghasilkan torsi.",
        severity: "ok",
      },
      {
        bit: 2, name: "Torque control",
        true: "Torque control active",
        false: "Inactive",
        impl: "1: Direct Torque Control (DTC) mode is active.",
        implId: "1: Mode kontrol torsi (Direct Torque Control - DTC) sedang aktif.",
        severity: "info",
      },
      {
        bit: 3, name: "Speed control",
        true: "Speed control active",
        false: "Inactive",
        impl: "1: Speed control mode is active.",
        implId: "1: Mode kontrol kecepatan sedang aktif.",
        severity: "info",
      },
      {
        bit: 4, name: "Power stage",
        true: "Power stage active",
        false: "Inactive",
        impl: "1: IGBT gate circuit of VFD power stage is operating.",
        implId: "1: Sirkuit gerbang IGBT sirkuit daya VFD beroperasi.",
        severity: "ok",
      },
      {
        bit: 5, name: "Safe reference active",
        true: "Safe ref active",
        false: "Inactive",
        impl: "1: External emergency reference active — overriding normal setpoint.",
        implId: "1: Referensi darurat eksternal aktif mengabaikan setpoint normal.",
        severity: "warn",
      },
      {
        bit: 6, name: "Last speed active",
        true: "Last speed active",
        false: "Inactive",
        impl: "1: Holding last constant speed due to reference signal loss.",
        implId: "1: Kecepatan konstan terakhir dipertahankan akibat kegagalan referensi.",
        severity: "warn",
      },
      {
        bit: 7, name: "Loss of reference",
        true: "Loss of reference",
        false: "Reference OK",
        impl: "1: Analog or fieldbus reference signal lost in the field. Check wiring.",
        implId: "1: Sinyal referensi analog atau fieldbus terputus di lapangan. Periksa kabel.",
        severity: "fault",
      },
      {
        bit: 8, name: "Emergency stop failed",
        true: "E-stop failed",
        false: "E-stop OK",
        impl: "1: Emergency ramp supervisor detected motor failed to decelerate on e-stop.",
        implId: "1: Pengawasan ramp darurat mendeteksi motor gagal melambat saat e-stop.",
        severity: "fault",
      },
      {
        bit: 9, name: "Jogging active",
        true: "Jogging active",
        false: "Jogging inactive",
        impl: "1: Jogging command 1 or 2 is activating the motor.",
        implId: "1: Perintah jogging 1 atau 2 sedang mengaktifkan motor.",
        severity: "info",
      },
      {
        bit: 10, name: "Above limit",
        true: "Above limit",
        false: "Within limit",
        impl: "1: Actual torque/speed parameter exceeds threshold.",
        implId: "1: Parameter torsi/kecepatan aktual melebihi ambang batas.",
        severity: "warn",
      },
      {
        bit: 11, name: "Emergency stop active",
        true: "E-stop active",
        false: "Inactive",
        impl: "1: Emergency stop signal (OFF1/OFF3) is being processed.",
        implId: "1: Sinyal stop darurat (OFF1/OFF3) sedang diproses.",
        severity: "fault",
      },
      {
        bit: 12, name: "All start interlocks",
        true: "Interlocks present",
        false: "Interlock missing",
        impl: "1: All start interlocks (1–4) are satisfied. 0: Interlock chain incomplete.",
        implId: "1: Seluruh interlock start (1 hingga 4) telah terpenuhi. 0: Rantai interlock tidak lengkap.",
        severity: "ok",
      },
      reserved(13),
      reserved(14),
      reserved(15),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 06.18 — Start Inhibit Status Word
  // ─────────────────────────────────────────────────────────────
  {
    param: "06.18",
    label: "Start Inhibit Status Word",
    labelId: "Status Word Hambatan Start",
    desc: "Identifies specific source preventing the drive from starting. Any active bit = start blocked.",
    descId: "Menunjukkan sumber penghalang spesifik mengapa drive menolak berputar. Bit aktif = start diblokir.",
    bits: [
      {
        bit: 0, name: "Not ready run",
        true: "Not ready run",
        false: "Ready run",
        impl: "1: DC bus voltage lost or motor parameters incomplete.",
        implId: "1: Tegangan bus DC hilang atau parameter motor belum tuntas.",
        severity: "fault",
      },
      {
        bit: 1, name: "Ctrl location changed",
        true: "Ctrl loc changed",
        false: "Inactive",
        impl: "1: Control location change requires start signal to be deactivated first.",
        implId: "1: Perubahan lokasi kontrol memerlukan pemutusan sinyal start terlebih dahulu.",
        severity: "warn",
      },
      {
        bit: 2, name: "SSW inhibit",
        true: "SSW inhibit active",
        false: "Inactive",
        impl: "1: Control program self-locked after fault/emergency stop. Cycle start signal.",
        implId: "1: Program kontrol mengunci diri pasca fault/stop darurat. Siklus ulang sinyal start.",
        severity: "fault",
      },
      {
        bit: 3, name: "Fault reset",
        true: "Fault active/resetting",
        false: "Inactive",
        impl: "1: Fault reset just executed — wait for reset to complete before restarting.",
        implId: "1: Reset kegagalan baru saja dieksekusi — tunggu reset selesai sebelum restart.",
        severity: "warn",
      },
      {
        bit: 4, name: "Lost start enable",
        true: "Lost start enable",
        false: "Inactive",
        impl: "1: Start enable signal (physical or parameter) is missing.",
        implId: "1: Sinyal start enable fisik atau parameter hilang.",
        severity: "fault",
      },
      {
        bit: 5, name: "Lost run enable",
        true: "Lost run enable",
        false: "Inactive",
        impl: "1: Run enable signal (e.g. external interlock) is missing.",
        implId: "1: Sinyal run enable fisik (misal interlock eksternal) hilang.",
        severity: "fault",
      },
      {
        bit: 6, name: "FSO safety inhibit",
        true: "FSO inhibit active",
        false: "Inactive",
        impl: "1: Safety module FSO-xx function active — blocking start.",
        implId: "1: Fungsi keselamatan modul FSO aktif memblokir start.",
        severity: "fault",
      },
      {
        bit: 7, name: "STO",
        true: "STO active",
        false: "STO inactive",
        impl: "1: Safe Torque Off active — physical safety loop open. Inspect STO wiring.",
        implId: "1: Sinyal Safe Torque Off aktif, sirkuit keselamatan fisik terbuka. Periksa kabel STO.",
        severity: "fault",
      },
      {
        bit: 8, name: "Emergency stop",
        true: "Emergency stop active",
        false: "Inactive",
        impl: "1: Emergency stop command (OFF2 or OFF3) blocking restart.",
        implId: "1: Perintah stop darurat (OFF2 atau OFF3) sedang memblokir start.",
        severity: "fault",
      },
      {
        bit: 9, name: "Reset permit missing",
        true: "Reset permit missing",
        false: "Inactive",
        impl: "1: Fault reset permission condition not yet satisfied.",
        implId: "1: Syarat izin reset fault belum terpenuhi.",
        severity: "warn",
      },
      {
        bit: 10, name: "Jogging inhibit",
        true: "Jogging active inhibit",
        false: "Inactive",
        impl: "1: Active jogging signal blocking regular start.",
        implId: "1: Sinyal jogging memblokir start reguler.",
        severity: "warn",
      },
      {
        bit: 11, name: "Pre-heating inhibit",
        true: "Pre-heating inhibit",
        false: "Inactive",
        impl: "1: Motor pre-heating phase blocking normal start.",
        implId: "1: Fase pemanasan motor sedang memblokir start normal.",
        severity: "warn",
      },
      {
        bit: 12, name: "Aux power missing",
        true: "Aux power missing",
        false: "Inactive",
        impl: "1: 24 V control board auxiliary power problem detected.",
        implId: "1: Tegangan kontrol board 24 V mengalami masalah.",
        severity: "fault",
      },
      reserved(13),
      reserved(14),
      reserved(15),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 06.19 — Speed Control Status Word
  // ─────────────────────────────────────────────────────────────
  {
    param: "06.19",
    label: "Speed Control Status Word",
    labelId: "Status Word Kontrol Kecepatan",
    desc: "Displays speed deviation detail of actual motor speed vs. reference profile.",
    descId: "Menampilkan detail deviasi kecepatan aktual motor terhadap profil referensi.",
    bits: [
      {
        bit: 0, name: "Zero speed",
        true: "Zero speed",
        false: "Above zero speed",
        impl: "1: Actual motor speed is below the zero speed threshold.",
        implId: "1: Kecepatan aktual motor berada di bawah batas zero speed.",
        severity: "info",
      },
      {
        bit: 1, name: "Speed window",
        true: "Inside speed window",
        false: "Outside window",
        impl: "1: Difference between actual and reference speed is within the defined window.",
        implId: "1: Selisih kecepatan aktual dan referensi berada di dalam batas.",
        severity: "ok",
      },
      {
        bit: 2, name: "Reverse",
        true: "Reverse direction",
        false: "Forward direction",
        impl: "1: Motor rotating in negative/reverse direction.",
        implId: "1: Putaran motor berjalan ke arah negatif/terbalik.",
        severity: "info",
      },
      {
        bit: 3, name: "Out of speed window",
        true: "Out of window",
        false: "Inside window",
        impl: "1: Speed difference exceeds safe deviation limit. Check load and tuning.",
        implId: "1: Selisih kecepatan melampaui batas deviasi yang aman. Periksa beban dan tuning.",
        severity: "warn",
      },
      {
        bit: 4, name: "Minimum speed reached",
        true: "Min speed reached",
        false: "Above minimum speed",
        impl: "1: Actual speed limited by minimum speed parameter.",
        implId: "1: Kecepatan aktual dibatasi oleh parameter batas minimum speed.",
        severity: "warn",
      },
      {
        bit: 5, name: "Maximum speed reached",
        true: "Max speed reached",
        false: "Below maximum speed",
        impl: "1: Actual speed limited by maximum speed parameter.",
        implId: "1: Kecepatan aktual dibatasi oleh parameter batas maksimum speed.",
        severity: "warn",
      },
      {
        bit: 6, name: "Tracking error",
        true: "Tracking error",
        false: "Tracking OK",
        impl: "1: Actual position/speed deviation from profiler detected.",
        implId: "1: Deteksi deviasi posisi/kecepatan aktual terhadap profiler.",
        severity: "warn",
      },
      {
        bit: 7, name: "Constant speed",
        true: "Constant speed selected",
        false: "Not selected",
        impl: "1: Binary constant speed is active, selected by PLC logic.",
        implId: "1: Kecepatan konstan biner sedang aktif dipilih oleh logika PLC.",
        severity: "info",
      },
      {
        bit: 8, name: "Follower speed min lim",
        true: "Limit reached",
        false: "Within limits",
        impl: "1: Minimum master-follower speed correction limit reached.",
        implId: "1: Batas minimum koreksi kecepatan master-follower tercapai.",
        severity: "warn",
      },
      {
        bit: 9, name: "Follower speed max lim",
        true: "Limit reached",
        false: "Within limits",
        impl: "1: Maximum master-follower speed correction limit reached.",
        implId: "1: Batas maksimum koreksi kecepatan master-follower tercapai.",
        severity: "warn",
      },
      reserved(10),
      reserved(11),
      reserved(12),
      reserved(13),
      reserved(14),
      reserved(15),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 06.21 — Drive Status Word 3
  // ─────────────────────────────────────────────────────────────
  {
    param: "06.21",
    label: "Drive Status Word 3",
    labelId: "Drive Status Word 3",
    desc: "Contains telemetry related to braking and transient start functions.",
    descId: "Berisi telemetri terkait pengereman dan fungsi start transien.",
    bits: [
      {
        bit: 0, name: "DC hold active",
        true: "DC hold active",
        false: "Inactive",
        impl: "1: Shaft position hold function with DC current injection is active.",
        implId: "1: Fungsi penahanan posisi poros dengan injeksi arus DC aktif.",
        severity: "info",
      },
      {
        bit: 1, name: "Post-magnetizing",
        true: "Post-mag active",
        false: "Inactive",
        impl: "1: Additional magnetic flux injection active after motor stopped.",
        implId: "1: Injeksi fluks magnetik tambahan sesudah motor berhenti aktif.",
        severity: "info",
      },
      {
        bit: 2, name: "Pre-heating active",
        true: "Pre-heating active",
        false: "Inactive",
        impl: "1: Motor stator heating to prevent condensation is active.",
        implId: "1: Pemanasan stator motor untuk mencegah kondensasi sedang bekerja.",
        severity: "info",
      },
      {
        bit: 3, name: "Smooth start active",
        true: "Smooth start active",
        false: "Inactive",
        impl: "1: Smooth start algorithm (for PM synchronous motors) is active.",
        implId: "1: Algoritma smooth start (untuk motor sinkron magnet permanen) aktif.",
        severity: "info",
      },
      {
        bit: 4, name: "Rotor position known",
        true: "Position known",
        false: "Position unknown",
        impl: "1: PM rotor pole position detected without autophasing.",
        implId: "1: Posisi kutub rotor magnet permanen terdeteksi tanpa autophasing.",
        severity: "ok",
      },
      {
        bit: 5, name: "Brake chopper active",
        true: "Chopper active",
        false: "Inactive",
        impl: "1: Dynamic braking transistor dissipating regenerative energy to brake resistor.",
        implId: "1: Transistor pengereman dinamis membuang energi ke resistor rem.",
        severity: "info",
      },
      {
        bit: 6, name: "Temp estimation active",
        true: "Estimation active",
        false: "Inactive",
        impl: "1: Thermal model estimating winding heat accumulation.",
        implId: "1: Model termal sedang memperkirakan akumulasi panas kumparan.",
        severity: "info",
      },
      {
        bit: 7, name: "FSO speed est reversed",
        true: "Estimate reversed",
        false: "Estimate normal",
        impl: "1: Safety module FSO speed estimate is in reversed condition.",
        implId: "1: Estimasi kecepatan dari modul keselamatan dalam kondisi terbalik.",
        severity: "warn",
      },
      reserved(8),
      reserved(9),
      reserved(10),
      reserved(11),
      reserved(12),
      reserved(13),
      reserved(14),
      reserved(15),
    ],
  },
];

// ─── Symptom diagnostic matrix (from PDF section "Matriks Diagnosis") ─────────
export interface SymptomScenario {
  id: string;
  symptom: string;
  symptomId: string;
  bits: { param: string; bit: number; expected: number }[];
  mechanism: string;
  mechanismId: string;
  mitigation: string;
  mitigationId: string;
}

export const SYMPTOM_SCENARIOS: SymptomScenario[] = [
  {
    id: "s1",
    symptom: "VFD ignores start command — no fault displayed",
    symptomId: "VFD mengabaikan perintah start — tidak ada fault tampil",
    bits: [
      { param: "06.11", bit: 6, expected: 1 },
      { param: "06.16", bit: 1, expected: 1 },
    ],
    mechanism: "External safety interlock (Run Permissive or STO) open.",
    mechanismId: "Sinyal interlock keselamatan eksternal (Run Permissive atau STO) terbuka.",
    mitigation: "Check par. 06.18 Bit 7. If 0 (inverted-active), trace STO wiring loop and verify Emergency Stop button is released.",
    mitigationId: "Periksa par. 06.18 Bit 7. Jika bernilai 0 (aktif terbalik), telusuri loop kabel fisik STO dan pastikan tombol Emergency Stop telah dirilis.",
  },
  {
    id: "s2",
    symptom: "Motor refuses to rotate — DC bus OK",
    symptomId: "Motor menolak berputar — Bus DC siap",
    bits: [
      { param: "06.11", bit: 1, expected: 1 },
      { param: "06.16", bit: 6, expected: 0 },
    ],
    mechanism: "DC bus charged, but IGBT switching gates blocked by control logic.",
    mechanismId: "Tegangan bus DC terisi penuh, namun gerbang pensakelaran IGBT diblokir oleh logika kontrol.",
    mitigation: "Verify Group 20 direction control and start permission parameters match I/O terminal or fieldbus source.",
    mitigationId: "Pastikan parameter kontrol arah dan parameter izin start (Group 20) terkonfigurasi benar sesuai sumber terminal I/O atau fieldbus.",
  },
  {
    id: "s3",
    symptom: "Motor speed does not reach setpoint reference",
    symptomId: "Kecepatan motor tidak mencapai nilai referensi",
    bits: [
      { param: "06.11", bit: 8, expected: 0 },
      { param: "06.19", bit: 1, expected: 1 },
    ],
    mechanism: "Excessive mechanical load forcing drive to operate at maximum torque limit.",
    mechanismId: "Beban mekanis berlebih memaksa drive beroperasi pada batas torsi maksimum.",
    mitigation: "Check torque and current limits in Group 30. Perform speed controller autotune for optimal dynamic tuning.",
    mitigationId: "Periksa parameter batas torsi dan arus di Group 30. Aktifkan autotune pada pengontrol kecepatan untuk penyetelan dinamis optimal.",
  },
  {
    id: "s4",
    symptom: "System locked after emergency stop",
    symptomId: "Sistem terkunci setelah mengalami stop darurat",
    bits: [
      { param: "06.11", bit: 6, expected: 1 },
      { param: "06.11", bit: 1, expected: 0 },
    ],
    mechanism: "Start signal not deactivated (reset) after emergency ramp stop cycle completed.",
    mechanismId: "Transisi sinyal start tidak dinonaktifkan (di-reset) setelah siklus stop darurat ramp stop selesai.",
    mitigation: "Ensure PLC sends decimal 1150 to Control Word to reset state machine, then resend start command 1151.",
    mitigationId: "Pastikan program PLC mengirimkan nilai desimal 1150 pada control word untuk mereset mesin status sebelum mengirim kembali perintah start 1151.",
  },
];
