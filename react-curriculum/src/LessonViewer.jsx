// The lesson viewer: lists every lesson and renders the four parts of each
// lesson file (Learn, Assignments, Experiments, Solutions).
//
// You don't need to read this file to follow the curriculum. By the end of
// lesson 12 you'll understand everything in it, so it makes a good final test.
import { Component, Suspense, lazy, useEffect, useState } from 'react';
import { steps } from './steps.js';

// import.meta.glob is a Vite feature: it finds every lesson file and gives us a
// function that loads each one only when it's needed.
const modules = import.meta.glob('../lessons/*.jsx');

function MissingPart() {
  return <p className="muted">This lesson doesn't have this part.</p>;
}

// Every lesson file exports four components:
//   default → Lesson,  Assignments,  Experiments,  Solutions
const PARTS = ['default', 'Assignments', 'Experiments', 'Solutions'];

const lessonParts = Object.fromEntries(
  Object.entries(modules).map(([path, load]) => [
    path.replace('../', ''),
    Object.fromEntries(PARTS.map((name) => [name, lazy(() => load().then((m) => ({ default: m[name] ?? MissingPart })))])),
  ]),
);

// ---- progress (saved in this browser only) --------------------------------
const STORAGE_KEY = 'react-curriculum:completed-lessons';

function loadCompleted() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveCompleted(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be blocked (e.g. private windows). Progress just won't persist.
  }
}

// ---- location hash: #/05 ----------------------------------------------------
function readHash(completed) {
  const [, id] = window.location.hash.split('/');
  const firstIncomplete = steps.find((step) => !completed.includes(step.id)) ?? steps[0];
  return steps.some((step) => step.id === id) ? id : firstIncomplete.id;
}

export default function LessonViewer() {
  const [completed, setCompleted] = useState(loadCompleted);
  const [currentId, setCurrentId] = useState(() => readHash(completed));
  const [revealedFor, setRevealedFor] = useState(null);

  useEffect(() => {
    const onHashChange = () => setCurrentId(readHash(loadCompleted()));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const stepIndex = steps.findIndex((step) => step.id === currentId);
  const step = steps[stepIndex];
  const nextStep = steps[stepIndex + 1];
  const firstIncompleteIndex = steps.findIndex((s) => !completed.includes(s.id));
  const isAhead = firstIncompleteIndex !== -1 && stepIndex > firstIncompleteIndex;
  const isDone = completed.includes(step.id);
  const parts = lessonParts[step.file];

  function go(id) {
    window.location.hash = `/${id}`;
    window.scrollTo(0, 0);
  }

  function toggleDone() {
    const next = isDone ? completed.filter((id) => id !== step.id) : [...completed, step.id];
    setCompleted(next);
    saveCompleted(next);
  }

  return (
    <div className="viewer">
      <aside className="viewer-sidebar">
        <h1 className="viewer-title">React Curriculum</h1>
        <p className="viewer-progress">
          {completed.length} / {steps.length} lessons complete
        </p>
        <nav>
          {steps.map((s, index) => {
            const showHeading = index === 0 || steps[index - 1].level !== s.level;
            const locked = firstIncompleteIndex !== -1 && index > firstIncompleteIndex;
            return (
              <div key={s.id}>
                {showHeading && <h2 className="viewer-section">{s.level}</h2>}
                <a
                  href={`#/${s.id}`}
                  className={[
                    'viewer-link',
                    s.id === step.id && 'is-current',
                    completed.includes(s.id) && 'is-done',
                    locked && 'is-locked',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="viewer-link-num">{s.id}</span>
                  <span>{s.title}</span>
                  <span className="viewer-link-status" aria-hidden="true">
                    {completed.includes(s.id) ? '✓' : locked ? '🔒' : ''}
                  </span>
                </a>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="viewer-main">
        {isAhead && (
          <div className="viewer-warning">
            <strong>You're ahead of yourself.</strong> Lesson {steps[firstIncompleteIndex].id} (
            {steps[firstIncompleteIndex].title}) isn't marked complete yet. Every lesson builds on the one
            before it, so skipping ahead makes later lessons much harder.{' '}
            <button type="button" onClick={() => go(steps[firstIncompleteIndex].id)}>
              Go to lesson {steps[firstIncompleteIndex].id}
            </button>
          </div>
        )}

        <header className="viewer-header">
          <p className="viewer-eyebrow">
            Lesson {step.id} · {step.level} · <code>{step.file}</code>
          </p>
          <h1>{step.title}</h1>
          <p className="viewer-goal">{step.goal}</p>
          <p className="viewer-js">
            JavaScript in this lesson:{' '}
            {step.js.map((topic) => (
              <span key={topic} className="badge">
                {topic}
              </span>
            ))}
          </p>
          <nav className="viewer-jump">
            <a href="#part-learn" onClick={(e) => jumpTo(e, 'part-learn')}>
              1 · Learn
            </a>
            <a href="#part-assignments" onClick={(e) => jumpTo(e, 'part-assignments')}>
              2 · Assignments
            </a>
            <a href="#part-experiments" onClick={(e) => jumpTo(e, 'part-experiments')}>
              3 · Experiments
            </a>
            <a href="#part-solutions" onClick={(e) => jumpTo(e, 'part-solutions')}>
              4 · Solutions
            </a>
          </nav>
        </header>

        <Part id="part-learn" title="1 · Learn" hint="Read PART 1 of the file alongside this page.">
          <Stage key={`${step.file}-learn`} Component={parts?.default} path={step.file} />
        </Part>

        <Part
          id="part-assignments"
          title="2 · Your assignments"
          hint="Scroll to PART 2 in the file and replace the TODOs. This section updates every time you save."
        >
          <Stage key={`${step.file}-assignments`} Component={parts?.Assignments} path={step.file} />
        </Part>

        <Part id="part-experiments" title="3 · Experiments" hint="Change the code from PART 1 and watch what happens.">
          <Stage key={`${step.file}-experiments`} Component={parts?.Experiments} path={step.file} />
        </Part>

        <Part id="part-solutions" title="4 · Solutions" hint="PART 4 at the bottom of the file.">
          {revealedFor === step.id ? (
            <Stage key={`${step.file}-solutions`} Component={parts?.Solutions} path={step.file} />
          ) : (
            <div className="viewer-card">
              <p>
                <strong>Try the assignments first.</strong> Struggling for a few minutes is how this sticks. If
                you're still stuck after re-reading the lesson, go ahead.
              </p>
              <button type="button" onClick={() => setRevealedFor(step.id)}>
                Show the solutions
              </button>
            </div>
          )}
        </Part>

        <footer className="viewer-footer">
          <label className="viewer-done">
            <input type="checkbox" checked={isDone} onChange={toggleDone} />
            I finished the lesson, the assignments, and the experiments
          </label>
          {nextStep && (
            <button type="button" disabled={!isDone} onClick={() => go(nextStep.id)}>
              Next: {nextStep.id} · {nextStep.title} →
            </button>
          )}
          {!nextStep && isDone && <p>🎉 You finished the whole curriculum. Seriously, well done.</p>}
        </footer>
      </main>
    </div>
  );
}

// Scroll to a part without changing the #/05 hash we use for navigation.
function jumpTo(event, id) {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function Part({ id, title, hint, children }) {
  return (
    <section id={id} className="viewer-part">
      <div className="viewer-part-header">
        <h2>{title}</h2>
        <p className="muted">{hint}</p>
      </div>
      {children}
    </section>
  );
}

function Stage({ Component: LoadedComponent, path }) {
  if (!LoadedComponent) {
    return (
      <div className="viewer-error">
        Couldn't find <code>{path}</code>. Did it get renamed or deleted?
      </div>
    );
  }
  return (
    <div className="lesson-stage">
      <ErrorBoundary>
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <LoadedComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Error boundaries must be class components (one of the few places you still
// need a class). This one keeps a crash in one part from taking down the page.
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="viewer-error">
          <strong>This part crashed:</strong>
          <pre>{this.state.error.message}</pre>
          <p>Check the browser console for details, fix the file, and save. The page updates on its own.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
