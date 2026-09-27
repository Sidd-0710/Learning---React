// =============================================================================
// LESSON 02 · COMPONENTS
// =============================================================================
//
//   PART 1 · LEARN        modules (import/export), then components
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lesson 01 (JSX, arrow functions, template literals).
//
// What you'll learn
//   JavaScript: modules: import, export, named vs. default, `as`, paths
//   React:      components are functions, capital letters, composition,
//               one component per file, keep them pure
// =============================================================================

// These import lines are REAL examples of what PART 1A explains.
import { version } from 'react'; // a NAMED import from a package
import * as helpers from '../src/helpers.jsx'; // EVERYTHING from a file, as one object
import { Check, Show } from '../src/helpers.jsx'; // two named imports from our own file

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST: MODULES
// =============================================================================
// Real apps are split across many files ("modules"). Each file keeps its code
// PRIVATE unless it EXPORTS it, and other files IMPORT what they need.
//
// ---- NAMED exports: put `export` in front of a declaration --------------------
//
//   // prices.js
//   export const TAX_RATE = 0.08;
//   export const formatPrice = (amount) => `$${amount.toFixed(2)}`;
//   const secretRecipe = '…';          ← no export = private to this file
//
//   // another file: import with { } and the EXACT names
//   import { TAX_RATE, formatPrice } from './prices.js';
//
// ---- The DEFAULT export: at most ONE per file, the file's "main thing" -------
//
//   // MenuItem.jsx
//   export default function MenuItem() { … }
//
//   // another file: NO { }, and you may pick any name you like
//   import MenuItem from './MenuItem.jsx';
//
// ---- Renaming, and importing everything ---------------------------------------
//
//   import { formatPrice as money } from './prices.js';   // use it as money()
//   import * as prices from './prices.js';                // prices.formatPrice, prices.TAX_RATE
//   import MenuItem, { helper } from './MenuItem.jsx';     // default + named together
//
// ---- Paths -------------------------------------------------------------------
//
//   './prices.js'   starts with ./ or ../ → a file, relative to THIS file
//                   ('./' = same folder, '../' = one folder up)
//   'react'         no dot → a package installed in node_modules
//
// Two more facts:
//   • A module's code runs only ONCE, however many files import it.
//   • Imports go at the top of the file.
//
// THIS file is a module too. Look at the bottom of each PART: it exports
// `Lesson` as the default, plus named exports `Assignments`, `Experiments` and
// `Solutions`. The lesson viewer imports all four to build this page.

// =============================================================================
// 1B · THE REACT PART: COMPONENTS
// =============================================================================

// -----------------------------------------------------------------------------
// A component is just a function that returns JSX
// -----------------------------------------------------------------------------
// That's the whole definition. Arrow function or `function`: both work.
function ShopHeader() {
  return (
    <header>
      <h3 style={{ margin: 0 }}>☕ Corner Café</h3>
      <p className="muted" style={{ margin: 0 }}>
        Fresh coffee since 2019
      </p>
    </header>
  );
}

const OpeningHours = () => <p>Open daily, 7am – 6pm</p>;

// -----------------------------------------------------------------------------
// Components can run JavaScript before they return
// -----------------------------------------------------------------------------
function TodaysDate() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const dayNumber = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayNumber === 0 || dayNumber === 6;
  return (
    <p>
      Today is {today}. {isWeekend ? '🥐 Weekend brunch menu is on!' : 'Weekday menu.'}
    </p>
  );
}

// -----------------------------------------------------------------------------
// Composition: components inside components
// -----------------------------------------------------------------------------
// Use a component like an HTML tag. Self-close it if it has nothing inside.
// MenuItem is written once and used three times: reuse!
function MenuItem() {
  return (
    <li className="card" style={{ listStyle: 'none' }}>
      Latte · $4.50
    </li>
  );
}

function Menu() {
  return (
    <section>
      <h4>Menu</h4>
      <ul style={{ padding: 0 }}>
        <MenuItem />
        <MenuItem />
        <MenuItem />
      </ul>
      <p className="muted">
        Hmm, all three say "Latte". A component that always shows the same thing isn't very reusable. Lesson 03
        (props) fixes exactly this.
      </p>
    </section>
  );
}

function ShopFooter() {
  return <footer className="muted">© Corner Café · 12 Bean Street</footer>;
}

// The top-level component reads like an outline of the page.
function ShopPage() {
  return (
    <div className="card">
      <ShopHeader />
      <OpeningHours />
      <TodaysDate />
      <Menu />
      <ShopFooter />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Why the capital letter?
// -----------------------------------------------------------------------------
//   <menu />  → lowercase: a built-in HTML element called "menu"
//   <Menu />  → Capitalized: YOUR component, the Menu function above
// Name a component `menu` and React quietly renders an HTML <menu> tag instead
// of calling your function. Always capitalize components.

// -----------------------------------------------------------------------------
// Where do components live? (modules again!)
// -----------------------------------------------------------------------------
// In real projects: usually one component per file, as the default export:
//
//   // src/components/ShopHeader.jsx
//   export default function ShopHeader() { return <header>…</header>; }
//
//   // src/App.jsx
//   import ShopHeader from './components/ShopHeader.jsx';
//   export default function App() { return <ShopHeader />; }
//
// This curriculum keeps each lesson in ONE file so you can read it top to
// bottom. In your own projects, split them up.

// -----------------------------------------------------------------------------
// Two rules to follow from day one
// -----------------------------------------------------------------------------
// Rule 1. Keep components PURE. Same inputs → same JSX, and don't change
//   anything outside the component while rendering (no editing global
//   variables, no changing the DOM by hand). React may call your function many
//   times, so it must be safe to call.
//
// Rule 2. Define components at the TOP LEVEL of a file, never inside another:
//
//     function Menu() {
//       function MenuItem() { … }   ❌ a brand-new component on every render
//       return <MenuItem />;
//     }
//
//   That makes React throw away and rebuild that part of the page every time,
//   losing anything typed or selected there. Keep them side by side instead.

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript you need first: modules</h2>
      <p>The three import lines at the top of this file are real. Here's what they brought in:</p>
      <Show code="version   (named import from 'react')" value={version} />
      <Show code="Object.keys(helpers)   (import * as helpers)" value={Object.keys(helpers)} />
      <Show code="helpers.Show === Show   (same function, two ways in)" value={helpers.Show === Show} />
      <p className="muted">
        A module runs once, however many times it's imported. That's why <code>helpers.Show</code> and{' '}
        <code>Show</code> are the very same function.
      </p>

      <h2>1B · The React part: components</h2>
      <p className="muted">Everything in this box is made of the small components defined in PART 1B:</p>
      <ShopPage />

      <h3>The component tree</h3>
      <pre>{`Lesson
└── ShopPage
    ├── ShopHeader
    ├── OpeningHours
    ├── TodaysDate
    ├── Menu
    │   ├── MenuItem
    │   ├── MenuItem
    │   └── MenuItem
    └── ShopFooter`}</pre>
      <p className="muted">
        Install the React Developer Tools browser extension: its Components tab shows this same tree.
      </p>

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>When do you use {'{ }'} in an import, and when don't you?</li>
        <li>How many default exports can a file have? How many named ones?</li>
        <li>What's the difference between './utils.js' and 'utils'?</li>
        <li>What's the minimum a function needs to be a component?</li>
        <li>What happens if you write &lt;shopHeader /&gt; (lowercase)?</li>
        <li>Why shouldn't you define a component inside another component?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 20 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: write the import/export lines
// -----------------------------------------------------------------------------
// Write each answer as a STRING, exactly as you'd type the line in a file.
// (Quotes, semicolons and extra spaces don't matter to the check.)

// A1. menu.js contains:   export const menu = [ … ];
//     Write the line that imports `menu` from './menu.js'.
const answerA1 = 'TODO';

// A2. MenuItem.jsx contains:   export default function MenuItem() { … }
//     Write the line that imports it (as MenuItem) from './MenuItem.jsx'.
const answerA2 = 'TODO';

// A3. prices.js contains:   export const formatPrice = …
//     Import formatPrice from './prices.js', but RENAME it to `money`.
const answerA3 = 'TODO';

// A4. Write the line that declares  const TAX_RATE = 0.08  AND makes it a
//     named export, in one line.
const answerA4 = 'TODO';

// A5. How many default exports can one file have? (a number)
const answerA5 = 'TODO';

// Makes answers comparable: ' and " both become ', no semicolons, single spaces.
const normalize = (line) =>
  String(line)
    .replace(/["`]/g, "'")
    .replace(/;/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\{\s*/g, '{ ')
    .replace(/\s*\}/g, ' }')
    .trim();

// -----------------------------------------------------------------------------
// B · React: break up the Corner Café page
// -----------------------------------------------------------------------------
// CafePage below is ONE big component. It works, but it's hard to read and
// nothing can be reused. Split it into components WITHOUT changing what's on
// screen:
//
//   B1. CafeHeader       → the <header> part
//   B2. SpecialOfTheDay  → the yellow "special" box
//   B3. DrinkList        → the drinks <section>
//   B4. FoodList         → the food <section>
//   B5. CafeFooter       → the <footer>
//   B6. Make CafePage use them, so its return reads like an outline:
//         <div className="card">
//           <CafeHeader />
//           <SpecialOfTheDay />
//           …
//   B7. Bonus: move the special's price into a variable INSIDE
//       SpecialOfTheDay and render it with { }.
//
// Remember: capital letters, every component at the top level (not inside
// another one), and each returns ONE parent element.
//
// How to check: the page looks exactly the same as before you started, and
// CafePage's return is short. (React DevTools shows your new components.)
function CafePage() {
  return (
    <div className="card">
      <header>
        <h3 style={{ margin: 0 }}>☕ Corner Café</h3>
        <p className="muted" style={{ margin: 0 }}>
          Good coffee, good company
        </p>
      </header>

      <div className="card" style={{ background: '#fff6d6', color: '#5a4300' }}>
        <strong>Special of the day:</strong> Pumpkin Spice Latte · $5.25
      </div>

      <section>
        <h4>Drinks</h4>
        <ul>
          <li>Coffee · $3.50</li>
          <li>Latte · $4.50</li>
          <li>Tea · $2.75</li>
        </ul>
      </section>

      <section>
        <h4>Food</h4>
        <ul>
          <li>Bagel · $2.25</li>
          <li>Muffin · $2.75</li>
        </ul>
      </section>

      <footer className="muted">Open daily 7am – 6pm · 12 Bean Street</footer>
    </div>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript: import & export lines</h3>
      <Check label="A1 · import menu" run={() => normalize(answerA1)} expected={normalize("import { menu } from './menu.js'")} />
      <Check label="A2 · import MenuItem" run={() => normalize(answerA2)} expected={normalize("import MenuItem from './MenuItem.jsx'")} />
      <Check
        label="A3 · import formatPrice as money"
        run={() => normalize(answerA3)}
        expected={normalize("import { formatPrice as money } from './prices.js'")}
      />
      <Check label="A4 · export TAX_RATE" run={() => normalize(answerA4)} expected={normalize('export const TAX_RATE = 0.08')} />
      <Check label="A5 · default exports per file" run={() => Number(answerA5)} expected={1} />

      <h3>B · React: the café page</h3>
      <CafePage />
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
        Add a fourth <code>&lt;MenuItem /&gt;</code> inside <code>Menu</code>.
      </li>
      <li>
        Rename <code>OpeningHours</code> to <code>openingHours</code> (lowercase) everywhere it appears. Check the
        console, and notice it no longer renders.
      </li>
      <li>
        Make a new <code>Announcement</code> component ("🎉 Free cookie with every latte today!") and put it at the
        top of <code>ShopPage</code>.
      </li>
      <li>
        Change the top import to <code>{"import { versoin } from 'react'"}</code> (misspelled). Read the error in
        the console, then fix it.
      </li>
      <li>
        Remove <code>export</code> from <code>export function Experiments</code> and save. This part now says the
        lesson "doesn't have this part", because the viewer can no longer import it. Put it back.
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

const solutionA1 = "import { menu } from './menu.js';";
const solutionA2 = "import MenuItem from './MenuItem.jsx';"; // default import: no { }
const solutionA3 = "import { formatPrice as money } from './prices.js';";
const solutionA4 = 'export const TAX_RATE = 0.08;';
const solutionA5 = 1; // one default export at most; as many named exports as you like

function CafeHeaderSolution() {
  return (
    <header>
      <h3 style={{ margin: 0 }}>☕ Corner Café</h3>
      <p className="muted" style={{ margin: 0 }}>
        Good coffee, good company
      </p>
    </header>
  );
}

function SpecialOfTheDaySolution() {
  const price = 5.25; // B7: logic lives inside the component, before the return
  return (
    <div className="card" style={{ background: '#fff6d6', color: '#5a4300' }}>
      <strong>Special of the day:</strong> Pumpkin Spice Latte · ${price.toFixed(2)}
    </div>
  );
}

function DrinkListSolution() {
  return (
    <section>
      <h4>Drinks</h4>
      <ul>
        <li>Coffee · $3.50</li>
        <li>Latte · $4.50</li>
        <li>Tea · $2.75</li>
      </ul>
    </section>
  );
}

function FoodListSolution() {
  return (
    <section>
      <h4>Food</h4>
      <ul>
        <li>Bagel · $2.25</li>
        <li>Muffin · $2.75</li>
      </ul>
    </section>
  );
}

function CafeFooterSolution() {
  return <footer className="muted">Open daily 7am – 6pm · 12 Bean Street</footer>;
}

function CafePageSolution() {
  return (
    <div className="card">
      <CafeHeaderSolution />
      <SpecialOfTheDaySolution />
      <DrinkListSolution />
      <FoodListSolution />
      <CafeFooterSolution />
    </div>
  );
}
// Notice DrinkList and FoodList look almost identical. Wouldn't it be nice to
// write ONE component and pass in the title and items? That's props: lesson 03.

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript: import & export lines</h3>
      <Show code="A1" value={solutionA1} />
      <Show code="A2" value={solutionA2} />
      <Show code="A3" value={solutionA3} />
      <Show code="A4" value={solutionA4} />
      <Show code="A5" value={solutionA5} />

      <h3>B · React: the café page</h3>
      <CafePageSolution />
    </div>
  );
}
