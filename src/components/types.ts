export type Screen =
  | "landing"
  | "signup"
  | "login"
  | "onboarding"
  | "home"
  | "typing"
  | "browse"
  | "dsa"
  | "projects"
  | "course";

export type IconName =
  | "arrow"
  | "book"
  | "bridge"
  | "check"
  | "chevron"
  | "code"
  | "compass"
  | "flame"
  | "home"
  | "keyboard"
  | "layers"
  | "lock"
  | "menu"
  | "spark"
  | "user";

export type Navigate = (screen: Screen) => void;
