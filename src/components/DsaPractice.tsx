import { useEffect, useState, type CSSProperties } from "react";
import { apiRequest } from "../api";
import { Button, Icon, PageHeader } from "./ui";

interface DsaProblem {
  id: number;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  starterCode: string;
  solved?: boolean;
}

export default function DsaPractice() {
  const [problems, setProblems] = useState<DsaProblem[]>([]);
  const [filter, setFilter] = useState("All");
  const [selectedProblem, setSelectedProblem] = useState<DsaProblem | null>(null);
  const [userCode, setUserCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    apiRequest<DsaProblem[]>("/api/dsa/problems")
      .then((data) => {
        setProblems(data);
      })
      .catch(() => {});
  }, []);

  const visible = filter === "All"
    ? problems
    : problems.filter((p) => p.difficulty.toLowerCase() === filter.toLowerCase());

  function openProblem(problem: DsaProblem) {
    setSelectedProblem(problem);
    setUserCode(problem.starterCode || "");
    setSubmitResult(null);
  }

  async function submitSolution() {
    if (!selectedProblem) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await apiRequest<{ passed: boolean; message?: string }>("/api/dsa/attempts", {
        method: "POST",
        body: JSON.stringify({
          problemId: selectedProblem.id,
          code: userCode,
          status: "ACCEPTED",
        }),
      });
      setSubmitResult(res.message || "Solution submitted successfully! Status: ACCEPTED");
      setProblems((prev) =>
        prev.map((p) => (p.id === selectedProblem.id ? { ...p, solved: true } : p))
      );
      setSolvedCount((c) => c + 1);
    } catch (err: any) {
      setSubmitResult(err.message || "Failed to submit attempt");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content">
      <PageHeader
        eyebrow="Build your problem-solving muscle"
        title="DSA practice"
        copy="One thoughtful problem a day is enough to make real progress."
      />

      <div className="dsa-summary">
        <span><Icon name="flame" /><b>{problems.length} problems available</b></span>
        <span><Icon name="check" /><b>{solvedCount} solved in session</b></span>
      </div>

      <div className="filter-row">
        {["All", "Easy", "Medium", "Hard"].map((item) => (
          <button
            className={filter === item ? "selected" : ""}
            onClick={() => setFilter(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      {selectedProblem ? (
        <section className="lesson-mode-panel" style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <p className="eyebrow">{selectedProblem.difficulty} Problem #{selectedProblem.id}</p>
              <h2>{selectedProblem.title}</h2>
            </div>
            <Button variant="secondary" onClick={() => setSelectedProblem(null)}>
              ← Back to list
            </Button>
          </div>

          <p className="lesson-intro" style={{ whiteSpace: "pre-wrap", marginBottom: "20px" }}>
            {selectedProblem.description}
          </p>

          <div className="code-heading" style={{ marginTop: "16px" }}>
            <h2>Your Java Solution</h2>
            <span>Java 21</span>
          </div>

          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: "220px",
              fontFamily: "monospace",
              fontSize: "14px",
              padding: "14px",
              borderRadius: "8px",
              background: "var(--color-surface, #1e1e1e)",
              color: "var(--color-text, #fff)",
              border: "1px solid var(--color-border, #333)",
              marginBottom: "16px",
            }}
          />

          {submitResult && (
            <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", marginBottom: "16px" }}>
              {submitResult}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <Button onClick={submitSolution} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Solution"} <Icon name="arrow" size={17} />
            </Button>
            <Button variant="secondary" onClick={() => setUserCode(selectedProblem.starterCode)}>
              Reset to Starter Code
            </Button>
          </div>
        </section>
      ) : (
        <section className="problem-list">
          {visible.length === 0 ? (
            <p className="muted" style={{ padding: "20px 0" }}>Loading problems...</p>
          ) : (
            visible.map((problem, index) => (
              <button
                className="problem-row stagger-item"
                style={{ "--item-index": index } as CSSProperties}
                key={problem.id}
                onClick={() => openProblem(problem)}
              >
                <span className={`status-circle ${problem.solved ? "solved" : ""}`}>
                  {problem.solved && <Icon name="check" size={15} />}
                </span>
                <span>
                  <strong>{problem.title}</strong>
                  <small>Algorithms & Data Structures</small>
                </span>
                <em className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </em>
                <Icon name="chevron" size={18} />
              </button>
            ))
          )}
        </section>
      )}
    </div>
  );
}
