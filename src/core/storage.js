const STORAGE_KEY = "zimo_microbe_defense_profile_v1";

function defaultProfile() {
  return {
    exp: 0,
    cards: [],
    best: {},
    completed: [],
    muted: false,
    totalRuns: 0
  };
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw);
    return {
      ...defaultProfile(),
      ...parsed,
      cards: Array.isArray(parsed.cards) ? parsed.cards : [],
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      best: parsed.best && typeof parsed.best === "object" ? parsed.best : {}
    };
  } catch (error) {
    return defaultProfile();
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn("Gagal menyimpan progres ZIMO", error);
  }
}
