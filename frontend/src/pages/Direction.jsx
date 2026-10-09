import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp, goalProgress } from "../context/AppContext";
import { useT } from "../i18n/useT";
import { Card, Bar, Badge, fieldCls, btnCls } from "../components/ui";
import { streaks } from "../utils/habits";
import { currentLevel, skillProgress } from "../utils/skills";
import * as visionApi from "../services/vision";

function Now({ status, items, empty, to, linkText, render }) {
  const { t } = useT();
  return (
    <Card className="space-y-3 !p-4">
      <h3 className="text-sm font-semibold">{t("direction.rightNow")}</h3>
      {status === "loading" && (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-muted">{t("direction.cantLoad")}</p>
      )}
      {status === "ready" && items.length === 0 && (
        <p className="text-sm text-muted">{empty}</p>
      )}
      {status === "ready" && items.length > 0 && (
        <ul className="space-y-3">{items.map(render)}</ul>
      )}
      <Link
        to={to}
        className="inline-block text-sm text-accent hover:underline"
      >
        {linkText}
      </Link>
    </Card>
  );
}

function Section({ label, hint, value, onChange, side }) {
  return (
    <div className={`grid items-start gap-4 ${side ? "lg:grid-cols-2" : ""}`}>
      <Card>
        <label className="block space-y-1.5">
          <span className="font-semibold">{label}</span>
          {hint && <span className="block text-sm text-muted">{hint}</span>}
          <textarea
            rows={5}
            maxLength={3000}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${fieldCls} w-full`}
          />
        </label>
      </Card>
      {side}
    </div>
  );
}

export default function Direction() {
  const { t } = useT();
  const {
    goals,
    goalsStatus,
    projects,
    projectsStatus,
    habits,
    habitsStatus,
    skills,
    skillsStatus,
  } = useApp();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setForm(await visionApi.get());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (value) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      setForm(await visionApi.save(form));
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const openProjects = projects.filter(
    (p) => !["completed", "archived"].includes(p.status),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.direction")}</h1>
        <p className="text-sm text-muted">{t("direction.subtitle")}</p>
      </header>

      {status === "loading" && (
        <div aria-busy="true" className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-line/60" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">{t("common.somethingWrong")}</p>
          <p className="mt-1 text-sm text-muted">{t("direction.loadError")}</p>
          <button onClick={load} className={`${btnCls} mt-4`}>
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      {status === "ready" && (
        <form onSubmit={submit} className="space-y-6">
          <Section
            label={t("direction.oneYear")}
            hint={t("direction.oneYearHint")}
            value={form.oneYear}
            onChange={set("oneYear")}
            side={
              <Now
                status={goalsStatus}
                items={activeGoals}
                empty={t("direction.noGoals")}
                to="/goals"
                linkText={t("direction.openGoals")}
                render={(g) => (
                  <li key={g.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span>{g.title}</span>
                      <span className="text-muted" dir="ltr">
                        {goalProgress(g)}%
                      </span>
                    </div>
                    <Bar
                      value={goalProgress(g)}
                      label={t("common.progressOf", { title: g.title })}
                    />
                  </li>
                )}
              />
            }
          />

          <Section
            label={t("direction.threeYear")}
            hint={t("direction.threeYearHint")}
            value={form.threeYear}
            onChange={set("threeYear")}
          />

          <Section
            label={t("nav.skills")}
            hint={t("direction.skillsHint")}
            value={form.skills}
            onChange={set("skills")}
            side={
              <Now
                status={skillsStatus}
                items={skills}
                empty={t("direction.noSkills")}
                to="/skills"
                linkText={t("direction.openSkills")}
                render={(k) => {
                  const level = currentLevel(k);
                  return (
                    <li key={k.id} className="space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                        <span>{k.name}</span>
                        <Badge>
                          {level.mastered
                            ? t("skills.allComplete")
                            : t("skills.levelBadge", {
                                n: level.index + 1,
                                name: t(`level.${level.index + 1}`),
                              })}
                        </Badge>
                      </div>
                      <Bar
                        value={skillProgress(k)}
                        label={t("common.progressOf", { title: k.name })}
                      />
                    </li>
                  );
                }}
              />
            }
          />

          <Section
            label={t("nav.projects")}
            hint={t("direction.projectsHint")}
            value={form.projects}
            onChange={set("projects")}
            side={
              <Now
                status={projectsStatus}
                items={openProjects}
                empty={t("direction.noProjects")}
                to="/projects"
                linkText={t("direction.openProjects")}
                render={(p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>{p.title}</span>
                    <Badge>{t(`projectStatus.${p.status}`)}</Badge>
                  </li>
                )}
              />
            }
          />

          <Section
            label={t("nav.habits")}
            hint={t("direction.habitsHint")}
            value={form.habits}
            onChange={set("habits")}
            side={
              <Now
                status={habitsStatus}
                items={habits}
                empty={t("direction.noHabits")}
                to="/habits"
                linkText={t("direction.openHabits")}
                render={(h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>{h.name}</span>
                    <span className="text-muted">
                      {t("direction.streak", {
                        n: t("common.daysShort", {
                          n: streaks(h.logs).current,
                        }),
                      })}
                    </span>
                  </li>
                )}
              />
            }
          />

          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              disabled={saving}
              className={`${btnCls} disabled:opacity-60`}
            >
              {saving ? t("common.saving") : t("direction.save")}
            </button>
            {saved && (
              <p role="status" className="text-sm text-accent">
                {t("direction.saved")}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
