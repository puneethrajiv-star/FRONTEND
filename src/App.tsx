import { useState } from "react";
import { flushSync } from "react-dom";
import BrowseCourses from "./components/BrowseCourses";
import CourseDetail from "./components/CourseDetail";
import DsaPractice from "./components/DsaPractice";
import Home from "./components/Home";
import Landing from "./components/Landing";
import LogIn from "./components/LogIn";
import Onboarding from "./components/Onboarding";
import PageTransition from "./components/PageTransition";
import Projects from "./components/Projects";
import Sidebar from "./components/Sidebar";
import SignUp from "./components/SignUp";
import ThemeControls from "./components/ThemeControls";
import TypingPractice from "./components/TypingPractice";
import type { Screen } from "./components/types";

import { getToken } from "./api";

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem("edubridge_screen") as Screen | null;
    const token = getToken();
    if (token) {
      if (saved && saved !== "landing" && saved !== "login" && saved !== "signup") {
        return saved;
      }
      return "home";
    }
    return "landing";
  });

  const [experienced, setExperienced] = useState(false);
  const screenOrder: Screen[] = ["landing", "signup", "login", "onboarding", "home", "typing", "browse", "dsa", "projects", "course"];

  function navigate(next: Screen) {
    if (next === screen) return;
    localStorage.setItem("edubridge_screen", next);
    const direction = screenOrder.indexOf(next) >= screenOrder.indexOf(screen) ? "forward" : "back";
    document.documentElement.dataset.motionDirection = direction;
    const update = () => flushSync(() => setScreen(next));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };

    if (!reducedMotion && transitionDocument.startViewTransition) transitionDocument.startViewTransition(update);
    else update();
  }

  let content;
  let mainNavigation = false;

  if (screen === "landing") content = <Landing navigate={navigate} />;
  else if (screen === "signup") content = <SignUp navigate={navigate} />;
  else if (screen === "login") content = <LogIn navigate={navigate} />;
  else if (screen === "onboarding") {
    content = (
      <Onboarding
        onFinish={(hasExperience) => {
          setExperienced(hasExperience);
          navigate("home");
        }}
      />
    );
  }
  else if (screen === "course") content = <CourseDetail navigate={navigate} />;
  else {
    mainNavigation = true;
    content = (
      <Sidebar screen={screen} navigate={navigate}>
        <PageTransition transitionKey={screen}>
        {screen === "home" && <Home navigate={navigate} />}
        {screen === "typing" && <TypingPractice />}
        {screen === "browse" && <BrowseCourses navigate={navigate} />}
        {screen === "dsa" && <DsaPractice />}
        {screen === "projects" && <Projects unlocked={experienced} />}
        </PageTransition>
      </Sidebar>
    );
  }

  return (
    <>
      <ThemeControls />
      {mainNavigation ? content : <PageTransition transitionKey={screen}>{content}</PageTransition>}
    </>
  );
}
