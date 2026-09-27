# React from the Ground Up

A step-by-step React course for people who know basic JavaScript (variables,
functions, `if`, loops).

There are **13 lessons, one file each**. When a React topic needs a
JavaScript idea you may not know yet (arrow functions, destructuring,
promises…), that idea is taught **inside the same file**, right before the
React part that uses it. Nothing is split into separate folders.

Throughout the course you'll build pieces of an ordering app for an imaginary
café, **Corner Café**.

---

## ⚠️ The one rule: go in order

**Do the lessons in order, and don't skip ahead.** Each lesson uses ideas from
the lessons before it, and never assumes something from a later one. If a
lesson feels confusing, the fix is almost always in an earlier lesson.

Before starting the next lesson, check the **"You're ready to move on when…"**
list for the current one (below). The viewer tracks your progress, locks 🔒
lessons ahead of you, and warns you if you jump forward.

---

## Setup (once)

You need **Node.js 20 or newer** (`node -v` to check).

```bash
cd react-curriculum
npm install
npm run dev      # opens http://localhost:5173 in your browser
```

Open the lesson file in your editor next to the browser. Every time you save,
the page updates instantly.

Also recommended:

- Keep the **browser console** open (Cmd+Option+J on Mac, Ctrl+Shift+J on Windows).
- Install the **React Developer Tools** browser extension (lessons 02 and 13 use it).
- `npm run lint` checks your code for common React mistakes (lesson 10 uses it).

---

## How every lesson file works

Every file in `lessons/` has the same four parts, in the same order, and the
page in the browser shows them in that order too:

| Part | What's in it | What you do |
|---|---|---|
| **1 · Learn** | **1A:** the JavaScript this lesson needs, with runnable code. **1B:** the React concept, with runnable code. | Read the file top to bottom. Every example's result is shown on the page. Answer the "Quick check" questions out loud. |
| **2 · Assignments** | **A:** small JavaScript tasks with automatic ✅/❌ checks. **B:** a React task for the café app, with a "How to check" list. | Replace the `TODO`s in the file. The page updates on every save. About 20–25 minutes. |
| **3 · Experiments** | Small changes to make to the Part 1 code. | Change it, save, watch what happens (and what error appears), then undo. |
| **4 · Solutions** | Finished versions of every assignment, at the very bottom of the file. | Only after you've tried! On the page they stay hidden until you click "Show the solutions". |

**Stuck?** Re-read the Part 1 section the task points to. Read the error
message word by word. Add `console.log` to see your actual values. After 10
minutes, peek at *one line* of the solution, then keep going yourself.

---

## Folder structure

```
react-curriculum/
├── README.md               ← you are here
├── lessons/                ← everything you study and edit
│   ├── 01-jsx.jsx
│   ├── 02-components.jsx
│   ├── 03-props.jsx
│   ├── 04-events.jsx
│   ├── 05-state.jsx
│   ├── 06-conditional-rendering.jsx
│   ├── 07-lists-and-keys.jsx
│   ├── 08-forms.jsx
│   ├── 09-useEffect.jsx
│   ├── 10-hooks-and-refs.jsx
│   ├── 11-context.jsx
│   ├── 12-custom-hooks.jsx
│   └── 13-performance.jsx
└── src/                    ← the lesson viewer app (you don't need to edit it)
```

---

## The learning path

| # | File | JavaScript taught inside | React taught | Café assignment |
|---|---|---|---|---|
| 01 | `01-jsx.jsx` | `const`/`let`, arrow functions, template literals, the ternary | JSX, `{ }` expressions, `className`/`style`, fragments, what renders | Price helpers + a menu card built from variables |
| 02 | `02-components.jsx` | Modules: `import`/`export`, named vs. default | Components, capital letters, composition, purity | Write import lines + split a big page into components |
| 03 | `03-props.jsx` | Objects, destructuring, shorthand properties, spread/rest | Props, defaults, `children`, read-only props | Receipt helpers + reusable `MenuItem`/`PriceTag`/`MenuSection` |
| 04 | `04-events.jsx` | Functions as values, callbacks, passing vs. calling, closures | `onClick`, arguments, the event object, `preventDefault`, bubbling | Order-number generator + wire up the order screen |
| 05 | `05-state.jsx` | Array destructuring, references, immutable updates, snapshots | `useState`, re-renders, updater functions, lifting state up | Immutable order updates + quantity picker and shared cart |
| 06 | `06-conditional-rendering.jsx` | Truthy/falsy, `&&`, `\|\|`, `??`, `?.` | Early returns, ternaries, `&&` (and the `0` bug), `null`, status values | Labels and safe lookups + sold-out badges and a closed café |
| 07 | `07-lists-and-keys.jsx` | `map`, `filter`, `find`, `some`, `reduce`, `toSorted` | Rendering lists, **keys**, derived data, arrays in state | Menu and order helpers + a filterable menu with a working cart |
| 08 | `08-forms.jsx` | Strings vs. numbers, string methods, `{ [key]: value }`, `Object.keys` | Controlled inputs, every input type, validation, submit | Form helpers + the checkout form |
| 09 | `09-useEffect.jsx` | Timers, promises, `async`/`await`, `try`/`catch`, `fetch` | `useEffect`, dependencies, cleanup, StrictMode, fetching data | Promise helpers + load the menu, retry, tab title, countdown |
| 10 | `10-hooks-and-refs.jsx` | How hooks work underneath (a mini React from closures + an array) | Rules of Hooks, `useRef` for DOM and silent values | Rebuild the slot store + fix a hooks bug, autofocus, timer |
| 11 | `11-context.jsx` | Objects holding functions, no-op defaults, `?.()` | Prop drilling, `createContext`, providers, `useContext` | Bundles of data and functions + refactor the cart into a provider |
| 12 | `12-custom-hooks.jsx` | JSON, `localStorage`, lazy values | `useToggle`, `useWindowWidth`, `useLocalStorage`, `useFetch` | Save/load helpers + write four custom hooks |
| 13 | `13-performance.jsx` | `===` on objects/functions, shallow comparison, timing | Measuring, moving state down, `memo`, `useCallback`, `useMemo` | `sameProps`/`rememberLast` + speed up a wasteful menu board |

---

## "You're ready to move on when…"

**01 · JSX**
- Write arrow functions (including one-liners) and explain why `() => { name: 'x' }` returns `undefined`.
- Build strings with `${}` and pick values with a ternary.
- Embed values in JSX; use `className`, `style={{ }}` and fragments correctly.

**02 · Components**
- Write named and default imports/exports, and explain `'./file.js'` vs `'react'`.
- Split a UI into small components; explain the capital letter and the purity rule.

**03 · Props**
- Destructure objects (with renaming and defaults), including in a parameter list.
- Pass strings, numbers, booleans, objects and `children` as props; never change props.

**04 · Events**
- Explain the difference between `onClick={fn}` and `onClick={fn()}`.
- Explain a closure in one sentence; pass arguments to handlers with an arrow.
- Use `event.target.value`, `event.key` and `preventDefault()`; let a child call a parent's function.

**05 · State**
- Explain why `const b = a; b.push(1)` changes `a`, and update arrays/objects without mutating.
- Use `useState`; explain why `setCount(count + 1)` three times adds 1, and fix it.
- Lift state up to share it between siblings.

**06 · Conditional rendering**
- Predict `0 && 'hi'`, `'' || 'x'`, `0 ?? 5`, `obj?.a?.b`.
- Choose between early returns, ternaries, `&&` and `null`; spot the `{count && …}` bug.

**07 · Lists & keys**
- Pick the right array method for a task; update with `map` + spread, remove with `filter`.
- Render lists with stable keys and explain the index-key bug.
- Tell derived data (calculate it) from state (store it).

**08 · Forms**
- Convert typed text to numbers safely; update any field with `{ ...form, [name]: value }`.
- Build controlled text, number, select, checkbox, radio and textarea inputs; validate on submit.

**09 · useEffect**
- Explain promise states; use `.then/.catch`, `async/await`, `try/catch` and `Promise.all`.
- Choose the right dependency array; write cleanups; fetch data with loading/error/success.
- Explain why effects run twice in development.

**10 · Hooks & refs**
- State the Rules of Hooks and explain, using the mini React, why order matters.
- Use `useRef` for DOM access and for values that shouldn't re-render.

**11 · Context**
- Create a context, provide a value (data + functions), and read it anywhere below.
- Judge when plain props are the better choice.

**12 · Custom hooks**
- Save and load data with `JSON` + `localStorage`, safely.
- Extract repeated stateful logic into a `use…` function; explain why two users of it don't share state.

**13 · Performance**
- Explain why `{ a: 1 } === { a: 1 }` is false and how `memo` compares props.
- Measure first, then fix in order: move state down → `memo` → `useCallback`/`useMemo`.

---

## Why this order?

The order follows **dependencies**, so nothing is used before it's taught:

- **Event handling (04) comes before state (05).** State is only useful once
  something can change it. Lesson 04 ends with a counter that "should" work but
  doesn't, which is exactly the problem `useState` solves.
- **Conditional rendering, lists and forms (06–08) come before `useEffect` (09).**
  Loading data needs "Loading…" messages and rendering what arrives.
- **The Rules of Hooks (10) come after you've used two hooks.** They make much
  more sense once you've used `useState` and `useEffect` in practice.

---

## When you finish

1. **Read `src/LessonViewer.jsx`.** It's the app you've used the whole time, and
   you now understand nearly every line (`lazy`, `Suspense` and the error
   boundary are the only new bits, and they're commented).
2. **Build something of your own** from scratch with `npm create vite@latest`:
   a recipe box, a habit tracker, a movie watchlist using a free API.
3. **Then** move on to what this course deliberately leaves out: routing (React
   Router), TypeScript, testing, state-management libraries, and frameworks
   like Next.js. They all build on everything here.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| A red "This part crashed" box | Read the message, fix the file, save. The page recovers on its own. |
| The whole lesson shows errors | Something in the file failed while loading (often a syntax error). Check the terminal running `npm run dev`. |
| `does not provide an export named 'x'` | You're importing a name that file doesn't export. Check the spelling. |
| `npm run lint` shows 2 errors in lesson 10 | Those are the deliberate bugs in assignment B1. Fix them! |
| Port 5173 is busy | Vite picks the next free port. Use the URL it prints. |
| Reset your progress | Untick lessons in the viewer, or clear the site's storage in DevTools. |
