import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import * as settingsApi from "../services/settings";

const Ctx = createContext(null);
export const useSettings = () => useContext(Ctx);

const DEFAULTS = {
  theme: "system",
  language: "en",
  notificationsEnabled: true,
  dailyTaskLimit: 5,
  workStart: "09:00",
  workEnd: "17:00",
  sleepTime: "00:00",
  reviewDay: 0,
};

const CACHE = "lifeos-prefs";

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE)) || {};
  } catch {
    return {};
  }
};

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => ({
    ...DEFAULTS,
    ...readCache(),
  }));
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

  useEffect(() => {
    const media = darkQuery();
    const onChange = (e) => setSystemDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const isDark =
    settings.theme === "dark" || (settings.theme === "system" && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === "ar" ? "rtl" : "ltr";
  }, [settings.language]);

  useEffect(() => {
    localStorage.setItem(
      CACHE,
      JSON.stringify({ theme: settings.theme, language: settings.language }),
    );
  }, [settings.theme, settings.language]);

  const loadSettings = useCallback(async () => {
    setStatus("loading");
    try {
      setSettings(await settingsApi.get());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      setStatus("loading");
      setSettings((s) => ({
        ...DEFAULTS,
        theme: s.theme,
        language: s.language,
      }));
    }
  }, [user?.id, loadSettings]);

  const updateSettings = async (patch) => {
    setError("");
    const previous = settings;
    setSettings((s) => ({ ...s, ...patch }));
    try {
      setSettings(await settingsApi.update(patch));
      return true;
    } catch (err) {
      setSettings(previous);
      setError(err.message);
      return false;
    }
  };

  const clearError = () => setError("");

  return (
    <Ctx.Provider
      value={{
        settings,
        status,
        error,
        clearError,
        isDark,
        loadSettings,
        updateSettings,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
