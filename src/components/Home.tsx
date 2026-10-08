import { useEffect, useState, type CSSProperties } from "react";
import { apiRequest, getCurrentUser } from "../api";
import type { Navigate } from "./types";
import { Button, Icon, PageHeader } from "./ui";

interface CourseItem {
  id: number;
  title: string;
  description: string;
  progress?: number;
}

export default function Home({ navigate }: { navigate: Navigate }) {
  const user = getCurrentUser();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseItem[]>([]);
  const [personalBest, setPersonalBest] = useState<{ wpm: number; accuracy: number } | null>(null);

  useEffect(() => {
    // 1. Fetch enrolled courses
    apiRequest<CourseItem[]>("/api/courses/enrolled")
      .then(async (courses) => {
        if (!courses || courses.length === 0) {
          // If not enrolled in any, fetch all courses to give them a starting point
          const all = await apiRequest<CourseItem[]>("/api/courses");
          setEnrolledCourses(all.slice(0, 1));
          return;
        }
        // Fetch progress for each enrolled course
        const withProgress = await Promise.all(
          courses.map(async (c) => {
            try {
              const prog = await apiRequest<{ progressPercentage: number }>(`/api/courses/${c.id}/progress`);
              return { ...c, progress: prog.progressPercentage };
            } catch {
              return { ...c, progress: 0 };
            }
          })
        );
        setEnrolledCourses(withProgress);
      })
      .catch(() => {});

    // 2. Fetch typing personal best
    apiRequest<{ wpm: number; accuracy: number }>("/api/typing/personal-best")
      .then((pb) => {
        if (pb && pb.wpm) setPersonalBest(pb);
      })
      .catch(() => {});
  }, []);

  const studentName = user?.name ? user.name.split(" ")[0] : "Student";

  return (
    <div className="content home-content">
      <PageHeader
        eyebrow="Your learning space"
        title={`Good day, ${studentName}`}
        copy="A few small steps today will take you a long way."
      />
      <div className="home-grid">
        <section className="streak-card">
          <div className="streak-icon"><Icon name="flame" size={24} /></div>
          <p>Typing best</p><strong>{personalBest ? `${personalBest.wpm} WPM` : "No attempts"}</strong>
          <span>{personalBest ? `${personalBest.accuracy}% accuracy` : "Start practicing today"}</span>
          <div className="week-row">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <i className={index < 4 ? "done" : ""} key={`${day}-${index}`}>
                {index < 4 ? <Icon name="check" size={13} /> : day}
              </i>
            ))}
          </div>
          <Button variant="secondary" onClick={() => navigate("dsa")}>Practice DSA</Button>
        </section>
        <div className="home-primary">
          <button className="typing-card" onClick={() => navigate("typing")}>
            <span className="feature-icon"><Icon name="keyboard" size={26} /></span>
            <span>
              <small>Daily practice</small>
              <strong>Warm up your typing</strong>
              <em>10 minutes · Boost your typing speed & accuracy</em>
            </span>
            <Icon name="arrow" />
          </button>
          <section className="joined-section">
            <div className="section-heading">
              <div><p className="eyebrow">Your courses</p><h2>Continue learning</h2></div>
              <button onClick={() => navigate("browse")}>Browse all</button>
            </div>
            {enrolledCourses.length === 0 ? (
              <p className="muted" style={{ padding: "16px 0" }}>No courses enrolled yet. Browse courses to begin!</p>
            ) : (
              enrolledCourses.map((course, index) => {
                const prog = course.progress ?? 0;
                return (
                  <button
                    className="course-row stagger-item"
                    style={{ "--item-index": index } as CSSProperties}
                    key={course.id || course.title}
                    onClick={() => navigate("course")}
                  >
                    <span className="course-symbol">{course.title.slice(0, 1)}</span>
                    <span className="course-info">
                      <strong>{course.title}</strong>
                      <small>Core CS · 4 modules</small>
                      <i><b style={{ width: `${prog}%` }} /></i>
                    </span>
                    <span className="progress-number">{prog}%</span>
                    <Icon name="chevron" size={18} />
                  </button>
                );
              })
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
