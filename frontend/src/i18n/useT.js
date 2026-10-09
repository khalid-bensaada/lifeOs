import { useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import { translate, localeOf } from "./index";

export function useT() {
  const { settings } = useSettings();
  const language = settings.language;
  const locale = localeOf(language);

  const t = useCallback(
    (key, params) => translate(language, key, params),
    [language],
  );

  const tc = useCallback(
    (category) => {
      const key = `category.${category}`;
      const value = translate(language, key);
      return value === key ? category : value;
    },
    [language],
  );

  const formatDate = useCallback(
    (date, options) => date.toLocaleDateString(locale, options),
    [locale],
  );

  const shortDay = useCallback(
    (iso) =>
      new Date(iso).toLocaleDateString(locale, {
        weekday: "short",
        timeZone: "UTC",
      }),
    [locale],
  );

  return { t, tc, language, locale, formatDate, shortDay };
}
