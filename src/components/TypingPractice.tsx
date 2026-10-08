import { useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../api";
import { Button, Icon } from "./ui";

type Difficulty = "Easy" | "Medium" | "Hard";
type ContentMode = "Code" | "Novel" | "Plain Text";

const fallbackCodePassages: Record<Difficulty, string> = {
  Easy: 'int age = 18;\nprintf("Age: %d", age);\nreturn 0;',
  Medium: 'int add(int a, int b) {\n  int total = a + b;\n  return total;\n}\n\nprintf("%d", add(8, 12));',
  Hard: 'typedef struct {\n  char name[40];\n  int semester;\n} Student;\n\nvoid update(Student *student) {\n  student->semester += 1;\n}',
};

const fallbackTextPassages: Record<Difficulty, string> = {
  Easy: "Small steps each day make difficult skills feel natural.",
  Medium: "Careful practice builds accuracy first, and steady speed follows with time.",
  Hard: "Clear communication helps a team examine assumptions, solve unfamiliar problems, and improve its work together.",
};

interface PerformanceItem {
  wpm: number;
  accuracy: number;
  time: string;
  when: string;
}

export default function TypingPractice() {
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [mode, setMode] = useState<ContentMode>("Code");
  const [typed, setTyped] = useState("");
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [backendPassage, setBackendPassage] = useState<string | null>(null);
  const [history, setHistory] = useState<PerformanceItem[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Map mode & difficulty to backend category & level
  useEffect(() => {
    let category = "CODE";
    let level = 1;

    if (mode === "Code") {
      category = "CODE";
      level = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 3 : 5;
    } else if (mode === "Novel") {
      category = "TEXT";
      level = difficulty === "Easy" ? 5 : difficulty === "Medium" ? 6 : 7;
    } else {
      category = "TEXT";
      level = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 3 : 4;
    }

    apiRequest<{ content: string }>(`/api/typing/passages/random?category=${category}&level=${level}`)
      .then((res) => {
        if (res && res.content) {
          setBackendPassage(res.content);
        } else {
          setBackendPassage(null);
        }
      })
      .catch(() => {
        setBackendPassage(null);
      });
  }, [mode, difficulty]);

  // Load personal best on mount
  useEffect(() => {
    apiRequest<{ wpm: number; accuracy: number; attemptedAt?: string }>("/api/typing/personal-best")
      .then((res) => {
        if (res && res.wpm) {
          setHistory([
            {
              wpm: Math.round(res.wpm),
              accuracy: Math.round(res.accuracy),
              time: "PB",
              when: "Personal Best",
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const passage =
    backendPassage ||
    (mode === "Code"
      ? fallbackCodePassages[difficulty]
      : fallbackTextPassages[difficulty]);

  const novelUnavailable = mode === "Novel" && !passage;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const correctCharacters = useMemo(
    () => typed.split("").filter((character, index) => character === passage[index]).length,
    [typed, passage],
  );
  const elapsed = Math.max(1, duration - remaining);
  const errors = Math.max(0, typed.length - correctCharacters);
  const accuracy = typed.length ? Math.round((correctCharacters / typed.length) * 100) : 100;
  const wpm = typed.length ? Math.round((correctCharacters / 5) / (elapsed / 60)) : 0;

  // Submit attempt to backend when test finishes
  useEffect(() => {
    if (finished && typed.length > 5) {
      apiRequest("/api/typing/attempts", {
        method: "POST",
        body: JSON.stringify({ wpm, accuracy }),
      })
        .then(() => {
          setHistory((prev) => [
            { wpm, accuracy, time: `${elapsed}s`, when: "Just now" },
            ...prev.slice(0, 4),
          ]);
        })
        .catch(() => {});
    }
  }, [finished]);

  function startTest() {
    if (!passage) return;
    setTyped("");
    setRemaining(duration);
    setFinished(false);
    setRunning(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function updateTyped(value: string) {
    if (!running) return;
    const next = value.slice(0, passage.length);
    setTyped(next);
    if (next.length === passage.length) {
      setRunning(false);
      setFinished(true);
    }
  }

  function resetTest() {
    setTyped("");
    setRemaining(duration);
    setRunning(false);
    setFinished(false);
  }

  function changeDifficulty(value: Difficulty) {
    if (running) return;
    setDifficulty(value);
    resetTest();
  }

  function changeMode(value: ContentMode) {
    if (running) return;
    setMode(value);
    resetTest();
  }

  return (
    <div className="content typing-page">
      <header className="typing-header">
        <div><p className="eyebrow">Developer skill</p><h1>Typing Practice</h1><p>Improve your typing speed and accuracy.</p></div>
        <div className="typing-stats" aria-label="Current typing statistics">
          <span><strong>{wpm}</strong><small>WPM</small></span>
          <span><strong>{accuracy}%</strong><small>Accuracy</small></span>
          <span><strong>{remaining}s</strong><small>Time</small></span>
        </div>
      </header>

      <section className="typing-workspace">
        <div className="typing-controls">
          <div><small>Time</small>{[30, 60, 120].map((time) => <button className={duration === time ? "selected" : ""} disabled={running} onClick={() => { setDuration(time); setRemaining(time); }} key={time}>{time} sec</button>)}</div>
          <div><small>Difficulty</small>{(["Easy", "Medium", "Hard"] as Difficulty[]).map((item) => <button className={difficulty === item ? "selected" : ""} disabled={running} onClick={() => changeDifficulty(item)} key={item}>{item}</button>)}</div>
          <div><small>Content</small>{(["Code", "Novel", "Plain Text"] as ContentMode[]).map((item) => <button className={mode === item ? "selected" : ""} disabled={running} onClick={() => changeMode(item)} key={item}>{item}</button>)}</div>
          <div className="typing-actions"><Button onClick={startTest} disabled={novelUnavailable}>{running ? "Restart" : "Start Test"} <Icon name="arrow" size={17} /></Button><Button variant="secondary" onClick={resetTest}>Restart</Button></div>
        </div>

        {novelUnavailable ? (
          <div className="novel-empty">
            <span><Icon name="book" size={25} /></span>
            <div><strong>Novel passages are waiting for source files</strong><p>Add public-domain `.txt` books to <code>/resources</code>. EduBridge will use those files here without generating or altering their content.</p></div>
          </div>
        ) : (
          <>
            <div className="passage-label"><span>{mode === "Code" ? "C practice" : mode} · {difficulty}</span><span>{typed.length} / {passage.length} characters</span></div>
            <pre className={`typing-passage ${mode !== "Code" ? "prose-passage" : ""}`} aria-label="Text to type">
              {passage.split("").map((character, index) => {
                const state = index < typed.length ? (typed[index] === character ? "correct" : "incorrect") : index === typed.length ? "cursor" : "";
                return <span className={state} key={`${character}-${index}`}>{character}</span>;
              })}
            </pre>
            <textarea
              ref={inputRef}
              className="typing-input"
              value={typed}
              onChange={(event) => updateTyped(event.target.value)}
              disabled={!running}
              spellCheck={false}
              aria-label={`Type the displayed ${mode.toLowerCase()} passage`}
              placeholder={running ? "Start typing the passage above…" : 'Choose your settings, then press "Start Test".'}
            />
          </>
        )}
      </section>

      {finished && (
        <section className="typing-result">
          <div><p className="eyebrow">Test complete</p><h2>{wpm} words per minute</h2><p>Good work. Accuracy grows naturally when you focus on consistent rhythm.</p></div>
          <dl>
            <div><dt>Accuracy</dt><dd>{accuracy}%</dd></div>
            <div><dt>Characters</dt><dd>{typed.length}</dd></div>
            <div><dt>Errors</dt><dd>{errors}</dd></div>
            <div><dt>Time taken</dt><dd>{elapsed}s</dd></div>
          </dl>
          <Button onClick={startTest}>Try Again</Button>
        </section>
      )}

      <section className="recent-performance">
        <div><p className="eyebrow">Your history</p><h2>Recent Performance</h2></div>
        <div className="performance-list">
          {history.length === 0 ? (
            <p className="muted" style={{ padding: "12px 0" }}>Complete your first typing test to see your history!</p>
          ) : (
            history.map((result, idx) => (
              <div key={`${result.when}-${result.wpm}-${idx}`}>
                <span><strong>{result.wpm} WPM</strong><small>{result.when}</small></span>
                <span>{result.accuracy}% accuracy</span>
                <span>{result.time}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
