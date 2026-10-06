import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, fieldCls, btnCls } from "../components/ui";

export default function Auth({ mode }) {
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
            {isRegister
              ? "Create your account."
              : "Welcome back. Log in to continue."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {isRegister && (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Name</span>
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
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
              className={`${fieldCls} w-full`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              className={`${fieldCls} w-full`}
            />
            {isRegister && (
              <span className="text-xs text-muted">At least 8 characters.</span>
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
            {busy ? "Please wait..." : isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-muted">
          {isRegister ? "Already have an account? " : "New here? "}
          <Link
            to={isRegister ? "/login" : "/register"}
            className="text-accent hover:underline"
          >
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </Card>
    </div>
  );
}
