import type { ReactNode } from "react";
import type { IconName } from "./types";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 5.5v15" /></>,
    bridge: <><path d="M3 19h18" /><path d="M5 19v-4M19 19v-4" /><path d="M5 15c2-6 12-6 14 0" /><path d="M7 12V6M17 12V6" /><path d="M5 6h4M15 6h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    code: <><path d="m8 9-3 3 3 3" /><path d="m16 9 3 3-3 3" /><path d="m14 5-4 14" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
    flame: <path d="M13 3s1 3-1 5c-1.4 1.4-3 2.5-3 5a3 3 0 0 0 6 0c0-1-.2-1.8-.7-2.7 2.3 1.7 3.7 4.2 2.3 7A5.5 5.5 0 0 1 6 15c0-4 3.5-6 7-12Z" />,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
    keyboard: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 10h.01M11 10h.01M15 10h.01M19 10h.01M8 14h8" /></>,
    layers: <><path d="m12 3-9 5 9 5 9-5z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    spark: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4z" /><path d="m19 15 .6 1.9 1.9.6-1.9.6L19 20l-.6-1.9-1.9-.6 1.9-.6z" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`button button-${variant} ${className}`}>
      {children}
    </button>
  );
}

export function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </label>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-mark"><Icon name="bridge" size={19} /></span>
      {!compact && <strong>EduBridge</strong>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{copy}</p>
    </header>
  );
}
