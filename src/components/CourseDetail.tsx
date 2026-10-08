import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { flatLessons } from "./courseContent";
import CourseSidebar, { type SidebarLessonItem } from "./CourseSidebar";
import type { Navigate } from "./types";
import { Button, Icon } from "./ui";

type LessonMode = "Text" | "Video" | "Live coding" | "Quiz" | "Ask AI";

interface BackendVideo {
  id: number;
  title: string;
  youtubeUrl: string;
  durationSeconds: number;
}

interface QuizQuestion {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string;
}

const playlistId = "PLZPZq0r_RZOOzY_vR4zJM32SqsSInGMwe";

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function CourseDetail({ navigate }: { navigate: Navigate }) {
  const [courseId, setCourseId] = useState<number>(1);
  const [courseTitle, setCourseTitle] = useState("C Programming");
  const [backendVideos, setBackendVideos] = useState<BackendVideo[]>([]);
  const [watchedVideoIds, setWatchedVideoIds] = useState<Set<number>>(new Set());
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [completedThrough, setCompletedThrough] = useState(0);
  const [mode, setMode] = useState<LessonMode>("Text");

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Gemini Ask State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load enrolled course and its videos
  useEffect(() => {
    apiRequest<{ id: number; title: string }[]>("/api/courses/enrolled")
      .then(async (enrolledList) => {
        let activeId = 1;
        let title = "Transition to BTech CS";
        if (enrolledList && enrolledList.length > 0) {
          activeId = enrolledList[0].id;
          title = enrolledList[0].title;
        } else {
          const all = await apiRequest<{ id: number; title: string }[]>("/api/courses");
          if (all && all.length > 0) {
            activeId = all[0].id;
            title = all[0].title;
          }
        }
        setCourseId(activeId);
        setCourseTitle(title);

        // Fetch videos for this course
        try {
          const vids = await apiRequest<BackendVideo[]>(`/api/courses/${activeId}/videos`);
          setBackendVideos(vids || []);
        } catch {}

        // Fetch progress
        try {
          const prog = await apiRequest<{ watchedVideoIds: number[]; progressPercentage: number }>(`/api/courses/${activeId}/progress`);
          if (prog) {
            setWatchedVideoIds(new Set(prog.watchedVideoIds));
            setProgressPercent(prog.progressPercentage);
          }
        } catch {}
      })
      .catch(() => {});
  }, []);

  // Map videos or fallback flatLessons
  const dynamicLessons: SidebarLessonItem[] = backendVideos.length > 0
    ? backendVideos.map((v, i) => ({
        id: `video-${v.id}`,
        title: v.title,
        module: `Video Lesson ${i + 1}`,
        videoId: v.id,
      }))
    : flatLessons.map((l) => ({
        id: l.id,
        title: l.title,
        module: l.module,
      }));

  const activeVideo = backendVideos[selectedIndex] || null;
  const selectedLesson = flatLessons[selectedIndex % flatLessons.length];
  const currentTitle = activeVideo ? activeVideo.title : selectedLesson.title;
  const currentModule = activeVideo ? `Module 1 · Video ${selectedIndex + 1}` : selectedLesson.module;

  // Mark video as watched in backend
  async function markCurrentVideoWatched() {
    if (!activeVideo) return;
    try {
      const prog = await apiRequest<{ watchedVideoIds: number[]; progressPercentage: number }>(
        `/api/courses/${courseId}/videos/${activeVideo.id}/progress`,
        { method: "POST" }
      );
      setWatchedVideoIds(new Set(prog.watchedVideoIds));
      setProgressPercent(prog.progressPercentage);
    } catch {}
  }

  // Load Quiz when switching to Quiz mode
  useEffect(() => {
    if (mode === "Quiz" && activeVideo) {
      setQuizLoading(true);
      setQuizError(null);
      setQuizScore(null);
      setQuizAnswers({});

      apiRequest<QuizQuestion[]>(`/api/videos/${activeVideo.id}/quiz`)
        .then((questions) => {
          setQuizQuestions(questions);
          setQuizLoading(false);
        })
        .catch((err) => {
          setQuizError(err.message || "Failed to generate/fetch quiz");
          setQuizLoading(false);
        });
    }
  }, [mode, activeVideo?.id]);

  function submitQuiz() {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] && q.correctOption && quizAnswers[q.id] === q.correctOption.toUpperCase()) {
        score += 1;
      }
    });
    setQuizScore(score);
    markCurrentVideoWatched();
  }

  async function askGemini(e: React.FormEvent) {
    e.preventDefault();
    if (!aiQuestion.trim() || !activeVideo) return;
    setAiLoading(true);
    setAiError(null);
    setAiAnswer(null);

    try {
      const res = await apiRequest<{ answer: string }>("/api/gemini/ask", {
        method: "POST",
        body: JSON.stringify({ videoId: activeVideo.id, question: aiQuestion }),
      });
      setAiAnswer(res.answer);
    } catch (err: any) {
      setAiError(err.message || "Failed to ask AI");
    } finally {
      setAiLoading(false);
    }
  }

  function nextLesson() {
    if (selectedIndex >= dynamicLessons.length - 1) return;
    setCompletedThrough((current) => Math.max(current, selectedIndex));
    setSelectedIndex((current) => current + 1);
    setAiAnswer(null);
    setQuizScore(null);
  }

  const ytId = activeVideo ? extractYouTubeId(activeVideo.youtubeUrl) : null;
  const isWatched = activeVideo ? watchedVideoIds.has(activeVideo.id) : selectedIndex <= completedThrough;

  return (
    <div className="course-shell">
      <CourseSidebar
        navigate={navigate}
        selectedIndex={selectedIndex}
        completedThrough={completedThrough}
        onSelect={(idx) => {
          setSelectedIndex(idx);
          setAiAnswer(null);
          setQuizScore(null);
        }}
        lessons={dynamicLessons}
        courseTitle={courseTitle}
        progressPercentage={progressPercent}
      />
      <main className="lesson-main">
        <div className="lesson-content">
          <div className="lesson-progress">
            <span>Lesson {selectedIndex + 1} of {dynamicLessons.length}</span>
            <i><b style={{ width: `${progressPercent}%` }} /></i>
            <span>{progressPercent}% complete</span>
          </div>

          <div className="lesson-mode-tabs" role="tablist" aria-label="Lesson content mode">
            {(["Text", "Video", "Live coding", "Quiz", "Ask AI"] as LessonMode[]).map((item) => (
              <button
                role="tab"
                aria-selected={mode === item}
                className={mode === item ? "selected" : ""}
                onClick={() => setMode(item)}
                key={item}
              >
                {item === "Text" && <Icon name="book" size={16} />}
                {item === "Video" && <Icon name="layers" size={16} />}
                {item === "Live coding" && <Icon name="code" size={16} />}
                {item === "Quiz" && <Icon name="check" size={16} />}
                {item === "Ask AI" && <Icon name="spark" size={16} />}
                {item}
              </button>
            ))}
          </div>

          <p className="eyebrow">{currentModule}</p>
          <h1>{currentTitle}</h1>

          {mode === "Text" && (
            <div className="lesson-mode-panel">
              <p className="lesson-intro">{selectedLesson.explanation}</p>
              <section className="concept-section">
                <h2>Important concepts</h2>
                <ul>
                  {selectedLesson.concepts.map((concept) => (
                    <li key={concept}><Icon name="check" size={15} /> {concept}</li>
                  ))}
                </ul>
              </section>

              {selectedLesson.code && (
                <section className="lesson-copy">
                  <div className="code-heading"><h2>Code example</h2><span>C / Java</span></div>
                  <pre className="code-block"><code>{selectedLesson.code}</code></pre>
                </section>
              )}

              <section className="lesson-note">
                <span><Icon name="spark" size={19} /></span>
                <div><strong>Keep in mind</strong><p>Read the code from top to bottom and identify variables and logic before running it.</p></div>
              </section>
            </div>
          )}

          {mode === "Video" && (
            <section className="video-lesson lesson-mode-panel">
              <div>
                <h2>{activeVideo ? activeVideo.title : "Watch this lesson"}</h2>
                <p>Follow the lesson carefully, then practice in the Live coding tab or test your knowledge in the Quiz tab.</p>
              </div>
              <div className="video-frame">
                <iframe
                  src={
                    ytId
                      ? `https://www.youtube.com/embed/${ytId}`
                      : `https://www.youtube.com/embed/videoseries?list=${playlistId}`
                  }
                  title={`Lesson Video — ${currentTitle}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <Button
                  variant={isWatched ? "secondary" : "primary"}
                  onClick={markCurrentVideoWatched}
                >
                  {isWatched ? "✓ Marked as Watched" : "Mark as Watched"}
                </Button>
                {activeVideo?.youtubeUrl && (
                  <a href={activeVideo.youtubeUrl} target="_blank" rel="noreferrer">
                    Open on YouTube <Icon name="arrow" size={15} />
                  </a>
                )}
              </div>
            </section>
          )}

          {mode === "Live coding" && (
            <section className="live-coding lesson-mode-panel">
              <div className="coding-heading">
                <div><h2>Interactive Playground</h2><p>Type, compile, and run code while following the lesson.</p></div>
              </div>
              <div className="compiler-frame">
                <iframe
                  src="https://onecompiler.com/embed/c?hideLanguageSelection=true&hideNew=true&theme=dark"
                  title={`Live coding editor — ${currentTitle}`}
                  allow="clipboard-read; clipboard-write"
                />
              </div>
              <p className="runner-note">The editor runs through OneCompiler in an isolated environment. Do not enter personal information.</p>
            </section>
          )}

          {mode === "Quiz" && (
            <section className="lesson-mode-panel">
              <div style={{ marginBottom: "20px" }}>
                <h2>Lesson Quiz</h2>
                <p className="muted">5 multiple choice questions generated and verified by AI for this video lesson.</p>
              </div>

              {quizLoading ? (
                <p>Generating and loading quiz questions...</p>
              ) : quizError ? (
                <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                  {quizError}
                </div>
              ) : quizQuestions.length === 0 ? (
                <p className="muted">No questions available for this video yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {quizQuestions.map((q, qIndex) => (
                    <div key={q.id} style={{ border: "1px solid var(--color-border, #333)", padding: "18px", borderRadius: "10px" }}>
                      <p style={{ fontWeight: 600, marginBottom: "14px" }}>
                        {qIndex + 1}. {q.questionText}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {(["A", "B", "C", "D"] as const).map((optKey) => {
                          const optText = (q as any)[`option${optKey}`];
                          if (!optText) return null;
                          const selected = quizAnswers[q.id] === optKey;
                          return (
                            <button
                              key={optKey}
                              type="button"
                              onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optKey })}
                              style={{
                                textAlign: "left",
                                padding: "10px 14px",
                                borderRadius: "6px",
                                border: selected ? "2px solid #3b82f6" : "1px solid var(--color-border, #444)",
                                background: selected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                color: "inherit",
                                cursor: "pointer",
                              }}
                            >
                              <strong>{optKey}.</strong> {optText}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {quizScore !== null ? (
                    <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                      <h3>Quiz Completed!</h3>
                      <p>Your score: {quizScore} / {quizQuestions.length}</p>
                    </div>
                  ) : (
                    <Button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < quizQuestions.length}>
                      Submit Quiz
                    </Button>
                  )}
                </div>
              )}
            </section>
          )}

          {mode === "Ask AI" && (
            <section className="lesson-mode-panel">
              <div style={{ marginBottom: "20px" }}>
                <h2>Ask Gemini about this video</h2>
                <p className="muted">Ask any conceptual questions related to this video. Gemini analyzes the video directly.</p>
              </div>

              <form onSubmit={askGemini} style={{ marginBottom: "20px" }}>
                <textarea
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask a question about this video (e.g., 'Explain the concept at 02:30' or 'Why is this used?')..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "var(--color-surface, #1e1e1e)",
                    color: "inherit",
                    border: "1px solid var(--color-border, #333)",
                    marginBottom: "12px",
                  }}
                  required
                />
                <Button type="submit" disabled={aiLoading || !aiQuestion.trim()}>
                  {aiLoading ? "Gemini is analyzing..." : "Ask Gemini"} <Icon name="spark" size={17} />
                </Button>
              </form>

              {aiError && (
                <div style={{ padding: "14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", marginBottom: "16px" }}>
                  {aiError}
                </div>
              )}

              {aiAnswer && (
                <div style={{ padding: "18px", borderRadius: "8px", background: "var(--color-surface, #1e1e1e)", border: "1px solid var(--color-border, #333)" }}>
                  <p className="eyebrow"><Icon name="spark" size={15} /> AI Answer</p>
                  <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, marginTop: "8px" }}>{aiAnswer}</p>
                </div>
              )}
            </section>
          )}

          <div className="lesson-actions">
            <Button variant="secondary" onClick={() => setSelectedIndex((current) => Math.max(0, current - 1))} disabled={selectedIndex === 0}>Previous</Button>
            <Button onClick={nextLesson} disabled={selectedIndex === dynamicLessons.length - 1}>Next lesson <Icon name="arrow" size={18} /></Button>
          </div>
        </div>
      </main>
    </div>
  );
}
