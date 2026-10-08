import { useLayoutEffect, useState } from "react";

type Theme = "light" | "dark";
type Accent = "green" | "blue" | "violet" | "coral" | "gold";

const accents: { name: Accent; label: string }[] = [
  { name: "green", label: "Forest green" },
  { name: "blue", label: "Calm blue" },
  { name: "violet", label: "Soft violet" },
  { name: "coral", label: "Warm coral" },
  { name: "gold", label: "Golden amber" },
];

function savedTheme(): Theme {
  const value = localStorage.getItem("edubridge-theme");
  return value === "dark" ? "dark" : "light";
}

function savedAccent(): Accent {
  const value = localStorage.getItem("edubridge-accent");
  return accents.some((accent) => accent.name === value) ? value as Accent : "green";
}

export default function ThemeControls() {
  const [theme, setTheme] = useState<Theme>(savedTheme);
  const [accent, setAccent] = useState<Accent>(savedAccent);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("edubridge-theme", theme);
  }, [theme]);

  useLayoutEffect(() => {
    document.documentElement.dataset.accent = accent;
    localStorage.setItem("edubridge-accent", accent);
  }, [accent]);

  const dark = theme === "dark";

  return (
    <div className="theme-controls" role="group" aria-label="Appearance settings">
      <button
        className={`theme-switch ${dark ? "is-dark" : ""}`}
        onClick={() => setTheme(dark ? "light" : "dark")}
        role="switch"
        aria-checked={dark}
        aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      >
        <span className="theme-switch-track"><i /></span>
        <span>{dark ? "Dark" : "Light"}</span>
      </button>
      <span className="control-divider" />
      <div className="accent-picker" role="group" aria-label="Accent color">
        {accents.map((item) => (
          <button
            key={item.name}
            className={`accent-swatch swatch-${item.name}`}
            onClick={() => setAccent(item.name)}
            aria-label={`Use ${item.label} accent`}
            aria-pressed={accent === item.name}
            title={item.label}
          />
        ))}
      </div>
    </div>
  );
}
