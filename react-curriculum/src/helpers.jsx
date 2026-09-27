// Small display helpers that every lesson uses:
//
//   <Show code="add(2, 3)" value={add(2, 3)} />
//       shows a line of JavaScript and what it produced:   add(2, 3) → 5
//
//   <ShowAsync code="wait(100)" run={() => wait(100)} />
//       the same for code that returns a Promise (shows ⏳ until it settles)
//
//   <Check label="formatPrice(3.5)" run={() => formatPrice(3.5)} expected="$3.50" />
//       ✅ or ❌ for an assignment. Updates every time you save.
//
//   <CheckAsync ... />
//       the same as Check, for functions that return a Promise
//
// You don't need to read this file to follow the lessons.
import { useEffect, useState } from 'react';

// Turn any value into readable text, like the browser console does.
function format(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'function') return `ƒ ${value.name || 'anonymous'}()`;
  if (typeof value === 'string') return `'${value}'`;
  if (value instanceof Promise) return 'Promise { <pending> }';
  if (value instanceof Error) return `Error: ${value.message}`;
  if (Array.isArray(value)) return `[${value.map(format).join(', ')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';
    return `{ ${entries.map(([key, inner]) => `${key}: ${format(inner)}`).join(', ')} }`;
  }
  return String(value);
}

function matches(actual, expected) {
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < 1e-9; // ignore tiny floating-point differences
  }
  return format(actual) === format(expected);
}

function runSafely(run) {
  try {
    return run();
  } catch (error) {
    return new Error(error.message);
  }
}

// ---- Show -------------------------------------------------------------------

export function Show({ code, value }) {
  return (
    <div className="show">
      <code>{code}</code>
      <span className="show-arrow">→</span>
      <code className="show-value">{format(value)}</code>
    </div>
  );
}

function useSettled(run) {
  const [result, setResult] = useState({ pending: true });
  useEffect(() => {
    let ignore = false;
    Promise.resolve()
      .then(run)
      .then(
        (value) => !ignore && setResult({ value }),
        (error) => !ignore && setResult({ value: `Rejected: ${error?.message ?? error}` }),
      );
    return () => {
      ignore = true;
    };
  }, [run]);
  return result;
}

export function ShowAsync({ code, run }) {
  const result = useSettled(run);
  return (
    <div className="show">
      <code>{code}</code>
      <span className="show-arrow">→</span>
      <code className="show-value">{result.pending ? '⏳ waiting…' : format(result.value)}</code>
    </div>
  );
}

// ---- Check ------------------------------------------------------------------

function CheckResult({ label, pending, passed, actual, expected }) {
  if (pending) {
    return (
      <div className="check">
        ⏳ <code>{label}</code>
      </div>
    );
  }
  return (
    <div className={passed ? 'check check-pass' : 'check check-fail'}>
      {passed ? '✅' : '❌'} <code>{label}</code>
      {!passed && (
        <div className="check-detail">
          expected <code>{format(expected)}</code> but got <code>{format(actual)}</code>
        </div>
      )}
    </div>
  );
}

export function Check({ label, run, expected }) {
  const actual = runSafely(run);
  return <CheckResult label={label} passed={matches(actual, expected)} actual={actual} expected={expected} />;
}

export function CheckAsync({ label, run, expected }) {
  const result = useSettled(run);
  return (
    <CheckResult
      label={label}
      pending={result.pending}
      passed={!result.pending && matches(result.value, expected)}
      actual={result.value}
      expected={expected}
    />
  );
}
