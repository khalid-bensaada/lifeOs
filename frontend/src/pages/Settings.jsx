import { useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { useT } from "../i18n/useT";
import { Card, fieldCls, btnCls } from "../components/ui";

const LANGUAGES = [
  ["en", "English"],
  ["ar", "العربية"],
  ["fr", "Français"],
];

function Choice({ label, options, value, onPick }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map(([key, text]) => (
        <button
          key={key}
          onClick={() => onPick(key)}
          aria-pressed={value === key}
          className={`rounded-full border px-4 py-1.5 text-sm ${
            value === key
              ? "border-accent bg-accent/10 text-accent"
              : "border-line text-muted"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function Productivity() {
  const { t } = useT();
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState({
    dailyTaskLimit: String(settings.dailyTaskLimit),
    workStart: settings.workStart,
    workEnd: settings.workEnd,
    sleepTime: settings.sleepTime,
    reviewDay: String(settings.reviewDay),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await updateSettings({
      dailyTaskLimit: Number(form.dailyTaskLimit),
      workStart: form.workStart,
      workEnd: form.workEnd,
      sleepTime: form.sleepTime,
      reviewDay: Number(form.reviewDay),
    });
    setSaving(false);
    setSaved(ok);
  };

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-semibold">{t("settings.productivity")}</h2>
        <p className="text-sm text-muted">{t("settings.productivityHint")}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              {t("settings.dailyLimit")}
            </span>
            <input
              type="number"
              min="1"
              max="10"
              step="1"
              value={form.dailyTaskLimit}
              onChange={set("dailyTaskLimit")}
              className={`${fieldCls} w-full`}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              {t("settings.reviewDay")}
            </span>
            <select
              value={form.reviewDay}
              onChange={set("reviewDay")}
              className={`${fieldCls} w-full`}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <option key={i} value={i}>
                  {t(`day.${i}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              {t("settings.workStart")}
            </span>
            <input
              type="time"
              value={form.workStart}
              onChange={set("workStart")}
              className={`${fieldCls} w-full`}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t("settings.workEnd")}</span>
            <input
              type="time"
              value={form.workEnd}
              onChange={set("workEnd")}
              className={`${fieldCls} w-full`}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              {t("settings.sleepTime")}
            </span>
            <input
              type="time"
              value={form.sleepTime}
              onChange={set("sleepTime")}
              className={`${fieldCls} w-full`}
            />
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button disabled={saving} className={`${btnCls} disabled:opacity-60`}>
            {saving ? t("common.saving") : t("settings.save")}
          </button>
          {saved && (
            <p role="status" className="text-sm text-accent">
              {t("settings.saved")}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}

export default function Settings() {
  const { t } = useT();
  const { settings, status, loadSettings, updateSettings } = useSettings();

  const themes = [
    ["light", t("settings.themeLight")],
    ["dark", t("settings.themeDark")],
    ["system", t("settings.themeSystem")],
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.settings")}</h1>
        <p className="text-sm text-muted">{t("settings.subtitle")}</p>
      </header>

      {status === "loading" && (
        <div aria-busy="true" className="space-y-4">
          <div className="h-28 animate-pulse rounded-xl bg-line/60" />
          <div className="h-28 animate-pulse rounded-xl bg-line/60" />
          <div className="h-64 animate-pulse rounded-xl bg-line/60" />
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">{t("common.somethingWrong")}</p>
          <p className="mt-1 text-sm text-muted">{t("settings.loadError")}</p>
          <button onClick={loadSettings} className={`${btnCls} mt-4`}>
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      {status === "ready" && (
        <>
          <Card className="space-y-3">
            <h2 className="font-semibold">{t("settings.appearance")}</h2>
            <Choice
              label={t("settings.theme")}
              options={themes}
              value={settings.theme}
              onPick={(theme) => updateSettings({ theme })}
            />
          </Card>

          <Card className="space-y-3">
            <div>
              <h2 className="font-semibold">{t("settings.language")}</h2>
              <p className="text-sm text-muted">{t("settings.languageHint")}</p>
            </div>
            <Choice
              label={t("settings.language")}
              options={LANGUAGES}
              value={settings.language}
              onPick={(language) => updateSettings({ language })}
            />
          </Card>

          <Card className="space-y-3">
            <h2 className="font-semibold">{t("settings.notifications")}</h2>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) =>
                  updateSettings({ notificationsEnabled: e.target.checked })
                }
                className="size-4 accent-[var(--accent)]"
              />
              {t("settings.notificationsLabel")}
            </label>
          </Card>

          <Productivity />
        </>
      )}
    </div>
  );
}
