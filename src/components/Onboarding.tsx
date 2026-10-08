import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { Brand, Icon } from "./ui";

interface BackendQuestion {
  id: string;
  question: string;
  options: string[];
}

export default function Onboarding({ onFinish }: { onFinish: (experienced: boolean) => void }) {
  const [questions, setQuestions] = useState<BackendQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<BackendQuestion[]>("/api/onboarding/questions")
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load onboarding questions");
        setLoading(false);
      });
  }, []);

  async function choose(questionId: string, option: string) {
    const nextAnswers = { ...answers, [questionId]: option };
    setAnswers(nextAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSubmitting(true);
      try {
        await apiRequest("/api/onboarding/submit", {
          method: "POST",
          body: JSON.stringify({ answers: nextAnswers }),
        });
        const hasExp = nextAnswers["codingExperience"] && !nextAnswers["codingExperience"].includes("Beginner");
        onFinish(Boolean(hasExp));
      } catch (err: any) {
        setError(err.message || "Failed to submit onboarding");
        setSubmitting(false);
      }
    }
  }

  if (loading) {
    return (
      <main className="onboarding-page">
        <Brand />
        <section className="question-wrap">
          <div className="question-card" style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading your onboarding questionnaire...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !questions.length) {
    return (
      <main className="onboarding-page">
        <Brand />
        <section className="question-wrap">
          <div className="question-card">
            <p className="eyebrow">Something went wrong</p>
            <h1>Unable to load questions</h1>
            <p className="question-note">{error || "No questions found."}</p>
            <button className="button button-primary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </section>
      </main>
    );
  }

  const current = questions[currentIndex];
  const total = questions.length;

  return (
    <main className="onboarding-page">
      <Brand />
      <section className="question-wrap">
        <div className="progress-meta">
          <span>Getting to know you</span>
          <span>Question {currentIndex + 1} of {total}</span>
        </div>
        <div className="progress-track"><span style={{ width: `${((currentIndex + 1) / total) * 100}%` }} /></div>
        <div className="question-card">
          <p className="eyebrow">A quick check-in</p>
          <h1>{current.question}</h1>
          <p className="question-note">Choose the option that fits best. This personalizes your recommended course.</p>
          <div className="option-list">
            {current.options.map((option) => (
              <button
                key={option}
                disabled={submitting}
                onClick={() => choose(current.id, option)}
              >
                <span>{option}</span><Icon name="chevron" size={18} />
              </button>
            ))}
          </div>
        </div>
        <p className="reassurance"><Icon name="spark" size={16} /> Your answers only personalize your learning plan.</p>
      </section>
    </main>
  );
}
