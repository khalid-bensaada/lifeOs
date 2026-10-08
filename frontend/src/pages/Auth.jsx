import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useT } from "../i18n/useT";
import { Card, fieldCls, btnCls } from "../components/ui";

export default function Auth({ mode }) {
  const { t } = useT();
  const { user, login, register } = useAuth();
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">LifeOS</h1>
          <p className="text-sm text-muted">
            {isRegister ? t("auth.createSub") : t("auth.welcomeBack")}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {isRegister && (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t("auth.name")}</span>
              <input
                value={form.name}
                onChange={set("name")}
                autoComplete="name"
                required
                className={`${fieldCls} w-full`}
              />
            </label>
          )}
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t("auth.email")}</span>
            <input
              type="email"
              dir="ltr"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
              className={`${fieldCls} w-full`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t("auth.password")}</span>
            <input
              type="password"
              dir="ltr"
              value={form.password}
              onChange={set("password")}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              className={`${fieldCls} w-full`}
            />
            {isRegister && (
              <span className="text-xs text-muted">
                {t("auth.passwordHint")}
              </span>
            )}
          </label>

          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}

          <button
            disabled={busy}
            className={`${btnCls} w-full justify-center disabled:opacity-60`}
          >
            {busy
              ? t("common.pleaseWait")
              : isRegister
                ? t("auth.createAccount")
                : t("auth.login")}
          </button>
        </form>

        <p className="text-sm text-muted">
          {isRegister ? t("auth.haveAccount") : t("auth.newHere")}{" "}
          <Link
            to={isRegister ? "/login" : "/register"}
            className="text-accent hover:underline"
          >
            {isRegister ? t("auth.login") : t("auth.createLink")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
