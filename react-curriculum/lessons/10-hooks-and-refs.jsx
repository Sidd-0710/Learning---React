// =============================================================================
// LESSON 10 · HOOKS: THE RULES, HOW THEY WORK, AND useRef
// =============================================================================
//
//   PART 1 · LEARN        a mini React in plain JS, then the Rules of Hooks & useRef
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–09 (you've used useState and useEffect).
//
// What you'll learn
//   JavaScript: how hooks work underneath: closures + an array + call order
//   React:      the two Rules of Hooks and WHY they exist, useRef for DOM
//               elements, useRef for values that shouldn't re-render
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT UNDERNEATH: A MINI REACT
// =============================================================================
// When you call useState('Sam'), you don't tell React WHICH state you mean. No
// name, no id. So how does React know `name` is 'Sam' and `size` is 'Large' on
// the next render? By ORDER: "the 1st hook call gets slot 0, the 2nd gets slot
// 1…". Here's that idea in ~15 lines of plain JavaScript (closures, lesson 04):

function createMiniReact() {
  const slots = []; // one slot per hook call, in CALL ORDER
  let callIndex = 0;

  function useMiniState(initialValue) {
    const index = callIndex; // which slot is this call?
    callIndex = callIndex + 1;
    if (index >= slots.length) slots.push(initialValue); // first render: store it
    const setValue = (newValue) => {
      slots[index] = newValue;
    };
    return [slots[index], setValue];
  }

  function render(component, props) {
    callIndex = 0; // every render starts counting from slot 0 again
    return component(props);
  }

  return { useMiniState, render };
}

// Two versions of the same "component". They return text instead of JSX.
const goodReact = createMiniReact();
const useGoodState = goodReact.useMiniState;

function OrderFormGood({ showNote }) {
  // ✅ All three hooks run on EVERY render, always in the same order.
  const [name] = useGoodState('Sam');
  const [note] = useGoodState('No sugar');
  const [size, setSize] = useGoodState('Medium');
  return { text: `name=${name} · note=${showNote ? note : '(hidden)'} · size=${size}`, setSize };
}

const badReact = createMiniReact();
const useBadState = badReact.useMiniState;

function OrderFormBad({ showNote }) {
  const [name] = useBadState('Sam');
  let note = '(hidden)';
  if (showNote) {
    // ❌ A hook inside a condition. Deliberately broken, so we tell the linter
    //    to allow it on this one line:
    // oxlint-disable-next-line react/rules-of-hooks
    [note] = useBadState('No sugar');
  }
  const [size, setSize] = useBadState('Medium');
  return { text: `name=${name} · note=${note} · size=${size}`, setSize };
}

function simulate(miniReact, Component) {
  const lines = [];
  let result = miniReact.render(Component, { showNote: false });
  lines.push(`Render 1 (note hidden): ${result.text}`);
  result.setSize('Large');
  lines.push('  …the customer picks Large…');
  result = miniReact.render(Component, { showNote: false });
  lines.push(`Render 2 (note hidden): ${result.text}`);
  result = miniReact.render(Component, { showNote: true });
  lines.push(`Render 3 (note SHOWN):  ${result.text}`);
  return lines.join('\n');
}

const goodLog = simulate(goodReact, OrderFormGood);
const badLog = simulate(badReact, OrderFormBad);
// In the bad version, render 3 calls one EXTRA hook in the middle, so every
// hook after it reads the WRONG slot: note gets size's value ('Large'), and
// size gets a brand-new slot ('Medium'). The customer's choice is lost.

// =============================================================================
// 1B · THE REACT PART: RULES OF HOOKS AND useRef
// =============================================================================

// -----------------------------------------------------------------------------
// The Rules of Hooks
// -----------------------------------------------------------------------------
// A hook is a function starting with `use` that hooks into a React feature.
//
//   Rule 1. Call hooks only at the TOP LEVEL of a component: not inside if
//           statements, loops, nested functions, or after an early return.
//   Rule 2. Call hooks only from React components or from custom hooks
//           (lesson 12), never from regular functions.
//
// Real React catches SOME violations: an extra hook appearing mid-component
// throws "Rendered more hooks than during the previous render". Others slip
// through silently. An early return before ALL your hooks just quietly resets
// their state (assignment B1 shows this). That's why `npm run lint` checks
// the rules for you.

// -----------------------------------------------------------------------------
// useRef #1: reaching a DOM element
// -----------------------------------------------------------------------------
// Sometimes you need the real DOM element: to focus an input, scroll to
// something, or measure it. useRef gives you a box: { current: … }. Put it on
// an element with ref={…} and React fills .current with that element.
function SearchBox() {
  const inputRef = useRef(null); // { current: null } until the input exists
  return (
    <div className="row">
      <input ref={inputRef} placeholder="Search the menu…" />
      <button onClick={() => inputRef.current.focus()}>Focus the search box</button>
      <button
        onClick={() => {
          inputRef.current.value = '';
          inputRef.current.focus();
        }}
      >
        Clear
      </button>
    </div>
  );
}
// You can pass a ref to your OWN component as a normal prop (React 19+):
//   function FancyInput({ ref }) { return <input ref={ref} className="fancy" />; }
// (Older code wraps the component in forwardRef() for this.)

// -----------------------------------------------------------------------------
// useRef #2: remembering a value WITHOUT re-rendering
// -----------------------------------------------------------------------------
//               useState                          useRef
//   change it   setX(value) → RE-RENDERS          ref.current = value → no re-render
//   read it     a snapshot for this render        the latest value, always
//   use for     anything shown on screen          timer ids, DOM elements,
//                                                 "behind the scenes" data
//
// Underneath, a ref is just an object React hands back every render: the SAME
// object each time, so whatever you put in .current stays there. Roughly:
//   const ref = useState(() => ({ current: initial }))[0];
function BrewTimer() {
  const [seconds, setSeconds] = useState(0); // shown on screen → state
  const [isRunning, setIsRunning] = useState(false); // shown on screen → state
  const intervalIdRef = useRef(null); // NOT shown; only needed to stop the timer → ref

  function start() {
    setIsRunning(true);
    intervalIdRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }
  function stop() {
    clearInterval(intervalIdRef.current);
    setIsRunning(false);
  }
  function reset() {
    stop();
    setSeconds(0);
  }

  // If the component disappears while running (you switch lessons), stop it.
  useEffect(() => {
    return () => clearInterval(intervalIdRef.current);
  }, []);

  return (
    <div className="row">
      <strong style={{ minWidth: 110, fontVariantNumeric: 'tabular-nums' }}>☕ Brewing: {seconds}s</strong>
      <button onClick={start} disabled={isRunning}>
        Start
      </button>
      <button onClick={stop} disabled={!isRunning}>
        Stop
      </button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
// Why not a plain `let intervalId`? It would reset on every re-render (lesson
// 04's BrokenCounter problem). Why not state? Nothing on screen uses it, so a
// re-render would be wasted.
// ⚠️ Don't read or write ref.current DURING rendering. Use it in event handlers
//    and effects. The screen won't update when a ref changes.

// -----------------------------------------------------------------------------
// The built-in hooks, at a glance
// -----------------------------------------------------------------------------
//   useState     remember a value; changing it re-renders        (lesson 05)
//   useEffect    sync with the outside world after render        (lesson 09)
//   useRef       a box that survives renders; DOM access         (this lesson)
//   useContext   read shared data without passing props          (lesson 11)
//   useMemo      cache a calculated value between renders        (lesson 13)
//   useCallback  cache a function between renders                (lesson 13)
//   useReducer   like useState, for complex state logic in one place
//   useId        unique ids for accessibility attributes
// Plus YOUR OWN hooks, built from these (lesson 12).

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript underneath: a mini React</h2>
      <p>✅ Hooks always called in the same order:</p>
      <pre>{goodLog}</pre>
      <p>❌ One hook inside an if:</p>
      <pre>{badLog}</pre>
      <p className="muted">
        In render 3 of the broken version, note shows "Large" and size fell back to "Medium". The extra hook call
        shifted every slot after it.
      </p>

      <h2>1B · The React part</h2>

      <h3>useRef for DOM elements</h3>
      <SearchBox />

      <h3>useRef for values that don't need a re-render</h3>
      <BrewTimer />

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>State the two Rules of Hooks.</li>
        <li>How does React know which useState call is which?</li>
        <li>What goes wrong if a hook is called inside an if?</li>
        <li>Changing ref.current vs calling setState: which re-renders?</li>
        <li>A count shown on screen: ref or state? A timer id?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 25 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: rebuild the slot store
// -----------------------------------------------------------------------------

// A1. createSlots() → an object with two functions sharing PRIVATE data:
//       startRender()      → resets the call counter to 0
//       slot(initialValue) → returns the value stored for THIS call position.
//                            First time at a position: store initialValue.
//     Example:
//       const s = createSlots();
//       s.startRender(); s.slot('a'); s.slot('b')   → 'a', 'b'
//       s.startRender(); s.slot('x'); s.slot('y')   → 'a', 'b'  (positions remembered!)
//     Use 1A's createMiniReact as your guide, but write it yourself.
const createSlots = () => {
  // TODO
};

// A2. PREDICT with the mini React from 1A. If the bad form rendered a 4th time
//     with showNote: false, what would `size` be? Write the answer as a string.
const predictedSize = 'TODO';

// -----------------------------------------------------------------------------
// B · React: fix the rules, then use refs
// -----------------------------------------------------------------------------
//   B1. BUG HUNT. CafeOrderSummary breaks the Rules of Hooks in TWO places.
//       • Bug 1 crashes loudly: click "Add item" three times and read the error.
//       • Bug 2 is sneakier, with no error at all: add an item, click "Show details",
//         click "Clear", then add an item again. The details closed by
//         themselves; the state was silently lost.
//       Run `npm run lint` in the terminal: it points at both lines. Fix both so
//       it works for 0, 1, 2, 3+ items. Hint: every hook must run on every
//       render, in the same order. Does `promoCode` even need to be state?
//   B2. AUTO-FOCUS. When CafeCounter appears, focus the "Name for the order"
//       input automatically (useRef + useEffect with []). Use
//       inputRef.current.focus({ preventScroll: true }) so the page doesn't jump.
//   B3. PREP TIMER. Make Start / Stop / Reset work. Keep the interval id in a
//       ref; seconds and isRunning are state. Start is disabled while running,
//       Stop while stopped.
//   B4. SCROLL. "Jump to reviews ↓" scrolls smoothly to the reviews card:
//       someRef.current.scrollIntoView({ behavior: 'smooth' })
//
// How to check: adding items never crashes; the 10% bulk discount shows at 3+;
// Show details → Clear → Add item keeps the details open; `npm run lint` shows
// no rules-of-hooks errors for this file; the name input has the cursor after a
// reload; the timer counts, stops, resumes and resets; the jump button scrolls.

// ---- B1: this component breaks the Rules of Hooks ----------------------------
function CafeOrderSummary({ items }) {
  if (items.length === 0) {
    return <p className="muted">No items yet.</p>;
  }

  const [showDetails, setShowDetails] = useState(false);

  let discount = 0;
  if (items.length >= 3) {
    const [promoCode] = useState('BULK10');
    discount = promoCode === 'BULK10' ? 0.1 : 0;
  }

  const subtotal = items.length * 4;
  return (
    <div className="card">
      <p>
        {items.length} item(s) · ${(subtotal * (1 - discount)).toFixed(2)}
        {discount > 0 && <span className="badge"> 10% bulk discount</span>}
      </p>
      <button onClick={() => setShowDetails((s) => !s)}>{showDetails ? 'Hide' : 'Show'} details</button>
      {showDetails && <p className="muted">{items.join(', ')}</p>}
    </div>
  );
}

function CafeCounter() {
  const [items, setItems] = useState([]);
  // TODO B2: a ref for the name input + an effect to focus it
  // TODO B3: seconds, isRunning, and a ref for the interval id
  // TODO B4: a ref for the reviews card

  return (
    <div>
      <h4>B1 · Order summary</h4>
      <div className="row">
        <button onClick={() => setItems([...items, `Latte #${items.length + 1}`])}>Add item</button>
        <button onClick={() => setItems([])}>Clear</button>
      </div>
      <CafeOrderSummary items={items} />

      <h4>B2 · Name</h4>
      <label>
        Name for the order <input />
      </label>

      <h4>B3 · Order prep timer</h4>
      <div className="row">
        <strong>⏱️ 0s</strong>
        <button>Start</button>
        <button>Stop</button>
        <button>Reset</button>
      </div>

      <h4>B4 · Scroll</h4>
      <button>Jump to reviews ↓</button>
      <div style={{ height: 500 }} className="muted">
        (lots of menu content…)
      </div>
      <div className="card">
        <h4>⭐ Reviews</h4>
        <p>"Best latte on the street." · Priya</p>
      </div>
    </div>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check
        label="first render stores the initial values"
        run={() => {
          const s = createSlots();
          s.startRender();
          return [s.slot('a'), s.slot('b')];
        }}
        expected={['a', 'b']}
      />
      <Check
        label="second render remembers by POSITION"
        run={() => {
          const s = createSlots();
          s.startRender();
          s.slot('a');
          s.slot('b');
          s.startRender();
          return [s.slot('x'), s.slot('y')];
        }}
        expected={['a', 'b']}
      />
      <Check
        label="two stores are independent"
        run={() => {
          const one = createSlots();
          const two = createSlots();
          one.startRender();
          one.slot('first');
          two.startRender();
          return two.slot('second');
        }}
        expected="second"
      />
      <Check label="predicted size after a 4th render (note hidden)" run={() => predictedSize} expected="Large" />

      <h3>B · React</h3>
      <CafeCounter />
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
        In <code>OrderFormGood</code>, swap the order of the <code>note</code> and <code>size</code> lines. Does it
        still work? (Yes, as long as the order is the SAME every render.)
      </li>
      <li>
        In <code>simulate</code>, add a 4th render with <code>showNote: false</code> and compare the two logs.
      </li>
      <li>
        In <code>BrewTimer</code>, replace <code>useRef(null)</code> with a plain <code>let intervalId</code>{' '}
        variable. Start, then try to Stop. What happens, and why?
      </li>
      <li>
        Add a <code>renderCount</code> ref to BrewTimer that increases in a <code>useEffect</code> with no dependency
        array, and <code>console.log</code> it. How often does the component render?
      </li>
    </ol>
  );
}

// #############################################################################
// PART 4 · SOLUTIONS  ⚠️ SPOILERS. Try the assignments first!
// #############################################################################
//
//
//
//
//
//
//
//
//

const createSlotsSolution = () => {
  const values = []; // private to this store (a closure)
  let position = 0;
  return {
    startRender: () => {
      position = 0;
    },
    slot: (initialValue) => {
      if (position >= values.length) values.push(initialValue);
      const value = values[position];
      position = position + 1;
      return value;
    },
  };
};

// Render 3 created a third slot ('Medium'). On render 4 the note hook is
// skipped again, so size reads slot 1 again, which still holds 'Large'.
const predictedSizeSolution = 'Large';

function CafeOrderSummarySolution({ items }) {
  // Fix 1: the hook moves ABOVE the early return, so it runs on every render.
  const [showDetails, setShowDetails] = useState(false);

  if (items.length === 0) {
    return <p className="muted">No items yet.</p>;
  }

  // Fix 2: promoCode never changes, so it doesn't need to be state at all.
  const promoCode = 'BULK10';
  const discount = items.length >= 3 && promoCode === 'BULK10' ? 0.1 : 0;

  const subtotal = items.length * 4;
  return (
    <div className="card">
      <p>
        {items.length} item(s) · ${(subtotal * (1 - discount)).toFixed(2)}
        {discount > 0 && <span className="badge"> 10% bulk discount</span>}
      </p>
      <button onClick={() => setShowDetails((s) => !s)}>{showDetails ? 'Hide' : 'Show'} details</button>
      {showDetails && <p className="muted">{items.join(', ')}</p>}
    </div>
  );
}

function CafeCounterSolution() {
  const [items, setItems] = useState([]);

  // B2: focus on mount, without scrolling the page.
  const nameInputRef = useRef(null);
  useEffect(() => {
    nameInputRef.current.focus({ preventScroll: true });
  }, []);

  // B3: display values in state; the interval id in a ref.
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalIdRef = useRef(null);
  function start() {
    setIsRunning(true);
    intervalIdRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }
  function stop() {
    clearInterval(intervalIdRef.current);
    setIsRunning(false);
  }
  function reset() {
    stop();
    setSeconds(0);
  }
  useEffect(() => {
    return () => clearInterval(intervalIdRef.current); // stop if we disappear mid-timer
  }, []);

  // B4: a ref on the reviews card, used from a click handler.
  const reviewsRef = useRef(null);

  return (
    <div>
      <h4>B1 · Order summary</h4>
      <div className="row">
        <button onClick={() => setItems([...items, `Latte #${items.length + 1}`])}>Add item</button>
        <button onClick={() => setItems([])}>Clear</button>
      </div>
      <CafeOrderSummarySolution items={items} />

      <h4>B2 · Name</h4>
      <label>
        Name for the order <input ref={nameInputRef} />
      </label>

      <h4>B3 · Order prep timer</h4>
      <div className="row">
        <strong>⏱️ {seconds}s</strong>
        <button onClick={start} disabled={isRunning}>
          Start
        </button>
        <button onClick={stop} disabled={!isRunning}>
          Stop
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      <h4>B4 · Scroll</h4>
      <button onClick={() => reviewsRef.current.scrollIntoView({ behavior: 'smooth' })}>Jump to reviews ↓</button>
      <div style={{ height: 500 }} className="muted">
        (lots of menu content…)
      </div>
      <div className="card" ref={reviewsRef}>
        <h4>⭐ Reviews</h4>
        <p>"Best latte on the street." · Priya</p>
      </div>
    </div>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check
        label="second render remembers by POSITION"
        run={() => {
          const s = createSlotsSolution();
          s.startRender();
          s.slot('a');
          s.slot('b');
          s.startRender();
          return [s.slot('x'), s.slot('y')];
        }}
        expected={['a', 'b']}
      />
      <Show code="predictedSize" value={predictedSizeSolution} />

      <h3>B · React</h3>
      <CafeCounterSolution />
    </div>
  );
}
