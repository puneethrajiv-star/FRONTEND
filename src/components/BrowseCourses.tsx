import { useEffect, useState, type CSSProperties } from "react";
import { apiRequest } from "../api";
import type { Navigate } from "./types";
import { Button, Icon, PageHeader } from "./ui";

interface CourseItem {
  id: number;
  title: string;
  description: string;
  isEnrolled?: boolean;
}

export default function BrowseCourses({ navigate }: { navigate: Navigate }) {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<CourseItem[]>("/api/courses").catch(() => []),
      apiRequest<CourseItem[]>("/api/courses/enrolled").catch(() => []),
    ]).then(([allCourses, enrolled]) => {
      const enrolledSet = new Set((enrolled || []).map((e) => e.id));
      const mapped = allCourses.map((c) => ({
        ...c,
        isEnrolled: enrolledSet.has(c.id),
      }));
      setCourses(mapped);
      setLoading(false);
    });
  }, []);

  async function handleCourseAction(course: CourseItem) {
    if (!course.isEnrolled) {
      try {
        await apiRequest(`/api/courses/${course.id}/enroll`, { method: "POST" });
      } catch {}
    }
    navigate("course");
  }

  return (
    <div className="content">
      <PageHeader
        eyebrow="Course library"
        title="Find your next course"
        copy="Begin with the foundations, then follow your curiosity."
      />
      <div className="filter-row">
        <button className="selected">All courses</button>
        <button>Foundations</button>
      </div>

      {loading ? (
        <p className="muted" style={{ padding: "24px 0" }}>Loading available courses...</p>
      ) : (
        <div className="course-grid">
          {courses.map((course, index) => (
            <article
              className="course-card stagger-item"
              style={{ "--item-index": index } as CSSProperties}
              key={course.id || course.title}
            >
              <span className={`course-art art-${index % 3}`}>
                <b>{course.title.slice(0, 1)}</b>
              </span>
              <div className="course-card-body">
                <span className="course-category">Computer Science</span>
                <h2>{course.title}</h2>
                <p>{course.description || "Foundational concepts, practice, and video lessons."}</p>
                <Button
                  variant={course.isEnrolled ? "secondary" : "primary"}
                  onClick={() => handleCourseAction(course)}
                >
                  {course.isEnrolled ? "Continue course" : "Enroll & Start"} <Icon name="arrow" size={17} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
