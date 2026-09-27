// =============================================================================
// LESSON 13 · PERFORMANCE: memo, useCallback, useMemo (and when NOT to use them)
// =============================================================================
//
//   PART 1 · LEARN        equality & shallow comparison, then re-render tuning
//   PART 2 · ASSIGNMENTS  your turn (the final one!)
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–12.
// Open the console: every "🔁" line is one render of a component.
// Tip: React DevTools → ⚙️ → "Highlight updates when components render".
//
// What you'll learn
//   JavaScript: === on objects & functions (again, but it matters now),
//               new functions/objects on every call, shallow comparison,
//               timing code with performance.now()
//   React:      when React re-renders, measuring, moving state down, memo,
//               useCallback, useMemo, and not over-optimizing
// =============================================================================

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST
// =============================================================================

// -----------------------------------------------------------------------------
// === compares VALUES for primitives, but IDENTITY for objects & functions
// -----------------------------------------------------------------------------
const sameNumber = 3 === 3; // true
const sameText = 'latte' === 'latte'; // true
const smallA = { size: 'M' };
const smallB = { size: 'M' };
const sameLookingObjects = smallA === smallB; // false: two different objects that look alike
const returnOneA = () => 1;
const returnOneB = () => 1;
const sameLookingFunctions = returnOneA === returnOneB; // false: two different functions

// -----------------------------------------------------------------------------
// Every call creates BRAND-NEW functions and objects
// -----------------------------------------------------------------------------
// A component is a function that React calls on every render. So anything
// created INSIDE it is new each time, just like here:
function pretendRender() {
  const handleClick = () => 'clicked'; // a new function every call
  const style = { color: 'tomato' }; // a new object every call
  return { handleClick, style };
}
const render1 = pretendRender();
const render2 = pretendRender();

// Create it ONCE (outside), and it stays the same:
const sharedStyle = { color: 'tomato' };
function pretendRenderStable() {
  return { style: sharedStyle };
}

// -----------------------------------------------------------------------------
// Shallow comparison: exactly what memo() does
// -----------------------------------------------------------------------------
// "Do these two objects have the same keys, and is each value === the other?"
function shallowEqual(a, b) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]); // one level deep: "shallow"
}
const oldProps = { name: 'Latte', price: 4.5 };
const newPropsSame = { name: 'Latte', price: 4.5 };
const handlerA = () => {};
const handlerB = () => {};

// -----------------------------------------------------------------------------
// Measuring time
// -----------------------------------------------------------------------------
// performance.now() gives milliseconds with decimals. Subtract two readings.
function slowSum() {
  let total = 0;
  for (let i = 0; i < 3_000_000; i++) total += i; // 3_000_000 is just 3000000, easier to read
  return total;
}
const startTime = performance.now();
slowSum();
const elapsedMs = Math.round(performance.now() - startTime);

// =============================================================================
// 1B · THE REACT PART: FINDING AND FIXING WASTED RENDERS
// =============================================================================

// A tiny custom hook (lesson 12!) that logs each time a component renders. An
// effect with no dependency array runs after EVERY render that reached the screen.
function useRenderLog(name) {
  useEffect(() => {
    console.log(`🔁 ${name} rendered`);
  });
}

const MENU = [
  { id: 1, name: 'Coffee' },
  { id: 2, name: 'Latte' },
  { id: 3, name: 'Chai' },
  { id: 4, name: 'Muffin' },
];

// -----------------------------------------------------------------------------
// When does a component re-render?
// -----------------------------------------------------------------------------
//   • when its own state changes
//   • when its PARENT re-renders: by default React re-renders ALL children,
//     even if their props are exactly the same
//   • when a context it reads changes (lesson 11)
// A re-render just calls the function and compares JSX. React only touches the
// real DOM where something changed, so re-renders are usually cheap. Don't
// worry about them until you MEASURE a real slowdown.
function MenuList({ label }) {
  useRenderLog(`MenuList (${label})`);
  return (
    <ul>
      {MENU.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// -----------------------------------------------------------------------------
// The problem: typing re-renders an unrelated list
// -----------------------------------------------------------------------------
function StateTooHigh() {
  const [name, setName] = useState(''); // state lives in the PARENT…
  return (
    <div className="card">
      <input placeholder="Type here…" value={name} onChange={(e) => setName(e.target.value)} />
      {/* …so every keystroke re-renders the parent AND MenuList. Check the console. */}
      <MenuList label="state too high" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fix #1 (often the best): move the state DOWN into its own component
// -----------------------------------------------------------------------------
function NameInput() {
  const [name, setName] = useState('');
  return <input placeholder="Type here…" value={name} onChange={(e) => setName(e.target.value)} />;
}

function StateMovedDown() {
  return (
    <div className="card">
      <NameInput /> {/* only this re-renders when you type */}
      <MenuList label="state moved down" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fix #2: memo(), which skips re-rendering when the props are the same
// -----------------------------------------------------------------------------
// memo compares old and new props with a SHALLOW comparison (1A). If nothing
// changed, it reuses the last result.
const MemoMenuList = memo(MenuList);

function WithMemo() {
  const [name, setName] = useState('');
  return (
    <div className="card">
      <input placeholder="Type here…" value={name} onChange={(e) => setName(e.target.value)} />
      <MemoMenuList label="memo" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// The catch: a NEW function prop breaks memo; useCallback fixes it
// -----------------------------------------------------------------------------
// Every render creates a brand-new handleSelect (1A: pretendRender), so memo's
// shallow comparison sees a "different" prop every time and re-renders anyway.
const SelectableMenu = memo(function SelectableMenu({ label, onSelect }) {
  useRenderLog(`SelectableMenu (${label})`);
  return (
    <div className="row">
      {MENU.map((item) => (
        <button key={item.id} onClick={() => onSelect(item.name)}>
          {item.name}
        </button>
      ))}
    </div>
  );
});

function MemoBrokenByFunction() {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(null);
  const handleSelect = (itemName) => setSelected(itemName); // ❌ new every render
  return (
    <div className="card">
      <input placeholder="Type here…" value={name} onChange={(e) => setName(e.target.value)} />
      <SelectableMenu label="new function every render" onSelect={handleSelect} />
      <p className="muted">Selected: {selected ?? 'nothing'}</p>
    </div>
  );
}

function MemoFixedWithUseCallback() {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(null);
  // ✅ useCallback returns the SAME function every render until a dependency
  //    changes. setSelected never changes, so [] is fine.
  const handleSelect = useCallback((itemName) => setSelected(itemName), []);
  return (
    <div className="card">
      <input placeholder="Type here…" value={name} onChange={(e) => setName(e.target.value)} />
      <SelectableMenu label="useCallback" onSelect={handleSelect} />
      <p className="muted">Selected: {selected ?? 'nothing'}</p>
    </div>
  );
}
// Objects/arrays as props have the same problem. Fix: useMemo(() => ({ … }), [])
// or, if it never changes, define it OUTSIDE the component (like sharedStyle).

// -----------------------------------------------------------------------------
// useMemo for a genuinely expensive calculation
// -----------------------------------------------------------------------------
// We fake an expensive search with a loop that burns ~40ms, enough to feel.
function slowSearch(items, query) {
  const start = performance.now();
  while (performance.now() - start < 40) {
    // busy-waiting on purpose: this is the "expensive work"
  }
  return items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
}

function ExpensiveCalculation() {
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const [memoOn, setMemoOn] = useState(false);

  // useMemo(calculate, deps): re-run calculate only when a dependency changes;
  // otherwise hand back the cached result.
  const memoizedResults = useMemo(() => slowSearch(MENU, query), [query]);
  // For comparison, run it on EVERY render when the box is unticked:
  const results = memoOn ? memoizedResults : slowSearch(MENU, query);

  return (
    <div className="card">
      <label>
        <input type="checkbox" checked={memoOn} onChange={(e) => setMemoOn(e.target.checked)} />
        Use useMemo
      </label>
      <p className="row">
        <input placeholder="Search the menu" value={query} onChange={(e) => setQuery(e.target.value)} />
        <input placeholder="Order note (unrelated)" value={note} onChange={(e) => setNote(e.target.value)} />
      </p>
      <p className="muted">
        Type fast in the NOTE box with useMemo off: it lags, because every keystroke re-runs the slow search. Tick
        useMemo: the note box is instant, because the search only re-runs when the query changes.
      </p>
      <p>Results: {results.map((item) => item.name).join(', ') || 'none'}</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// The checklist, in order
// -----------------------------------------------------------------------------
//   1. MEASURE. Is it actually slow? React DevTools' Profiler shows which
//      components render and how long they take.
//   2. Move state down / split components so less of the tree re-renders.
//   3. memo() a child that's expensive AND often re-renders with the same props…
//   4. …then keep its props stable: useCallback for functions, useMemo for
//      objects/arrays.
//   5. useMemo for calculations that are measurably slow.
//   6. Stable keys in lists (lesson 07), so React can reuse rows.
// Don't wrap everything "just in case": it adds complexity and its own cost.
//
// Looking ahead: the React Compiler (a build tool from the React team) can add
// this memoization automatically, so projects using it rarely write memo /
// useCallback / useMemo by hand. You'll still meet them in lots of existing
// code, and knowing them tells you what the compiler does for you.

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript you need first</h2>

      <h3>=== on values vs. objects</h3>
      <Show code="3 === 3" value={sameNumber} />
      <Show code="'latte' === 'latte'" value={sameText} />
      <Show code="smallA === smallB   (both { size: 'M' })" value={sameLookingObjects} />
      <Show code="returnOneA === returnOneB   (both () => 1)" value={sameLookingFunctions} />

      <h3>New on every call</h3>
      <Show code="render1.handleClick === render2.handleClick" value={render1.handleClick === render2.handleClick} />
      <Show code="render1.style === render2.style" value={render1.style === render2.style} />
      <Show code="pretendRenderStable().style === pretendRenderStable().style" value={pretendRenderStable().style === pretendRenderStable().style} />

      <h3>Shallow comparison</h3>
      <Show code="shallowEqual(oldProps, newPropsSame)" value={shallowEqual(oldProps, newPropsSame)} />
      <Show code="shallowEqual({ onClick: handlerA }, { onClick: handlerB })" value={shallowEqual({ onClick: handlerA }, { onClick: handlerB })} />
      <Show code="shallowEqual({ onClick: handlerA }, { onClick: handlerA })" value={shallowEqual({ onClick: handlerA }, { onClick: handlerA })} />

      <h3>Measuring time</h3>
      <Show code="slowSum() took (ms)" value={elapsedMs} />

      <h2>1B · The React part</h2>
      <p className="muted">👉 Clear the console (🚫 icon) before trying each demo.</p>

      <h3>State too high: typing re-renders the list</h3>
      <StateTooHigh />

      <h3>Fix #1: move state down</h3>
      <StateMovedDown />

      <h3>Fix #2: memo</h3>
      <WithMemo />

      <h3>memo + a new function every render = still re-renders</h3>
      <MemoBrokenByFunction />
      <p className="muted">…and fixed with useCallback:</p>
      <MemoFixedWithUseCallback />

      <h3>useMemo for slow calculations</h3>
      <ExpensiveCalculation />

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>Why is {'{ size: "M" } === { size: "M" }'} false?</li>
        <li>Name three things that make a component re-render.</li>
        <li>What's the first thing to try before reaching for memo?</li>
        <li>Why does memo not help when you pass onSelect={'{() => …}'}?</li>
        <li>useMemo vs useCallback: what does each one cache?</li>
        <li>Should you wrap every component in memo? Why not?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 25 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: the ideas behind memo and useMemo
// -----------------------------------------------------------------------------

// A1. sameProps(a, b) → true if both objects have the same keys and every
//     value is === (a SHALLOW comparison). Write it yourself; don't reuse shallowEqual.
const sameProps = (a, b) => {
  // TODO
};

// A2. timeIt(fn) → call fn and return { result, ms } where ms is how long it
//     took (use performance.now()).
const timeIt = (fn) => {
  // TODO
};

// A3. rememberLast(fn) → a new function taking ONE argument. If called with the
//     same argument as last time (===), return the remembered result WITHOUT
//     calling fn again. Otherwise call fn, remember the argument and result.
//     (That's useMemo's idea, with the argument as the "dependency".)
const rememberLast = (fn) => {
  // TODO
};

// -----------------------------------------------------------------------------
// B · React: speed up the Corner Café menu board
// -----------------------------------------------------------------------------
// Click "Start the board" below, then watch the console: every "🔁" is a render.
// Do these IN ORDER and check the console after each:
//   B1. MEASURE. Before changing anything, write in a comment what re-renders
//       every second, and what re-renders on each keystroke in "Customer name".
//   B2. MOVE STATE DOWN. The clock's `now` state lives in CafeBoard, so the
//       whole board re-renders every second. Move the clock state + effect into
//       CafeClock. After this, the rows stop logging every second.
//   B3. memo + useCallback. Typing a customer name still re-renders every row.
//       Wrap CafeBoardRow in memo(). Rows STILL re-render: why? (Look at the
//       onToggleFavorite prop.) Fix it with useCallback, using the updater form
//       of setFavorites so the callback doesn't need `favorites` as a dependency.
//       After this, clicking ☆ on one row re-renders ONLY that row.
//   B4. useMemo. Typing in "Customer name" still feels laggy, because
//       sortByPopularity (slow on purpose) runs every render. Memoize it.
//
// How to check: idle, only the clock logs each second; typing a name logs no
// row renders and doesn't lag; ☆ on Latte logs only "row Latte"; search works.
const BOARD_MENU = [
  { id: 1, name: 'Coffee', popularity: 90 },
  { id: 2, name: 'Latte', popularity: 97 },
  { id: 3, name: 'Chai', popularity: 60 },
  { id: 4, name: 'Mocha', popularity: 75 },
  { id: 5, name: 'Bagel', popularity: 55 },
  { id: 6, name: 'Muffin', popularity: 82 },
  { id: 7, name: 'Scone', popularity: 40 },
  { id: 8, name: 'Croissant', popularity: 88 },
];

// Slow on purpose: pretend it crunches a year of sales data.
function sortByPopularity(items) {
  const start = performance.now();
  while (performance.now() - start < 80) {
    // expensive work…
  }
  return items.toSorted((a, b) => b.popularity - a.popularity);
}

function CafeClock({ now }) {
  useRenderLog('[assignment] clock');
  return <span className="muted">{now.toLocaleTimeString()}</span>;
}

function CafeBoardRow({ item, isFavorite, onToggleFavorite }) {
  useRenderLog(`[assignment] row ${item.name}`);
  return (
    <li className="row" style={{ marginBottom: 4 }}>
      <button onClick={() => onToggleFavorite(item.id)}>{isFavorite ? '★' : '☆'}</button>
      {item.name}
    </li>
  );
}

function CafeBoard() {
  useRenderLog('[assignment] the whole board');

  // TODO B2: this clock state belongs in CafeClock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [favorites, setFavorites] = useState([]);

  // TODO B3: make this a stable function
  function toggleFavorite(id) {
    setFavorites(favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id]);
  }

  // TODO B4: memoize the slow part
  const sorted = sortByPopularity(BOARD_MENU);
  const visible = sorted.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>☕ Menu board</strong>
        <CafeClock now={now} />
      </div>
      <p className="row">
        <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </p>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        {visible.map((item) => (
          <CafeBoardRow key={item.id} item={item} isFavorite={favorites.includes(item.id)} onToggleFavorite={toggleFavorite} />
        ))}
      </ul>
    </div>
  );
}

// Keeps the noisy board from logging until you ask for it.
function StartButton({ label, children }) {
  const [started, setStarted] = useState(false);
  if (!started) return <button onClick={() => setStarted(true)}>{label}</button>;
  return children;
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="sameProps({ a: 1, b: 'x' }, { a: 1, b: 'x' })" run={() => sameProps({ a: 1, b: 'x' }, { a: 1, b: 'x' })} expected={true} />
      <Check label="sameProps({ a: 1 }, { a: 2 })" run={() => sameProps({ a: 1 }, { a: 2 })} expected={false} />
      <Check label="sameProps({ a: 1 }, { a: 1, b: 2 })" run={() => sameProps({ a: 1 }, { a: 1, b: 2 })} expected={false} />
      <Check label="sameProps({ list: [1] }, { list: [1] })   (different arrays!)" run={() => sameProps({ list: [1] }, { list: [1] })} expected={false} />
      <Check
        label="timeIt(() => 42)"
        run={() => {
          const timed = timeIt(() => 42);
          return [timed?.result, typeof timed?.ms === 'number' && timed.ms >= 0];
        }}
        expected={[42, true]}
      />
      <Check
        label="rememberLast: same argument → fn not called again"
        run={() => {
          let calls = 0;
          const double = rememberLast((n) => {
            calls = calls + 1;
            return n * 2;
          });
          return [double(5), double(5), double(6), calls];
        }}
        expected={[10, 10, 12, 2]}
      />

      <h3>B · React</h3>
      <StartButton label="Start the board (then watch the console)">
        <CafeBoard />
      </StartButton>
    </div>
  );
}

// #############################################################################
// PART 3 · EXPERIMENTS
// #############################################################################
export function Experiments() {
  return (
    <ol>
      <li>
        Turn on React DevTools' "Highlight updates when components render" and type in each demo's input. Watch
        what flashes.
      </li>
      <li>
        In <code>MemoFixedWithUseCallback</code>, add <code>name</code> to useCallback's dependency array. When does
        SelectableMenu re-render now?
      </li>
      <li>
        Pass <code>style={'{{ color: "tomato" }}'}</code> to <code>MemoMenuList</code> in WithMemo. Does memo still
        help? Fix it by moving the object outside the component.
      </li>
      <li>
        Open React DevTools' Profiler tab, record while typing in ExpensiveCalculation's note box (useMemo off, then
        on), and compare the timings.
      </li>
    </ol>
  );
}

// #############################################################################
// PART 4 · SOLUTIONS  ⚠️ SPOILERS. Try the assignments first!
// #############################################################################
// B1 measurements, before the fixes:
//   • every second: the whole board, the clock and ALL 8 rows re-render
//   • every keystroke: the same, plus an 80ms freeze from sortByPopularity
//
//
//
//
//
//
//

const samePropsSolution = (a, b) => {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  return keysA.length === keysB.length && keysA.every((key) => a[key] === b[key]);
};

const timeItSolution = (fn) => {
  const start = performance.now();
  const result = fn();
  return { result, ms: performance.now() - start };
};

const rememberLastSolution = (fn) => {
  let hasRun = false;
  let lastArg;
  let lastResult;
  return (arg) => {
    if (hasRun && arg === lastArg) return lastResult; // same "dependency": reuse
    lastArg = arg;
    lastResult = fn(arg);
    hasRun = true;
    return lastResult;
  };
};

// B2: the clock owns its state. Only the clock re-renders each second.
function CafeClockSolution() {
  useRenderLog('[solution] clock');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="muted">{now.toLocaleTimeString()}</span>;
}

// B3a: memo skips a row whose props are all unchanged.
const CafeBoardRowSolution = memo(function CafeBoardRowSolution({ item, isFavorite, onToggleFavorite }) {
  useRenderLog(`[solution] row ${item.name}`);
  return (
    <li className="row" style={{ marginBottom: 4 }}>
      <button onClick={() => onToggleFavorite(item.id)}>{isFavorite ? '★' : '☆'}</button>
      {item.name}
    </li>
  );
});

function CafeBoardSolution() {
  useRenderLog('[solution] the whole board');
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [favorites, setFavorites] = useState([]);

  // B3b: a stable function. The updater form means we never read `favorites`
  // here, so the dependency array can stay empty.
  const toggleFavorite = useCallback((id) => {
    setFavorites((favs) => (favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]));
  }, []);

  // B4: BOARD_MENU never changes, so the slow sort runs exactly once.
  const sorted = useMemo(() => sortByPopularity(BOARD_MENU), []);
  const visible = sorted.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())); // cheap: no memo needed

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>☕ Menu board</strong>
        <CafeClockSolution />
      </div>
      <p className="row">
        <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </p>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        {visible.map((item) => (
          <CafeBoardRowSolution key={item.id} item={item} isFavorite={favorites.includes(item.id)} onToggleFavorite={toggleFavorite} />
        ))}
      </ul>
    </div>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="sameProps({ list: [1] }, { list: [1] })" run={() => samePropsSolution({ list: [1] }, { list: [1] })} expected={false} />
      <Check label="timeIt(() => 42).result" run={() => timeItSolution(() => 42).result} expected={42} />
      <Check
        label="rememberLast: same argument → fn not called again"
        run={() => {
          let calls = 0;
          const double = rememberLastSolution((n) => {
            calls = calls + 1;
            return n * 2;
          });
          return [double(5), double(5), double(6), calls];
        }}
        expected={[10, 10, 12, 2]}
      />

      <h3>B · React</h3>
      <StartButton label="Start the solution board (then watch the console)">
        <CafeBoardSolution />
      </StartButton>
      <p className="muted">🎉 That's the whole curriculum. Go back and read src/LessonViewer.jsx: you now understand every line.</p>
    </div>
  );
}
