import en from "./en";
import ar from "./ar";
import fr from "./fr";

export const MESSAGES = { en, ar, fr };

const LOCALES = { en: "en-GB", ar: "ar-u-nu-latn", fr: "fr-FR" };

export const localeOf = (language) => LOCALES[language] || "en-GB";

export const translate = (language, key, params) => {
  const raw = MESSAGES[language]?.[key] ?? en[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
};
