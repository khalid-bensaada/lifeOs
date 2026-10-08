import { useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import { translate } from "./index";

export function useT() {
  const { settings } = useSettings();
  const language = settings.language;
  const t = useCallback(
    (key, params) => translate(language, key, params),
    [language],
  );
  return { t, language };
}
