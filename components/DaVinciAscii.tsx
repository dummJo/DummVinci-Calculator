"use client";

/**
 * Static ASCII-art atmosphere — Leonardo da Vinci notebook aesthetic.
 * Pure CSS animations (opacity + transform). No JS handlers, no rAF.
 * Hidden on mobile < 640px via .dv-ascii { display: none }.
 */

const VITRUVIAN = [
  "                 . - ~ ~ ~ - .",
  "             ,'                 ',",
  "           ,'     _ _ _ _ _       ',",
  "          /   , '             ' ,   \\",
  "         /  ,'        _O_        ',  \\",
  "        |  /         / | \\         \\  |",
  "        | |         /  |  \\         | |",
  "        | |  -------+---+---+------  | |",
  "        | |        \\   |   /        | |",
  "        |  \\        \\  |  /        /  |",
  "         \\  ',       \\ | /       ,'  /",
  "          \\   ',      \\|/      ,'   /",
  "           ',   ' - , _O_ , - '   ,'",
  "             ',        |        ,'",
  "               '  -  _ | _  -  '",
  "                    / . \\",
  "                   /     \\",
  "                  /       \\",
].join("\n");

const SPIRAL = [
  "        .  .  .  .  .  .  .  .  .",
  "     .     , - ~ ~ ~ - ,      .",
  "   .    ,'              '.,    .",
  "  .   ,'      _ - ~ ~ -_   ',   .",
  "  .  /     ,'           '.,  \\  .",
  "  . |    ,'   , - ~ - ,    ', |",
  "  . |   /   ,'         ',   \\ |",
  "  . |  |   |   phi=1.618 |   ||",
  "  . |   \\   ',         ,'   /.|",
  "  . |    ',   ' - - - '   ,'  |",
  "  .  \\     ',           ,'   /.",
  "   .   ',    '., _ _ ,.'   ,'.",
  "     .    ' - , _ _ , - '   .",
  "   .  .  .  .  .  .  .  .  .",
].join("\n");

const MARGINALIA = [
  "    +   *   .   codex atlanticus   .   *   +",
  "      f(x) dx     o     a^2 + b^2 = c^2",
  "    .  /  .   speculum  naturae  .  /  .",
  "      sol  luna  terra  mars  venus  saturn",
  "          --- proporzione divina ---",
  "      r . phi -> r' . phi' -> r'' . phi''",
  "    +   *   .   omo sanza lettere   .   *   +",
].join("\n");

const WING = [
  "                         _ _",
  "              _ _ _  ,-'     '-._",
  "           ,-'      X             '-._",
  "         ,'       / | \\               '.",
  "        /       /   |   \\               \\",
  "       /      /     |    \\               \\",
  "      |     /  _    |     \\_______________\\",
  "      |    / ,'  \\  |      |  ribs        |",
  "       \\  / /     \\ |      |  membrana    |",
  "        \\'/ /_____\\ |______|______________|",
  "          |--- wingspan ---|",
  "     studio per macchina volante  1505",
].join("\n");

const GEAR = [
  "           _ _ _",
  "        ,-'     '-,     _ _ _",
  "       /  O     O  \\  ,'     ',",
  "      | O   [*]   O |/  O   O  \\",
  "      | O   [*]   O |\\  O   O  /",
  "       \\  O     O  /  ',_____,'",
  "        '-,_ _ _,-'",
  "         |       |   denti: 12",
  "         |  =*=  |   ratio: phi",
  "         |_______|",
  "    ingegno meccanico — 1478",
].join("\n");

const EYE = [
  "                  ___",
  "              _,-'   '-._",
  "           ,-'    / \\    '-.",
  "          /    ,-'   '-,    \\",
  "         |   ,'    *    ',   |",
  "         |  /   .   .   \\  |",
  "         |  \\    ' '    /  |",
  "          \\   '-,   ,-'   /",
  "           '-._  '-'  _,-'",
  "               '-,_,-'",
  "    saper vedere — occhio anatomico",
].join("\n");

const WAVES = [
  "  ~~~  osservazione dell'acqua  ~~~",
  "  ~\\/~\\/~\\/~\\/~\\/~\\/~\\/~\\/~",
  "   \\/   \\/   \\/   \\/   \\/   \\/",
  "   /\\   /\\   /\\   /\\   /\\   /\\",
  "  /  \\/  \\/  \\/  \\/  \\/  \\/  \\",
  "  frequenza f = v / lambda",
  "  ~~~  studi idrodinamici  1507  ~~~",
].join("\n");

const COMPASS = [
  "          . compasso .",
  "              /\\",
  "             /  \\",
  "            /    \\",
  "           /  .'. \\",
  "          /  /   \\ \\",
  "         /  / [*]  \\ \\",
  "        /  /       \\ \\",
  "       /__/____+____\\__\\",
  "          (  phi  )",
  "     proporzione aurea: 1 : 1.618",
].join("\n");

const ANATOMY = [
  "     studio anatomia — 1489",
  "     _ _ _ _ _ _ _ _ _ _ _",
  "    |  cranio  |  collo   |",
  "    |__________|__________|",
  "    |   spalle + braccia  |",
  "    |  /    torace    \\  |",
  "    |/________________\\  |",
  "    |    addome         |",
  "    |____________________|",
  "    |  /   gambe    \\  |",
  "    |/       |        \\|",
  "     lunghezza = altezza",
].join("\n");

const SKULL = [
  "       studio del cranio — 1489",
  "            ___..----.____",
  "          ,'               ',",
  "         /   . orbita .     \\",
  "        |  ( o )   ( o )    |",
  "        |   '---'   '---'   |",
  "         \\     nasale      /",
  "          ',    ___      ,'",
  "            '--/   \\--'",
  "              |___|___|",
  "         mandibola — 32 denti",
].join("\n");

const HORSE = [
  "    studio del cavallo — 1490",
  "                  ,--.",
  "             _   /    \\",
  "           ,' '-'  ()  \\",
  "          /    |  neck  \\",
  "         | mane|_________|",
  "          \\   /  body    \\",
  "           \\ /  _______   \\",
  "            X  /  legs  \\  \\",
  "           / \\/___________\\/",
  "          /  |  |      |  |",
  "         '   '  '      '  '",
  "    forza = massa x accelerazione",
].join("\n");

const CATAPULT = [
  "   macchina da guerra — 1485",
  "       __",
  "      /  \\  <- contrappeso",
  "     /    \\",
  "    |  [ ] |",
  "    |______|",
  "       |  trebuchet",
  "   ____|____",
  "  /         \\  <- braccio",
  " /___________\\",
  "      |||",
  "   ___|___|___",
  "  |  base    |",
  "  |___________|",
].join("\n");

const ORBITS = [
  "   de revolutionibus — sistemi",
  "               *  sol  *",
  "           . - ~ ~ ~ - .",
  "       . '    mercurio   ' .",
  "     .'   . - ~ ~ ~ - .    '.",
  "    /   .'    venus    '.   \\",
  "   |  .'  . - ~ ~ ~ - .  '.  |",
  "   | /  .'    terra    '.  \\ |",
  "   | \\  '.    ( o )    .'  / |",
  "   |  '.  ' - ~ ~ ~ - '  .'  |",
  "    \\   '.    marte    .'   /",
  "     '.   ' - ~ ~ ~ - '   .'",
  "       ' .   giove    . '",
  "           ' - ~ ~ ~ -'",
].join("\n");

const BRIDGE = [
  "   progetto ponte — 1502",
  "        _____________",
  "       /             \\",
  "      /   arco        \\",
  "     /  principale     \\",
  "    /___________________\\",
  "   |  |             |  |",
  "   |  |   arcate    |  |",
  "   |__|_____________|__|",
  "   ========================",
  "     carreggiata 24 braccia",
  "   ponte ad arco parabolico",
].join("\n");

const LUTE = [
  "     studio di liuto — 1494",
  "            ___",
  "          ,'   ',",
  "         /  ( )  \\",
  "        |  _____  |",
  "        | |     | |",
  "        | |     | |",
  "        | |_____| |",
  "         \\  | |  /",
  "          \\ | | /",
  "           \\|_|/",
  "            | |  <- manico",
  "      corde: sol re la mi",
].join("\n");

const GEOMETRY = [
  "   de divina proportione — 1496",
  "          *",
  "         /|\\",
  "        / | \\",
  "       /  |  \\",
  "      /   |   \\",
  "     *----+----*",
  "     |\\   |   /|",
  "     | \\  |  / |",
  "     |  \\ | /  |",
  "     |   \\|/   |",
  "     *----*----*",
  "   poliedro regolare — solido",
  "   a : b = (a+b) : a = phi",
].join("\n");

const MIRROR = [
  "   scrittura speculare — 1490s",
  "   .elanoizoporp aimonotana",
  "   .enoizavresbo id etrA",
  "   ...oigge d oilgpecs ollad",
  "   -----",
  "   Art of observation...",
  "   Anatomia proporzionale.",
  "   ...from the mirror of the eye",
  "   -----",
  "   niM am oiduts — oicraL",
].join("\n");

type Panel = {
  art: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  opacity?: number;
  fontSize?: number;
  drift?: boolean;
  animDur?: string;
};

const PANELS: Panel[] = [
  // --- LEFT COLUMN ---
  { art: VITRUVIAN,  top: "5vh",    left: "-1vw",  opacity: 0.13,  drift: true,  animDur: "36s" },
  { art: ANATOMY,    top: "28vh",   left: "0vw",   opacity: 0.09,  fontSize: 10, drift: true,  animDur: "47s" },
  { art: GEAR,       top: "55vh",   left: "1vw",   opacity: 0.10,  drift: false, animDur: "41s" },
  { art: WAVES,      top: "75vh",   left: "2vw",   opacity: 0.08,  fontSize: 10, drift: true,  animDur: "52s" },
  { art: CATAPULT,   top: "95vh",   left: "0vw",   opacity: 0.09,  drift: false, animDur: "19s" },
  { art: BRIDGE,     top: "120vh",  left: "1vw",   opacity: 0.10,  drift: true,  animDur: "44s" },
  { art: HORSE,      top: "150vh",  left: "-1vw",  opacity: 0.09,  fontSize: 10, drift: false, animDur: "31s" },

  // --- RIGHT COLUMN ---
  { art: WING,       top: "18vh",   right: "1vw",  opacity: 0.11,  drift: false, animDur: "11s" },
  { art: SPIRAL,     top: "40vh",   right: "-1vw", opacity: 0.12,  drift: true,  animDur: "28s" },
  { art: EYE,        top: "62vh",   right: "5vw",  opacity: 0.10,  drift: false, animDur: "13s" },
  { art: COMPASS,    top: "82vh",   right: "2vw",  opacity: 0.10,  drift: true,  animDur: "7s"  },
  { art: SKULL,      top: "105vh",  right: "0vw",  opacity: 0.09,  drift: false, animDur: "23s" },
  { art: ORBITS,     top: "130vh",  right: "-1vw", opacity: 0.10,  drift: true,  animDur: "55s" },
  { art: LUTE,       top: "160vh",  right: "3vw",  opacity: 0.09,  drift: false, animDur: "17s" },

  // --- CENTER / SCATTERED ---
  { art: MARGINALIA, top: "10vh",   right: "22vw", opacity: 0.07,  fontSize: 10, drift: true,  animDur: "61s" },
  { art: GEOMETRY,   top: "48vh",   left: "30vw",  opacity: 0.08,  drift: true,  animDur: "38s" },
  { art: MIRROR,     top: "88vh",   left: "28vw",  opacity: 0.07,  fontSize: 10, drift: false, animDur: "25s" },
  { art: MARGINALIA, top: "140vh",  left: "25vw",  opacity: 0.06,  fontSize: 10, drift: true,  animDur: "43s" },
];

export default function DaVinciAscii() {
  return (
    <div aria-hidden="true">
      {PANELS.map((p, i) => (
        <div
          key={i}
          className={`dv-ascii${p.drift ? " dv-ascii--drift" : ""}`}
          style={{
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
            ...(p.opacity !== undefined ? { opacity: p.opacity } : {}),
          }}
        >
          <pre
            style={{
              ...(p.fontSize ? { fontSize: p.fontSize } : {}),
              animationDuration: p.animDur,
            }}
          >
            {p.art}
          </pre>
        </div>
      ))}
    </div>
  );
}
