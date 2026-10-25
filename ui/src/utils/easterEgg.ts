import { reactive } from "vue";

export interface Achievement {
  id: number;
  key: string;
  title: string;
  desc: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    key: "konami",
    title: "Mysterious Code",
    desc: "An old and classic cheat code",
    icon: "/easteregg/achievement-1.png",
  },
  {
    id: 2,
    key: "console",
    title: "Console Hacker?",
    desc: "Perhaps you could take a look at the console.",
    icon: "/easteregg/achievement-2.png",
  },
  {
    id: 3,
    key: "logo",
    title: "Logo Clicker",
    desc: "Why the obsession with clicking the logo?",
    icon: "/easteregg/achievement-3.png",
  },
  {
    id: 4,
    key: "url_terra",
    title: "Terra Profile!",
    desc: "Public Profile prepared specifically for Terra",
    icon: "/easteregg/achievement-4.png",
  },
  {
    id: 5,
    key: "all_completed",
    title: "Terraer!",
    desc: "Congratulations!",
    icon: "/easteregg/achievement-5.png",
  },
];

const STORAGE_KEY = "pdnode_terra_achievements_v1";

function loadUnlocked(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to load achievements from localStorage", e);
  }
  return [];
}

function saveUnlocked(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error("Failed to save achievements to localStorage", e);
  }
}

export interface ActiveToast extends Achievement {
  toastId: number;
}

export const easterEggState = reactive({
  unlockedIds: loadUnlocked(),
  activeToasts: [] as ActiveToast[],
  showFloatingBanner: false,
  showSpecialModal: false,
});

let toastCounter = 0;

function playMinecraftChime() {
  try {
    const AudioContextClass = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // First tone (G5 ~ 784Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(784, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.28);

    // Second tone (C6 ~ 1046.5Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1046.5, now + 0.12);
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // Audio might fail if user hasn't interacted yet, safe to ignore
  }
}

export function unlockAchievement(id: number) {
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  if (!ach) return;

  const isAlreadyUnlocked = easterEggState.unlockedIds.includes(id);

  if (!isAlreadyUnlocked) {
    easterEggState.unlockedIds.push(id);
    saveUnlocked(easterEggState.unlockedIds);
  }

  // Always show toast notification when triggered
  playMinecraftChime();
  const currentToastId = ++toastCounter;
  easterEggState.activeToasts.push({
    ...ach,
    toastId: currentToastId,
  });

  setTimeout(() => {
    const idx = easterEggState.activeToasts.findIndex(
      (t) => t.toastId === currentToastId,
    );
    if (idx !== -1) {
      easterEggState.activeToasts.splice(idx, 1);
    }
  }, 4800);

  // Check if first 4 are unlocked
  const baseCompleted = [1, 2, 3, 4].every((baseId) =>
    easterEggState.unlockedIds.includes(baseId)
  );

  if (baseCompleted && !easterEggState.unlockedIds.includes(5)) {
    // Delay slightly to let the 4th achievement toast breathe
    setTimeout(() => {
      unlockAchievement(5);
      // Exactly 3 seconds after unlocking the 5th achievement, show modal popup
      setTimeout(() => {
        easterEggState.showSpecialModal = true;
      }, 3000);
    }, 1200);
  }
}

export function triggerKonamiEgg() {
  easterEggState.showFloatingBanner = true;
  unlockAchievement(1);
}

// Logo click tracker
let logoClicks = 0;
let logoTimer: number | null = null;

export function recordLogoClick() {
  logoClicks++;
  if (logoTimer) clearTimeout(logoTimer);

  if (logoClicks >= 5) {
    logoClicks = 0;
    unlockAchievement(3);
  } else {
    logoTimer = window.setTimeout(() => {
      logoClicks = 0;
    }, 2500);
  }
}

// Konami code listener
export function initKonamiListener(): () => void {
  const konamiSeq = [
    "arrowup",
    "arrowup",
    "arrowdown",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "arrowleft",
    "arrowright",
    "b",
    "a",
  ];
  let curIndex = 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    // If target is typing in an input/textarea, ignore
    const target = e.target as HTMLElement;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable)
    ) {
      return;
    }

    const key = e.key.toLowerCase();
    if (key === konamiSeq[curIndex]) {
      curIndex++;
      if (curIndex === konamiSeq.length) {
        curIndex = 0;
        triggerKonamiEgg();
      }
    } else {
      curIndex = key === konamiSeq[0] ? 1 : 0;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}

// Console command egg
let consoleInterval: number | null = null;

export function initConsoleEgg(): () => void {
  // Define window.terra
  (window as unknown as { terra: () => string }).terra = function () {
    unlockAchievement(2);
    console.log(
      "%c[Terra Command Executed] Congratulations on unlocking the console Easter egg! Achievement Get!",
      "color: #22c55e; font-size: 16px; font-weight: bold; background: #0f172a; padding: 8px 14px; border-radius: 6px; border-left: 4px solid #22c55e;",
    );
    return "[Terra Easter Egg] Success! Keep exploring Hack Club Terra!";
  };

  const printTerraLog = () => {
    console.log(
      `%c ████████╗███████╗██████╗ ██████╗  █████╗ \n` +
        `%c ╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔══██╗\n` +
        `%c    ██║   █████╗  ██████╔╝██████╔╝███████║\n` +
        `%c    ██║   ██╔══╝  ██╔══██╗██╔══██╗██╔══██║\n` +
        `%c    ██║   ███████╗██║  ██║██║  ██║██║  ██║\n` +
        `%c    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝\n` +
        `%c%cterra()%c A mysterious function, why not try?  `,
      "color: #22c55e; font-weight: bold;",
      "color: #16a34a; font-weight: bold;",
      "color: #15803d; font-weight: bold;",
      "color: #166534; font-weight: bold;",
      "color: #14532d; font-weight: bold;",
      "color: #052e16; font-weight: bold;",
      "color: #38bdf8; font-size: 13px; font-weight: bold;",
      "color: #facc15; font-size: 14px; font-weight: 900; background: #1e293b; padding: 2px 6px; border-radius: 4px;",
      "color: #38bdf8; font-size: 13px; font-weight: bold;",
    );
  };

  // Immediate print on load
  printTerraLog();

  // Print every 3 seconds as requested
  consoleInterval = window.setInterval(printTerraLog, 3000);

  return () => {
    if (consoleInterval) {
      clearInterval(consoleInterval);
      consoleInterval = null;
    }
  };
}

export function resetAchievements() {
  easterEggState.unlockedIds = [];
  saveUnlocked([]);
  easterEggState.activeToasts = [];
  easterEggState.showSpecialModal = false;
  easterEggState.showFloatingBanner = false;
}
