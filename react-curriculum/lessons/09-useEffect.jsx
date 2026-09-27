// =============================================================================
// LESSON 09 · SIDE EFFECTS (useEffect)
// =============================================================================
//
//   PART 1 · LEARN        timers, promises, async/await, fetch, then useEffect
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–08 (status values from lesson 06!).
// Keep the console open: several demos log there.
//
// What you'll learn
//   JavaScript: setTimeout/setInterval, promises (.then/.catch/.finally),
//               new Promise, Promise.all, async/await, try/catch, fetch
//   React:      useEffect, dependency arrays, cleanup, StrictMode's double
//               run, fetching with loading/error/success, when NOT to use effects
// =============================================================================

import { useEffect, useState } from 'react';
import { CheckAsync, Show, ShowAsync } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST: ASYNCHRONOUS CODE
// =============================================================================
// Some things take time: loading data from a server, waiting for a timer.
// JavaScript never freezes to wait. It schedules the slow thing and moves on.

// -----------------------------------------------------------------------------
// Timers: JavaScript doesn't wait
// -----------------------------------------------------------------------------
// setTimeout(fn, ms)  → call fn ONCE, ms milliseconds from now
// setInterval(fn, ms) → call fn EVERY ms milliseconds, until clearInterval(id)
function timerOrderDemo() {
  return new Promise((resolve) => {
    const log = [];
    log.push('A: ordering coffee');
    setTimeout(() => {
      log.push('B: coffee is ready (after 100ms)');
      resolve(log);
    }, 100);
    log.push('C: reading the paper while we wait');
  });
}
// Result order: A, C, B. So how do we say "WHEN it's done, THEN do this"?

// -----------------------------------------------------------------------------
// Promises: a placeholder for a value that arrives later
// -----------------------------------------------------------------------------
// A Promise is always in one of three states:
//   pending   → still waiting
//   fulfilled → it worked; here's the value   (also called "resolved")
//   rejected  → it failed; here's the error
//
// A pretend café server. Each function returns a Promise.
const MENU_DATA = [
  { id: 1, name: 'Coffee', price: 3.5 },
  { id: 2, name: 'Bagel', price: 2.25 },
  { id: 4, name: 'Muffin', price: 2.75 },
];

// Creating a promise: new Promise((resolve, reject) => { … }). Call resolve(value)
// when it works, reject(error) when it fails. (Mostly you CONSUME promises that
// something else made, like fetch. But wrapping setTimeout is a handy trick.)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fetchMenu() {
  return new Promise((resolve) => setTimeout(() => resolve(MENU_DATA), 300));
}

function fetchItem(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const item = MENU_DATA.find((menuItem) => menuItem.id === id);
      if (item) resolve(item);
      else reject(new Error(`No menu item with id ${id}`));
    }, 200);
  });
}

// Consuming a promise:
//   .then(value => …)   runs when it fulfills
//   .catch(error => …)  runs when it rejects
//   .finally(() => …)   runs either way
const menuPromise = fetchMenu(); // right away we only get a pending Promise
const countItems = () => fetchMenu().then((menu) => `${menu.length} items`);
const catchDemo = () => fetchItem(99).then((item) => item.name).catch((error) => `caught: ${error.message}`);

function loadingDemo() {
  const log = [];
  let isLoading = true; // the same idea as a "Loading…" message
  log.push(`isLoading: ${isLoading}`);
  return fetchItem(99)
    .then((item) => log.push(`got ${item.name}`))
    .catch((error) => log.push(`error: ${error.message}`))
    .finally(() => {
      isLoading = false;
      log.push(`isLoading: ${isLoading}`);
    })
    .then(() => log);
}

// Chaining: each .then gets what the previous one RETURNED. Return a promise
// and the chain waits for it.
const chainDemo = () =>
  fetchMenu()
    .then((menu) => menu.filter((item) => item.price < 3))
    .then((cheapItems) => cheapItems.map((item) => item.name));

// Promise.all: start several at once, wait for ALL of them (results in order).
const allDemo = () => Promise.all([fetchItem(1), fetchItem(2), fetchItem(4)]).then((items) => items.map((item) => item.name));

// -----------------------------------------------------------------------------
// async / await: the same promises, written top to bottom
// -----------------------------------------------------------------------------
// Put `async` before a function, and inside it `await` a promise to get its value.
async function getNameWithAwait(id) {
  const item = await fetchItem(id); // pauses THIS function ~200ms; the rest of the app keeps going
  return item.name;
}

const nameOfItem2 = () => getNameWithAwait(2);

// An async function ALWAYS returns a Promise, even if it returns a plain value.
async function giveMeFive() {
  return 5;
}

// Errors: a rejected promise, when awaited, THROWS. Catch it with try/catch.
async function tryCatchDemo(id) {
  const log = ['loading…'];
  try {
    const item = await fetchItem(id);
    log.push(`✅ show ${item.name}`);
  } catch (error) {
    log.push(`❌ show error: ${error.message}`);
  } finally {
    log.push('done loading');
  }
  return log;
}
const tryCatchSuccess = () => tryCatchDemo(1);
const tryCatchFailure = () => tryCatchDemo(99);

// Sequential vs. parallel.
const roundTo100 = (ms) => Math.round(ms / 100) * 100;
async function sequentialDemo() {
  const start = Date.now();
  const a = await fetchItem(1); // wait…
  const b = await fetchItem(2); // …then wait…
  const c = await fetchItem(4); // …then wait again: ~600ms
  return `${a.name}, ${b.name}, ${c.name} in ~${roundTo100(Date.now() - start)}ms`;
}
async function parallelDemo() {
  const start = Date.now();
  const [a, b, c] = await Promise.all([fetchItem(1), fetchItem(2), fetchItem(4)]); // all at once: ~200ms
  return `${a.name}, ${b.name}, ${c.name} in ~${roundTo100(Date.now() - start)}ms`;
}
// Rule of thumb: if request B doesn't NEED A's result, run them in parallel.

// -----------------------------------------------------------------------------
// fetch: a real network request
// -----------------------------------------------------------------------------
// fetch returns a Promise of a Response; await response.json() to read the data.
// ⚠️ fetch only REJECTS on network failure. A 404 or 500 still "succeeds", so
// always check response.ok yourself.
async function realFetchDemo() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    const user = await response.json();
    return `${user.name} from ${user.address.city}`;
  } catch (error) {
    return `Could not fetch (offline?): ${error.message}`; // the catch doing its job
  }
}

// =============================================================================
// 1B · THE REACT PART: useEffect
// =============================================================================
// Components must be PURE (lesson 02): same props/state in → same JSX out. But
// apps also need to talk to the outside world: load data, start timers, change
// the page title. That code goes in an EFFECT, which runs AFTER React has
// updated the screen.

// -----------------------------------------------------------------------------
// Your first effect: keep the page title in sync with state
// -----------------------------------------------------------------------------
function TitleSync() {
  const [cups, setCups] = useState(0);
  // useEffect(function, dependencies). [cups] means: re-run only when cups changed.
  useEffect(() => {
    document.title = `☕ ${cups} cups · React Curriculum`;
  }, [cups]);
  return (
    <div className="row">
      <button onClick={() => setCups((c) => c + 1)}>Add a cup</button>
      <span>Cups: {cups}. Now look at your browser tab's title ↑</span>
    </div>
  );
}
// Why not write document.title = … right in the component body? Rendering must
// be pure: React may render and throw the result away, or render twice.
// Effects run only once the screen has actually been updated.

// -----------------------------------------------------------------------------
// The dependency array: three forms
// -----------------------------------------------------------------------------
//   useEffect(fn)          → after EVERY render            (rarely what you want)
//   useEffect(fn, [])      → once, after the FIRST render  ("on mount")
//   useEffect(fn, [a, b])  → after the first render, then whenever a or b changes
function DependencyDemo() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  useEffect(() => {
    console.log('🔁 (no array) runs after every render');
  });
  useEffect(() => {
    console.log('1️⃣ ([]) runs once, when the component first appears');
  }, []);
  useEffect(() => {
    console.log(`🎯 ([count]) runs because count is ${count}`);
  }, [count]);

  return (
    <div className="row">
      <button onClick={() => setCount((c) => c + 1)}>count: {count}</button>
      <button onClick={() => setOther((o) => o + 1)}>other: {other}</button>
      <span className="muted">Click each and watch the console.</span>
    </div>
  );
}
// Rule: every value from the component that the effect USES belongs in the
// array. `npm run lint` warns you when one is missing. Trust it.

// -----------------------------------------------------------------------------
// Cleanup: undoing what the effect started
// -----------------------------------------------------------------------------
function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    console.log('⏱️ LiveClock: interval started');
    const intervalId = setInterval(() => setTime(new Date()), 1000);
    // The function you RETURN is the cleanup. React calls it when the component
    // disappears (and before re-running the effect).
    return () => {
      console.log('🧹 LiveClock: interval cleared');
      clearInterval(intervalId);
    };
  }, []);
  return <p style={{ fontVariantNumeric: 'tabular-nums' }}>🕰️ {time.toLocaleTimeString()}</p>;
}
// Without cleanup, the interval would keep running after the clock is gone.
// Anything you start in an effect (intervals, listeners, connections), stop
// in its cleanup.

function ClockToggle() {
  const [showClock, setShowClock] = useState(true);
  return (
    <div className="card">
      <button onClick={() => setShowClock((s) => !s)}>{showClock ? 'Hide clock' : 'Show clock'}</button>
      {showClock && <LiveClock />}
    </div>
  );
}

// -----------------------------------------------------------------------------
// "Why does my effect run TWICE?" (StrictMode)
// -----------------------------------------------------------------------------
// In development only, <StrictMode> (src/main.jsx) mounts each component,
// immediately unmounts it, and mounts it again. So the console shows:
//   ⏱️ started → 🧹 cleared → ⏱️ started
// It's a stress test: with proper cleanup, running twice is harmless. Without
// it (two intervals ticking at once!), you notice the bug now instead of in
// production. Production builds run effects once.

// -----------------------------------------------------------------------------
// Fetching data: 1A's async/await + lesson 06's status + useEffect
// -----------------------------------------------------------------------------
function UserCard() {
  const [userId, setUserId] = useState(1);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // The effect function itself can't be async (it must return a cleanup or
    // nothing, not a Promise). So define an async function inside and call it.
    let ignore = false;

    async function loadUser() {
      setStatus('loading');
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const data = await response.json();
        if (!ignore) {
          setUser(data);
          setStatus('success');
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message);
          setStatus('error');
        }
      }
    }

    loadUser();
    // Race-condition guard: if userId changes before this request finishes,
    // cleanup sets ignore = true so the OLD response can't overwrite the new one.
    return () => {
      ignore = true;
    };
  }, [userId]); // re-fetch whenever userId changes

  return (
    <div className="card">
      <label>
        Customer #
        <select value={userId} onChange={(e) => setUserId(Number(e.target.value))}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </label>
      {status === 'loading' && <p>⏳ Loading customer…</p>}
      {status === 'error' && <p className="error">Couldn't load: {errorMessage}. (Are you offline?)</p>}
      {status === 'success' && (
        <p>
          <strong>{user.name}</strong> · {user.email} · {user.address.city}
        </p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// You might NOT need an effect
// -----------------------------------------------------------------------------
// If something can be CALCULATED from props or state, calculate it during render:
//   ❌ const [total, setTotal] = useState(0);
//      useEffect(() => { setTotal(price * qty); }, [price, qty]);
//   ✅ const total = price * qty;
// And code that responds to a USER ACTION belongs in the event handler, not an
// effect. Effects are for syncing with things OUTSIDE React.

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  // Put the title back when you leave this lesson. That's a cleanup too!
  useEffect(() => {
    return () => {
      document.title = 'React Curriculum';
    };
  }, []);

  return (
    <div>
      <h2>1A · The JavaScript you need first: asynchronous code</h2>

      <h3>Timers</h3>
      <ShowAsync code="timerOrderDemo()   (the log, in order)" run={timerOrderDemo} />

      <h3>Promises</h3>
      <Show code="fetchMenu()   (right away)" value={menuPromise} />
      <ShowAsync code="fetchMenu().then((menu) => `${menu.length} items`)" run={countItems} />
      <ShowAsync code="fetchItem(99).then(…).catch((error) => `caught: ${error.message}`)" run={catchDemo} />
      <ShowAsync code="loadingDemo()   (.then / .catch / .finally)" run={loadingDemo} />
      <ShowAsync code="fetchMenu().then(filter cheap).then(map names)" run={chainDemo} />
      <ShowAsync code="Promise.all([fetchItem(1), fetchItem(2), fetchItem(4)])   (names)" run={allDemo} />

      <h3>async / await</h3>
      <ShowAsync code="getNameWithAwait(2)" run={nameOfItem2} />
      <Show code="giveMeFive()   (without await)" value={giveMeFive()} />
      <ShowAsync code="await giveMeFive()" run={giveMeFive} />
      <ShowAsync code="tryCatchDemo(1)" run={tryCatchSuccess} />
      <ShowAsync code="tryCatchDemo(99)" run={tryCatchFailure} />
      <ShowAsync code="sequentialDemo()" run={sequentialDemo} />
      <ShowAsync code="parallelDemo()" run={parallelDemo} />

      <h3>fetch</h3>
      <ShowAsync code="realFetchDemo()" run={realFetchDemo} />

      <h2>1B · The React part: useEffect</h2>

      <h3>Syncing the page title</h3>
      <TitleSync />

      <h3>Dependency arrays (watch the console)</h3>
      <DependencyDemo />

      <h3>Cleanup (and the StrictMode double run)</h3>
      <ClockToggle />

      <h3>Fetching data</h3>
      <UserCard />

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>What are the three states of a Promise?</li>
        <li>What does calling an async function give you back, immediately?</li>
        <li>Why check response.ok after fetch?</li>
        <li>When does an effect with [] run? With [userId]? With no array?</li>
        <li>What's a cleanup function, and when does React call it?</li>
        <li>Why can't you write useEffect(async () =&gt; {'{ … }'})? What does the ignore flag protect against?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 25 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: promises and async/await
// -----------------------------------------------------------------------------

// A1. pause(ms) → a Promise that resolves after `ms` milliseconds.
//     Hint: new Promise((resolve) => setTimeout(…))
const pause = (ms) => {
  // TODO
};

// A2. lookUpItem(id) → a Promise. After 100ms: resolve with the matching item
//     from MENU_DATA, or reject with new Error(`Item ${id} not found`).
const lookUpItem = (id) => {
  // TODO
};

// A3. getItemName(id) → a Promise of just the name. Use lookUpItem and .then.
const getItemName = (id) => {
  // TODO
};

// A4. loadPrice(id) → (async) the price, or null if the lookup fails. Use try/catch.
const loadPrice = async (id) => {
  // TODO
};

// A5. loadOrderSummary(ids) → (async) { count, total } for those items, fetched
//     IN PARALLEL with Promise.all (the check times it!).
//     Hint: ids.map((id) => lookUpItem(id)) gives an array of promises.
const loadOrderSummary = async (ids) => {
  // TODO
};

// -----------------------------------------------------------------------------
// B · React: load the Corner Café menu
// -----------------------------------------------------------------------------
//   B1. Load the menu when CafeMenuLoader appears, with fakeFetchMenu(). Track a
//       status: 'loading' | 'error' | 'success'. Show "Loading menu…", or the
//       error in red + a "Try again" button, or the list (each with "Add").
//   B2. The "Simulate a server error" checkbox is wired to shouldFail. Pass it:
//       fakeFetchMenu({ shouldFail }). The effect USES shouldFail, so it goes in
//       the dependency array.
//   B3. "Try again": a reloadCount state; the button increases it; list it as a
//       dependency so a change triggers a re-fetch.
//   B4. Each "Add" increases cartCount. Keep the tab title in sync:
//       "(3) Corner Café". On unmount, reset it to 'React Curriculum' (cleanup).
//   B5. Countdown "Kitchen closes in 30s", ticking every second with
//       setInterval (clear it in a cleanup). At 0 show "Kitchen closed".
//       ⚠️ Trap: inside setInterval, setSeconds(seconds - 1) gets stuck at 29.
//       Why? (Snapshots, lesson 05!) Use the updater form instead.
//
// How to check: "Loading menu…" for about a second, then the menu. Tick the
// error box → an error. Untick + "Try again" → the menu. The tab title shows
// the cart count. The countdown goes 30, 29, 28… without getting stuck.
const CAFE_MENU = [
  { id: 1, name: 'Coffee', price: 3.5 },
  { id: 2, name: 'Latte', price: 4.5 },
  { id: 3, name: 'Muffin', price: 2.75 },
];

function fakeFetchMenu({ shouldFail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('The café server is having a bad day (500)'));
      else resolve(CAFE_MENU);
    }, 800);
  });
}

function CafeMenuLoader() {
  const [shouldFail, setShouldFail] = useState(false);
  // TODO: menu, status, errorMessage, reloadCount, cartCount, seconds…
  // TODO B1–B3: the fetch effect
  // TODO B4: the title effect
  // TODO B5: the countdown effect

  return (
    <div>
      <label className="card">
        <input type="checkbox" checked={shouldFail} onChange={(e) => setShouldFail(e.target.checked)} />
        Simulate a server error
      </label>
      <div className="card">
        <h4 style={{ marginTop: 0 }}>Menu</h4>
        <p className="muted">TODO: loading / error / list</p>
      </div>
      <div className="card">
        <p>Kitchen closes in 30s</p>
      </div>
    </div>
  );
}

// These are module-level so the checks don't re-run on every render.
const checkPause = async () => {
  const start = Date.now();
  const result = pause(100);
  if (!(result instanceof Promise)) return 'not a Promise';
  await result;
  return Date.now() - start >= 90 ? 'waited ~100ms' : 'too fast';
};
const checkLookUp = () => lookUpItem(1).then((item) => item.name);
const checkLookUpMissing = () => lookUpItem(99);
const checkGetItemName = () => getItemName(4);
const checkLoadPrice = () => loadPrice(2);
const checkLoadPriceMissing = () => loadPrice(99);
const checkSummary = () => loadOrderSummary([1, 2, 4]);
const checkSummaryParallel = async () => {
  const start = Date.now();
  const summary = await loadOrderSummary([1, 2, 4]);
  return summary?.count === 3 && Date.now() - start < 250;
};

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <CheckAsync label="pause(100)" run={checkPause} expected="waited ~100ms" />
      <CheckAsync label="lookUpItem(1).then((item) => item.name)" run={checkLookUp} expected="Coffee" />
      <CheckAsync label="lookUpItem(99)" run={checkLookUpMissing} expected="Rejected: Item 99 not found" />
      <CheckAsync label="getItemName(4)" run={checkGetItemName} expected="Muffin" />
      <CheckAsync label="loadPrice(2)" run={checkLoadPrice} expected={2.25} />
      <CheckAsync label="loadPrice(99)" run={checkLoadPriceMissing} expected={null} />
      <CheckAsync label="loadOrderSummary([1, 2, 4])" run={checkSummary} expected={{ count: 3, total: 8.5 }} />
      <CheckAsync label="loadOrderSummary runs in parallel (~100ms, not ~300ms)" run={checkSummaryParallel} expected={true} />

      <h3>B · React</h3>
      <CafeMenuLoader />
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
        Hide and show the clock a few times, watching the console. Then delete the cleanup's{' '}
        <code>clearInterval</code> line, save, and toggle again. What piles up?
      </li>
      <li>
        In <code>TitleSync</code>, change <code>[cups]</code> to <code>[]</code>. Why does the title stop updating?
      </li>
      <li>
        In <code>UserCard</code>, remove <code>userId</code> from the dependency array and run{' '}
        <code>npm run lint</code>. Read the warning.
      </li>
      <li>
        Change the fetch URL in <code>UserCard</code> to <code>/users/999</code> (a 404). Does the catch block run?
        Why? (Hint: response.ok.)
      </li>
      <li>
        In 1A, change <code>parallelDemo</code> to await the items one by one. How does its time change?
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

const pauseSolution = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const lookUpItemSolution = (id) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const item = MENU_DATA.find((menuItem) => menuItem.id === id);
      if (item) resolve(item);
      else reject(new Error(`Item ${id} not found`));
    }, 100);
  });

// .then returns a NEW promise of whatever the callback returns.
const getItemNameSolution = (id) => lookUpItemSolution(id).then((item) => item.name);

const loadPriceSolution = async (id) => {
  try {
    const item = await lookUpItemSolution(id);
    return item.price;
  } catch {
    return null; // we don't need the error object, so `catch {` is fine
  }
};

const loadOrderSummarySolution = async (ids) => {
  const items = await Promise.all(ids.map((id) => lookUpItemSolution(id))); // all start at once
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return { count: items.length, total };
};

function CafeMenuLoaderSolution() {
  const [shouldFail, setShouldFail] = useState(false);
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [seconds, setSeconds] = useState(30);

  // B1–B3: fetch on mount, and again when shouldFail or reloadCount change.
  useEffect(() => {
    let ignore = false;
    async function loadMenu() {
      setStatus('loading');
      try {
        const data = await fakeFetchMenu({ shouldFail });
        if (!ignore) {
          setMenu(data);
          setStatus('success');
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message);
          setStatus('error');
        }
      }
    }
    loadMenu();
    return () => {
      ignore = true;
    };
  }, [shouldFail, reloadCount]);

  // B4: sync the title; reset it on the way out.
  useEffect(() => {
    document.title = `(${cartCount}) Corner Café`;
  }, [cartCount]);
  useEffect(() => {
    return () => {
      document.title = 'React Curriculum';
    };
  }, []);

  // B5: the updater form always sees the LATEST seconds. A plain
  // setSeconds(seconds - 1) would close over the first render's 30 forever.
  useEffect(() => {
    const intervalId = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <label className="card">
        <input type="checkbox" checked={shouldFail} onChange={(e) => setShouldFail(e.target.checked)} />
        Simulate a server error
      </label>
      <div className="card">
        <h4 style={{ marginTop: 0 }}>Menu · 🛒 {cartCount}</h4>
        {status === 'loading' && <p>Loading menu…</p>}
        {status === 'error' && (
          <div>
            <p className="error">{errorMessage}</p>
            <button onClick={() => setReloadCount((n) => n + 1)}>Try again</button>
          </div>
        )}
        {status === 'success' && (
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {menu.map((item) => (
              <li key={item.id} className="row" style={{ marginBottom: 6 }}>
                {item.name} · ${item.price.toFixed(2)}
                <button onClick={() => setCartCount((c) => c + 1)}>Add</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <p>{seconds > 0 ? `Kitchen closes in ${seconds}s` : '🔒 Kitchen closed'}</p>
      </div>
    </div>
  );
}

const solutionSummaryParallel = async () => {
  const start = Date.now();
  const summary = await loadOrderSummarySolution([1, 2, 4]);
  return summary.count === 3 && Date.now() - start < 250;
};
const solutionLookUpMissing = () => lookUpItemSolution(99);
const solutionGetItemName = () => getItemNameSolution(4);
const solutionLoadPriceMissing = () => loadPriceSolution(99);
const solutionPause = () => pauseSolution(100).then(() => 'waited ~100ms');

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <CheckAsync label="pause(100)" run={solutionPause} expected="waited ~100ms" />
      <CheckAsync label="lookUpItem(99)" run={solutionLookUpMissing} expected="Rejected: Item 99 not found" />
      <CheckAsync label="getItemName(4)" run={solutionGetItemName} expected="Muffin" />
      <CheckAsync label="loadPrice(99)" run={solutionLoadPriceMissing} expected={null} />
      <CheckAsync label="loadOrderSummary runs in parallel" run={solutionSummaryParallel} expected={true} />

      <h3>B · React</h3>
      <CafeMenuLoaderSolution />
    </div>
  );
}
