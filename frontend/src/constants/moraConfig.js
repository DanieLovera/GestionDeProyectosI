const MORA_CONFIG_KEY = 'mora_config_v1';

const defaultConfig = {
  dailyRate: 0.005, // 0.5% per day
  startAfterDays: 0, // days after due date before mora starts
};

export function loadMoraConfig() {
  try {
    const raw = localStorage.getItem(MORA_CONFIG_KEY);
    if (!raw) return defaultConfig;
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch (e) {
    return defaultConfig;
  }
}

export function saveMoraConfig(cfg) {
  try {
    localStorage.setItem(MORA_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    // ignore
  }
}

export default defaultConfig;
