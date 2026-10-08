import { useState } from "react";
import { apiRequest, setToken, setCurrentUser } from "../api";
import type { Navigate } from "./types";
import { Brand, Button, Field, Icon } from "./ui";

export default function AuthScreen({ mode, navigate }: { mode: "signup" | "login"; navigate: Navigate }) {
  const signup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (signup) {
        const res = await apiRequest<{ id: number; name: string; email: string; role: string; token: string }>("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        setToken(res.token);
        setCurrentUser({ id: res.id, name: res.name, email: res.email, role: res.role });
        navigate("onboarding");
      } else {
        const res = await apiRequest<{ id: number; name: string; email: string; role: string; token: string }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(res.token);
        setCurrentUser({ id: res.id, name: res.name, email: res.email, role: res.role });
        navigate("home");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <button className="brand-button" onClick={() => navigate("landing")} aria-label="Back to EduBridge home"><Brand /></button>
      <section className="auth-card">
        <p className="eyebrow">{signup ? "Start your journey" : "Welcome back"}</p>
        <h1>{signup ? "Create your account" : "Continue learning"}</h1>
        <p className="muted">{signup ? "A calmer way to prepare for computer science." : "Pick up right where you left off."}</p>
        
        {error && (
          <div style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {signup && (
            <Field
              label="Your name"
              placeholder="What should we call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Field
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="full-button">
            {loading ? "Processing..." : signup ? "Create account" : "Log in"} <Icon name="arrow" size={18} />
          </Button>
        </form>
        <p className="auth-switch">
          {signup ? "Already have an account?" : "New to EduBridge?"}{" "}
          <button onClick={() => { setError(null); navigate(signup ? "login" : "signup"); }}>
            {signup ? "Log in" : "Sign up"}
          </button>
        </p>
      </section>
    </main>
  );
}
