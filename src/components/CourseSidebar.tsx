import type { CSSProperties } from "react";
import { courseModules, flatLessons } from "./courseContent";
import type { Navigate } from "./types";
import { Icon } from "./ui";

export interface SidebarLessonItem {
  id: string;
  title: string;
  module: string;
  videoId?: number;
}

export default function CourseSidebar({
  navigate,
  selectedIndex,
  completedThrough,
  onSelect,
  lessons,
  courseTitle = "C Programming",
  progressPercentage,
}: {
  navigate: Navigate;
  selectedIndex: number;
  completedThrough: number;
  onSelect: (index: number) => void;
  lessons?: SidebarLessonItem[];
  courseTitle?: string;
  progressPercentage?: number;
}) {
  const activeLessons = lessons && lessons.length > 0 ? lessons : flatLessons;
  const progress = progressPercentage !== undefined
    ? progressPercentage
    : Math.round(((completedThrough + 1) / activeLessons.length) * 100);

  return (
    <aside className="lesson-sidebar">
      <button className="back-link" onClick={() => navigate("home")}><Icon name="arrow" size={17} /> Back to EduBridge</button>
      <div className="course-side-heading">
        <span className="course-symbol">{courseTitle.slice(0, 1)}</span>
        <div><small>Course</small><strong>{courseTitle}</strong></div>
      </div>
      <div className="course-progress">
        <span><b>Overall progress</b><small>{progress}%</small></span>
        <i><b style={{ width: `${progress}%` }} /></i>
      </div>
      <nav className="syllabus-list" aria-label="Course syllabus">
        {lessons && lessons.length > 0 ? (
          <section className="syllabus-module">
            <p>Course Videos & Lessons</p>
            <div className="lesson-list">
              {lessons.map((item, index) => {
                const current = index === selectedIndex;
                const complete = index <= completedThrough && !current;
                const state = current ? "current" : complete ? "complete" : "available";
                return (
                  <button
                    className={`${state} stagger-item`}
                    style={{ "--item-index": index } as CSSProperties}
                    key={item.id}
                    onClick={() => onSelect(index)}
                  >
                    <span className="lesson-state">
                      {complete ? <Icon name="check" size={14} /> : index + 1}
                    </span>
                    <span><strong>{item.title}</strong></span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          courseModules.map((module, moduleIndex) => {
            let lessonIndex = -1;
            return (
              <section className="syllabus-module" key={module.title}>
                <p>Module {moduleIndex + 1} <span>—</span> {module.title}</p>
                <div className="lesson-list">
                  {module.lessons.map((item, moduleLessonIndex) => {
                    lessonIndex += 1;
                    const index = lessonIndex;
                    const current = index === selectedIndex;
                    const complete = index <= completedThrough && !current;
                    const locked = index > Math.max(completedThrough + 1, selectedIndex);
                    const state = current ? "current" : complete ? "complete" : locked ? "locked" : "available";
                    return (
                      <button
                        className={`${state} stagger-item`}
                        style={{ "--item-index": moduleLessonIndex } as CSSProperties}
                        key={item.id}
                        disabled={locked}
                        onClick={() => onSelect(index)}
                      >
                        <span className="lesson-state">
                          {complete ? <Icon name="check" size={14} /> : locked ? <Icon name="lock" size={13} /> : index + 1}
                        </span>
                        <span><strong>{item.title}</strong></span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </nav>
    </aside>
  );
}
