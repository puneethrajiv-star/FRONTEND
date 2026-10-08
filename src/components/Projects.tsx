import { Icon, PageHeader } from "./ui";

export default function Projects({ unlocked }: { unlocked: boolean }) {
  return (
    <div className="content">
      <PageHeader eyebrow="Learn by making" title="Projects" copy="A place for your ideas to become things you can share." />
      <section className={`project-vault ${unlocked ? "unlocked" : ""}`}>
        <div className="vault-glow"><Icon name={unlocked ? "spark" : "lock"} size={34} /></div>
        <p className="eyebrow">{unlocked ? "Ready when you are" : "Just beyond the foundations"}</p>
        <h2>{unlocked ? "Your project studio is open" : "Something worth building is waiting"}</h2>
        <p>{unlocked ? "Choose a guided project and turn what you know into something real." : "Complete one programming language course to unlock guided projects made for your new skills."}</p>
        <div className="project-preview">
          <span><Icon name="code" /><small>Starter build</small></span>
          <span><Icon name="layers" /><small>Portfolio piece</small></span>
          <span><Icon name="spark" /><small>Guided feedback</small></span>
        </div>
      </section>
    </div>
  );
}
