import type { Navigate } from "./types";
import { Brand, Button, Icon } from "./ui";

export default function Landing({ navigate }: { navigate: Navigate }) {
  return (
    <main className="landing">
      <header className="landing-nav"><Brand /><div><Button variant="quiet" onClick={() => navigate("login")}>Log in</Button><Button onClick={() => navigate("signup")}>Sign up</Button></div></header>
      <section className="hero">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <span className="hero-icon"><Icon name="bridge" size={29} /></span>
        <p className="eyebrow">From Intermediate to engineering</p>
        <h1>Bridge the gap to<br /><span>computer science.</span></h1>
        <p className="hero-copy">EduBridge helps you build the right foundations for BTech CSE — at a pace that feels clear, calm, and completely yours.</p>
        <div className="hero-actions"><Button onClick={() => navigate("signup")}>Start learning <Icon name="arrow" size={18} /></Button><Button variant="secondary" onClick={() => navigate("login")}>I have an account</Button></div>
        <div className="trust-note"><span><Icon name="check" size={14} /></span> No prior coding experience needed</div>
      </section>
      <footer className="landing-footer"><span>Built for the beginning of your journey.</span><span>Learn steadily. Build confidently.</span></footer>
    </main>
  );
}
