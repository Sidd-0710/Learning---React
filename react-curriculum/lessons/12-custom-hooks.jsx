// =============================================================================
// LESSON 12 · CUSTOM HOOKS
// =============================================================================
//
//   PART 1 · LEARN        JSON, localStorage & lazy values, then custom hooks
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–11 (effects from lesson 09, rules from 10).
//
// What you'll learn
//   JavaScript: JSON.stringify / JSON.parse, localStorage, try/catch around
//               bad data, lazy values (run a function only the first time)
//   React:      custom hooks: useToggle, useWindowWidth, useLocalStorage, useFetch
// =============================================================================

import { useEffect, useState } from 'react';
import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST
// =============================================================================

// -----------------------------------------------------------------------------
// JSON: turning data into text and back
// -----------------------------------------------------------------------------
// JSON is a text format for data. Use it to store or send objects and arrays.
const preferences = { drink: 'Latte', sugar: 1, extras: ['oat milk'] };
const asText = JSON.stringify(preferences); // object → string
const backToData = JSON.parse(asText); // string → object (a NEW object)

// JSON.parse THROWS on text that isn't valid JSON, so guard it with try/catch:
function parseSafely(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

// -----------------------------------------------------------------------------
// localStorage: the browser's tiny key → text store
// -----------------------------------------------------------------------------
// Survives page reloads, per website. It stores ONLY strings.
//   localStorage.setItem(key, text)   save
//   localStorage.getItem(key)         read (null if missing)
// It can also throw (storage full, or blocked in private windows), so real code
// wraps it in try/catch.
let storedRaw = null;
let storedWrongly = null;
let missing = 'not read';
try {
  localStorage.setItem('lesson12:prefs', JSON.stringify(preferences)); // ✅ stringify first
  storedRaw = localStorage.getItem('lesson12:prefs');
  localStorage.setItem('lesson12:oops', preferences); // ❌ an object gets turned into '[object Object]'
  storedWrongly = localStorage.getItem('lesson12:oops');
  missing = localStorage.getItem('lesson12:never-saved');
} catch {
  storedRaw = '(storage is blocked in this browser)';
}

// -----------------------------------------------------------------------------
// Lazy values: pass a FUNCTION so it can run later, and only once
// -----------------------------------------------------------------------------
// Lesson 04: passing a function hands over the power to decide WHEN to run it.
// This helper runs `getValue` the FIRST time only, then reuses the result.
let timesRead = 0;
const readSavedDrink = () => {
  timesRead = timesRead + 1; // pretend this is slow (like reading storage)
  return 'Latte';
};

function makeLazy(getValue) {
  let done = false;
  let cached;
  return () => {
    if (!done) {
      cached = getValue();
      done = true;
    }
    return cached;
  };
}
const savedDrink = makeLazy(readSavedDrink);
savedDrink();
savedDrink();
savedDrink();
// timesRead is 1. React's useState does the same thing when you pass it a
// function:  useState(() => readSavedDrink())  runs it on the FIRST render only.
// useState(readSavedDrink()) would CALL it on every render and throw away the result.

// =============================================================================
// 1B · THE REACT PART: CUSTOM HOOKS
// =============================================================================
// A custom hook is a function whose name starts with `use` and that calls
// other hooks. It lets you write stateful logic ONCE and reuse it anywhere.

// -----------------------------------------------------------------------------
// useToggle: the smallest useful custom hook
// -----------------------------------------------------------------------------
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue((v) => !v);
  return [value, toggle]; // an array, like useState, so callers pick names
}

function ToggleDemo() {
  // Two calls = two completely separate states. Hooks share LOGIC, not state.
  const [isIced, toggleIced] = useToggle(false);
  const [wantsCream, toggleCream] = useToggle(true);
  return (
    <div className="row">
      <button onClick={toggleIced}>{isIced ? '🧊 Iced' : '🔥 Hot'}</button>
      <button onClick={toggleCream}>Whipped cream: {wantsCream ? 'yes' : 'no'}</button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// useWindowWidth: an effect + cleanup behind a clear name
// -----------------------------------------------------------------------------
function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize); // cleanup (lesson 09)
  }, []);
  return width;
}

function LayoutInfo() {
  const width = useWindowWidth(); // reads like English; HOW is hidden inside
  return (
    <p>
      The window is {width}px wide, so the café would show the <strong>{width < 700 ? 'mobile' : 'desktop'}</strong>{' '}
      menu. Resize the window and watch.
    </p>
  );
}

// -----------------------------------------------------------------------------
// useLocalStorage: state that survives a reload (1A put to work)
// -----------------------------------------------------------------------------
function useLocalStorage(key, initialValue) {
  // LAZY initial state: this function runs on the first render only.
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue; // blocked storage or bad JSON: fall back safely
    }
  });

  // Whenever the value changes, save it. localStorage is outside React, so this
  // is a textbook effect.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or blocked: the app still works, the value just isn't saved
    }
  }, [key, value]);

  return [value, setValue]; // same shape as useState
}

function SavedPreferences() {
  const [favoriteDrink, setFavoriteDrink] = useLocalStorage('lesson12:favorite-drink', 'Latte');
  const [visits, setVisits] = useLocalStorage('lesson12:visits', 0);
  return (
    <div className="card">
      <label>
        Favorite drink
        <select value={favoriteDrink} onChange={(e) => setFavoriteDrink(e.target.value)}>
          <option>Latte</option>
          <option>Cappuccino</option>
          <option>Chai</option>
          <option>Hot chocolate</option>
        </select>
      </label>
      <div className="row" style={{ marginTop: 8 }}>
        <button onClick={() => setVisits((v) => v + 1)}>Record a visit</button>
        <span>Visits: {visits}</span>
      </div>
      <p className="muted">Change these, then reload the page. They're still here!</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// useFetch: lesson 09's loading pattern, reusable
// -----------------------------------------------------------------------------
function useFetch(url) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const json = await response.json();
        if (!ignore) {
          setData(json);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setStatus('error');
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, status, error }; // an object: several named things
}

function CustomerReviews() {
  // Look how small a data-loading component becomes:
  const { data: reviews, status, error } = useFetch('https://jsonplaceholder.typicode.com/comments?postId=1');
  if (status === 'loading') return <p>⏳ Loading reviews…</p>;
  if (status === 'error') return <p className="error">Couldn't load reviews: {error}</p>;
  return (
    <ul>
      {reviews.slice(0, 3).map((review) => (
        <li key={review.id}>
          <strong>{review.email}</strong>: {review.name}
        </li>
      ))}
    </ul>
  );
}

// -----------------------------------------------------------------------------
// Rules and tips
// -----------------------------------------------------------------------------
// • Name MUST start with `use` + a capital letter, so the linter checks the
//   Rules of Hooks inside it (lesson 10). The rules apply inside it too.
// • Custom hooks can call other custom hooks.
// • Return whatever shape is handiest: a value (useWindowWidth), an array
//   (useToggle), or an object (useFetch).
// • A function that calls NO hooks is just a helper: don't name it use…

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript you need first</h2>

      <h3>JSON</h3>
      <Show code="JSON.stringify(preferences)" value={asText} />
      <Show code="JSON.parse(asText)" value={backToData} />
      <Show code="JSON.parse(asText) === preferences   (a NEW object)" value={backToData === preferences} />
      <Show code="parseSafely('{oops', 'fallback')" value={parseSafely('{oops', 'fallback')} />

      <h3>localStorage</h3>
      <Show code="localStorage.getItem('lesson12:prefs')" value={storedRaw} />
      <Show code="setItem(key, anObject) then getItem   ⚠️ forgot to stringify" value={storedWrongly} />
      <Show code="localStorage.getItem('lesson12:never-saved')" value={missing} />

      <h3>Lazy values</h3>
      <Show code="savedDrink()   (called three times)" value={savedDrink()} />
      <Show code="timesRead" value={timesRead} />

      <h2>1B · The React part: custom hooks</h2>

      <h3>useToggle</h3>
      <ToggleDemo />

      <h3>useWindowWidth</h3>
      <LayoutInfo />

      <h3>useLocalStorage</h3>
      <SavedPreferences />

      <h3>useFetch</h3>
      <CustomerReviews />

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>Why must you JSON.stringify before localStorage.setItem?</li>
        <li>What does JSON.parse do with invalid text? How do you protect against it?</li>
        <li>What makes a function a "custom hook"?</li>
        <li>Two components call useToggle(). Do they share the toggled value?</li>
        <li>Why does useLocalStorage pass a FUNCTION to useState?</li>
        <li>You wrote formatPrice(amount). Should it be called useFormatPrice?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 25 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: saving and loading data
// -----------------------------------------------------------------------------
// The checks give you a FAKE storage object with the same getItem/setItem
// methods as localStorage, so your functions are easy to test.

// A1. saveValue(storage, key, value) → store value as JSON text under key.
const saveValue = (storage, key, value) => {
  // TODO
};

// A2. loadValue(storage, key, fallback) → the parsed value; or fallback if the
//     key is missing (getItem gives null) or the text isn't valid JSON.
const loadValue = (storage, key, fallback) => {
  // TODO
};

// A3. once(fn) → returns a new function. The FIRST call runs fn and remembers
//     its result; every later call returns that same result without running fn.
const once = (fn) => {
  // TODO
};

// A tiny storage for the checks (same methods as localStorage).
function createFakeStorage() {
  const data = {};
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, text) => {
      data[key] = String(text); // like the real thing: everything becomes a string
    },
  };
}

// -----------------------------------------------------------------------------
// B · React: tidy up the café with custom hooks
// -----------------------------------------------------------------------------
// The components below already USE four custom hooks. The hooks are fakes
// returning placeholder values, so nothing works yet. Make each hook REAL
// without touching the components:
//
//   B1. useCounter(initialValue, { min, max }) → { count, increment, decrement, reset }
//       count stays between min and max; reset goes back to initialValue.
//   B2. useStoredState(key, initialValue) → [value, setValue], like useState but
//       saved in localStorage (lazy initial read, save in an effect, try/catch).
//   B3. useDocumentTitle(title) → sets document.title when title changes; when
//       the component disappears, resets it to 'React Curriculum'.
//   B4. Bonus: useMenu() → { menu, status, reload } using fakeFetchMenu().
//       status goes 'loading' → 'success'; reload() fetches again.
//       (Hint: a reloadCount state in the effect's dependencies, and set
//       status back to 'loading' inside reload itself.)
//
// How to check: each quantity picker works on its own and respects its limits;
// type a name, pick a drink, RELOAD the page: both are still there; the tab title
// shows "Order for <name>"; the menu shows "Loading…" then the items.
const CAFE_MENU = ['Latte', 'Cappuccino', 'Chai', 'Mocha'];
const fakeFetchMenu = () => new Promise((resolve) => setTimeout(() => resolve(CAFE_MENU), 700));

function useCounter(initialValue, { min = 0, max = Infinity } = {}) {
  // TODO B1
  return { count: initialValue, increment: () => {}, decrement: () => {}, reset: () => {} };
}

function useStoredState(key, initialValue) {
  // TODO B2
  return [initialValue, () => {}];
}

function useDocumentTitle(title) {
  // TODO B3
}

function useMenu() {
  // TODO B4 (bonus)
  return { menu: [], status: 'loading', reload: () => {} };
}

// ---- Components: already written. They just use the hooks above. ----------------
function CafeQuantity({ label }) {
  const { count, increment, decrement, reset } = useCounter(1, { min: 1, max: 5 });
  return (
    <div className="row">
      <span style={{ minWidth: 70 }}>{label}</span>
      <button onClick={decrement}>−</button>
      <strong>{count}</strong>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

function CafeCustomer() {
  const [name, setName] = useStoredState('lesson12:assignment:name', '');
  const [drink, setDrink] = useStoredState('lesson12:assignment:drink', 'Latte');
  useDocumentTitle(name ? `Order for ${name}` : 'Corner Café');
  return (
    <div className="card">
      <label>
        Your name <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>{' '}
      <label>
        Usual drink
        <select value={drink} onChange={(e) => setDrink(e.target.value)}>
          {CAFE_MENU.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function CafeMenuBoard() {
  const { menu, status, reload } = useMenu();
  return (
    <div className="card">
      <strong>Today's menu</strong> <button onClick={reload}>Reload menu</button>
      {status === 'loading' ? <p>Loading…</p> : <p>{menu.join(' · ')}</p>}
    </div>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check
        label="saveValue stores JSON text"
        run={() => {
          const storage = createFakeStorage();
          saveValue(storage, 'order', { drink: 'Chai', qty: 2 });
          return storage.getItem('order');
        }}
        expected='{"drink":"Chai","qty":2}'
      />
      <Check
        label="loadValue reads it back"
        run={() => {
          const storage = createFakeStorage();
          storage.setItem('order', '{"drink":"Chai","qty":2}');
          return loadValue(storage, 'order', null);
        }}
        expected={{ drink: 'Chai', qty: 2 }}
      />
      <Check label="loadValue with a missing key" run={() => loadValue(createFakeStorage(), 'nope', 'fallback')} expected="fallback" />
      <Check
        label="loadValue with broken JSON"
        run={() => {
          const storage = createFakeStorage();
          storage.setItem('order', '{broken');
          return loadValue(storage, 'order', 'fallback');
        }}
        expected="fallback"
      />
      <Check
        label="once(fn) runs fn only the first time"
        run={() => {
          let calls = 0;
          const getDrink = once(() => {
            calls = calls + 1;
            return 'Latte';
          });
          return [getDrink(), getDrink(), calls];
        }}
        expected={['Latte', 'Latte', 1]}
      />

      <h3>B · React</h3>
      <h4>B1 · Quantities</h4>
      <CafeQuantity label="Latte" />
      <CafeQuantity label="Muffin" />
      <h4>B2–B3 · Customer (saved)</h4>
      <CafeCustomer />
      <h4>B4 · Menu</h4>
      <CafeMenuBoard />
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
        Open DevTools → Application → Local Storage and find the <code>lesson12:</code> keys. Edit one by hand,
        then reload the page.
      </li>
      <li>
        Set <code>lesson12:favorite-drink</code> to <code>{'{broken'}</code> in DevTools and reload. Which line of
        useLocalStorage saves the day?
      </li>
      <li>
        In <code>useLocalStorage</code>, change <code>useState(() =&gt; …)</code> to call the function directly. Add a
        <code>console.log</code> inside it and compare how often it runs.
      </li>
      <li>
        Use <code>useFetch</code> a second time to load <code>https://jsonplaceholder.typicode.com/users/2</code> and
        show that user's name.
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

const saveValueSolution = (storage, key, value) => storage.setItem(key, JSON.stringify(value));

const loadValueSolution = (storage, key, fallback) => {
  const text = storage.getItem(key);
  if (text === null) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};

const onceSolution = (fn) => {
  let done = false;
  let result;
  return () => {
    if (!done) {
      result = fn();
      done = true;
    }
    return result;
  };
};

function useCounterSolution(initialValue, { min = 0, max = Infinity } = {}) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount((c) => Math.min(max, c + 1)); // never above max
  const decrement = () => setCount((c) => Math.max(min, c - 1)); // never below min
  const reset = () => setCount(initialValue);
  return { count, increment, decrement, reset };
}

function useStoredStateSolution(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable: carry on without saving
    }
  }, [key, value]);
  return [value, setValue];
}

function useDocumentTitleSolution(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  // A separate effect with [] so the reset happens only on unmount.
  useEffect(() => {
    return () => {
      document.title = 'React Curriculum';
    };
  }, []);
}

function useMenuSolution() {
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('loading');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    fakeFetchMenu().then((items) => {
      if (!ignore) {
        setMenu(items);
        setStatus('success');
      }
    });
    return () => {
      ignore = true;
    };
  }, [reloadCount]);

  // 'loading' is the starting status, which covers the first fetch. For reloads,
  // switch back to 'loading' in the event that causes it (not inside the effect).
  const reload = () => {
    setStatus('loading');
    setReloadCount((n) => n + 1);
  };
  return { menu, status, reload };
}

function CafeQuantitySolution({ label }) {
  const { count, increment, decrement, reset } = useCounterSolution(1, { min: 1, max: 5 });
  return (
    <div className="row">
      <span style={{ minWidth: 70 }}>{label}</span>
      <button onClick={decrement}>−</button>
      <strong>{count}</strong>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

function CafeCustomerSolution() {
  const [name, setName] = useStoredStateSolution('lesson12:solution:name', '');
  const [drink, setDrink] = useStoredStateSolution('lesson12:solution:drink', 'Latte');
  useDocumentTitleSolution(name ? `Order for ${name}` : 'Corner Café');
  return (
    <div className="card">
      <label>
        Your name <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>{' '}
      <label>
        Usual drink
        <select value={drink} onChange={(e) => setDrink(e.target.value)}>
          {CAFE_MENU.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function CafeMenuBoardSolution() {
  const { menu, status, reload } = useMenuSolution();
  return (
    <div className="card">
      <strong>Today's menu</strong> <button onClick={reload}>Reload menu</button>
      {status === 'loading' ? <p>Loading…</p> : <p>{menu.join(' · ')}</p>}
    </div>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check
        label="save then load"
        run={() => {
          const storage = createFakeStorage();
          saveValueSolution(storage, 'order', { drink: 'Chai' });
          return loadValueSolution(storage, 'order', null);
        }}
        expected={{ drink: 'Chai' }}
      />
      <Check label="loadValue with a missing key" run={() => loadValueSolution(createFakeStorage(), 'nope', 'fallback')} expected="fallback" />
      <Check
        label="once(fn) runs fn only the first time"
        run={() => {
          let calls = 0;
          const getDrink = onceSolution(() => {
            calls = calls + 1;
            return 'Latte';
          });
          return [getDrink(), getDrink(), calls];
        }}
        expected={['Latte', 'Latte', 1]}
      />

      <h3>B · React</h3>
      <h4>B1 · Quantities</h4>
      <CafeQuantitySolution label="Latte" />
      <CafeQuantitySolution label="Muffin" />
      <h4>B2–B3 · Customer (saved)</h4>
      <CafeCustomerSolution />
      <h4>B4 · Menu</h4>
      <CafeMenuBoardSolution />
    </div>
  );
}
