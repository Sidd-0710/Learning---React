// =============================================================================
// LESSON 01 · JSX AND RENDERING
// =============================================================================
//
// Every lesson file has the same four parts:
//   PART 1 · LEARN        the JavaScript you need, then the React concept, with code
//   PART 2 · ASSIGNMENTS  your turn: replace the TODOs
//   PART 3 · EXPERIMENTS  things to change in PART 1 to see what happens
//   PART 4 · SOLUTIONS    at the very bottom. Try the assignments first!
//
// Run it:  npm run dev → the browser opens → lesson 01.
// Read this file top to bottom with the page open next to it. When you save,
// the page updates instantly. Keep the browser console open too
// (Cmd+Option+J on Mac, Ctrl+Shift+J on Windows): React prints its warnings there.
//
// What you'll learn
//   JavaScript: const & let, arrow functions, template literals, the ternary
//   React:      JSX, { } expressions, attributes, fragments, what renders, createRoot
// =============================================================================

import { createElement } from 'react';
// `import` pulls in code from other files. Lesson 02 explains it properly.
// Show and Check are small helpers that print results on the page.
import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST
// =============================================================================

// -----------------------------------------------------------------------------
// const and let
// -----------------------------------------------------------------------------
// const → a name that always points at the same value. You can't reassign it.
// let   → a name you're allowed to reassign later.
const cafeName = 'Corner Café';
let cupsSold = 10;
cupsSold = cupsSold + 1; // fine: it's a let
// cafeName = 'Other Café';  ❌ TypeError: Assignment to constant variable.
//
// React code uses const almost everywhere. In React, values that change over
// time live in "state" (lesson 05), not in variables you reassign. Default to
// const; use let only when you truly need to reassign.
// (Old code uses `var`. Don't use it: it has confusing scoping rules.)

// -----------------------------------------------------------------------------
// Arrow functions
// -----------------------------------------------------------------------------
// The same function, three ways:
function greetDeclaration(name) {
  return 'Hello, ' + name + '!';
}

const greetExpression = function (name) {
  return 'Hello, ' + name + '!';
};

// Arrow function: drop the word `function`, put => after the parameters.
const greetArrow = (name) => {
  return 'Hello, ' + name + '!';
};

// IMPLICIT RETURN: if the body is ONLY "return something", drop the braces
// { } AND the word `return`. The value is returned automatically.
const greetShort = (name) => 'Hello, ' + name + '!';

// Zero parameters need empty parentheses. Two or more need parentheses too.
const getOpeningTime = () => '7:00 AM';
const multiply = (a, b) => a * b;

// ⚠️ Gotcha #1: once you add braces, you need `return` again.
const doubleBroken = (n) => {
  // oxlint-disable-next-line no-unused-expressions -- deliberately broken for the lesson
  n * 2; // calculates a value... and throws it away
};

// ⚠️ Gotcha #2: returning an OBJECT on one line. The { after => is read as a
// function body, not an object, so this returns undefined:
// oxlint-disable-next-line no-unused-labels, no-unused-expressions -- deliberately broken
const makeItemBroken = (name) => { name: name };
// Fix: wrap the object in parentheses.
const makeItemFixed = (name) => ({ name: name });

// Why this matters for React: components are functions, click handlers are
// functions, and the callbacks you pass around are functions. Most are arrows.

// -----------------------------------------------------------------------------
// Template literals
// -----------------------------------------------------------------------------
// Backticks (`) instead of quotes, and any expression inside ${ }.
const item = 'Latte';
const price = 4.5;
const oldWay = 'One ' + item + ' costs $' + price.toFixed(2);
const newWay = `One ${item} costs $${price.toFixed(2)}`; // "$" then ${...}
const withMath = `Two cost $${(price * 2).toFixed(2)}`;

// -----------------------------------------------------------------------------
// Expressions, statements, and the ternary
// -----------------------------------------------------------------------------
// An EXPRESSION produces a value:   2 + 2,   price,   price > 3,   greetShort('Ada')
// A STATEMENT does something but is not a value:   if (...) {},   for (...) {}
//
// Inside ${ } (and, below, inside JSX's { }) you can only use EXPRESSIONS.
// So to choose between two values you need an expression version of `if`:
//
//     condition ? valueIfTrue : valueIfFalse       ← the ternary operator
const inStock = false;
const stockLabel = inStock ? 'Available' : 'Sold out';
const sentence = `${item}: ${inStock ? 'order now!' : 'check back tomorrow'}`;

// =============================================================================
// 1B · THE REACT PART: JSX
// =============================================================================

// -----------------------------------------------------------------------------
// From "do these steps" to "here's what it should look like"
// -----------------------------------------------------------------------------
// Plain JavaScript (without React) builds a heading step by step:
//
//   const h1 = document.createElement('h1');
//   h1.textContent = 'Hello from JavaScript';
//   document.body.appendChild(h1);
//
// That's IMPERATIVE: instructions for changing the page. Painful for a whole
// app that changes as people click.
//
// React is DECLARATIVE: you describe what the page SHOULD look like for the
// current data, and React works out the DOM steps. JSX is how you write that.

// -----------------------------------------------------------------------------
// JSX is JavaScript in disguise
// -----------------------------------------------------------------------------
// Browsers can't read JSX. Vite translates it into plain function calls first.
// These two produce the same kind of thing:
const madeWithJsx = <p className="muted">I was written in JSX.</p>;
const madeWithoutJsx = createElement('p', { className: 'muted' }, 'I was made with createElement(). No JSX!');
// Both are plain JavaScript OBJECTS describing an element. See one in the console:
console.log('Lesson 01: a React element is just an object →', madeWithJsx);

// -----------------------------------------------------------------------------
// JSX needs ONE parent element
// -----------------------------------------------------------------------------
// A JSX expression becomes ONE createElement() call, so it's ONE value:
//   const broken = <p>First</p><p>Second</p>;   ❌ "Adjacent JSX elements must be wrapped…"
// Wrap them. If you don't want an extra <div>, use a FRAGMENT: <> … </>
const twoLines = (
  <>
    <p>First line (inside a fragment)</p>
    <p>Second line (same fragment, no extra wrapper in the DOM)</p>
  </>
);
// Tip: wrap multi-line JSX in ( ) like above.

const formatPrice = (amount) => `$${amount.toFixed(2)}`;
const specials = ['Pumpkin Latte', 'Banana Bread', 'Chai'];

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
// This page lives inside a function called Lesson. A function that returns JSX
// is a COMPONENT (next lesson). For now: "the function that returns this page".
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript you need first</h2>

      <h3>const and let</h3>
      <Show code="cafeName" value={cafeName} />
      <Show code="cupsSold  (let, reassigned from 10)" value={cupsSold} />

      <h3>Arrow functions</h3>
      <Show code="greetDeclaration('Ada')" value={greetDeclaration('Ada')} />
      <Show code="greetExpression('Ada')" value={greetExpression('Ada')} />
      <Show code="greetArrow('Ada')" value={greetArrow('Ada')} />
      <Show code="greetShort('Ada')  (implicit return)" value={greetShort('Ada')} />
      <Show code="getOpeningTime()" value={getOpeningTime()} />
      <Show code="multiply(3, 4)" value={multiply(3, 4)} />
      <Show code="doubleBroken(5)  ⚠️ braces, no return" value={doubleBroken(5)} />
      <Show code="makeItemBroken('Latte')  ⚠️ object without ( )" value={makeItemBroken('Latte')} />
      <Show code="makeItemFixed('Latte')" value={makeItemFixed('Latte')} />

      <h3>Template literals</h3>
      <Show code="oldWay" value={oldWay} />
      <Show code="newWay" value={newWay} />
      <Show code="withMath" value={withMath} />

      <h3>The ternary</h3>
      <Show code="inStock ? 'Available' : 'Sold out'" value={stockLabel} />
      <Show code="sentence" value={sentence} />

      <h2>1B · The React part: JSX</h2>

      <h3>JSX looks like HTML, but it's JavaScript</h3>
      {madeWithJsx}
      {madeWithoutJsx}

      <h3>Curly braces {'{ }'} embed JavaScript expressions</h3>
      {/* This is how you write a comment inside JSX: braces + a JS comment. */}
      <p>Welcome to {cafeName}!</p>
      <p>
        One coffee costs {formatPrice(3.5)}. Two cost {formatPrice(3.5 * 2)}.
      </p>
      <p>Today's first special, shouted: {specials[0].toUpperCase()}</p>
      <p>Is a latte in stock? {inStock ? 'Yes!' : 'No, sorry.'}</p>
      {/* Only EXPRESSIONS work in { }. This is a syntax error:
            <p>{if (inStock) { 'Yes' }}</p>
          That's why the ternary is everywhere in React code. */}

      <h3>Attributes: camelCase, and a few renamed</h3>
      {/* class → className, because `class` is a reserved word in JavaScript. */}
      <div className="card">
        {/* for → htmlFor, for the same reason. */}
        <label htmlFor="jsx-email">Email for receipts</label>{' '}
        {/* Tags with no children MUST close with a slash: <input />, <br />, <img /> */}
        <input id="jsx-email" type="email" placeholder="you@example.com" maxLength={40} />
      </div>
      {/* Values: "quotes" for plain strings, {braces} for anything else (see maxLength). */}

      {/* style takes an OBJECT. Outer { } = "JavaScript here", inner { } = the
          object. CSS names become camelCase (font-weight → fontWeight); plain
          numbers mean pixels. */}
      <p style={{ color: 'tomato', fontWeight: 'bold', fontSize: 20 }}>Styled with a style object</p>

      <h3>One parent element (or a Fragment)</h3>
      {twoLines}

      <h3>What React renders, and what it skips</h3>
      <ul>
        <li>
          Strings and numbers render as text: {'hello'} {42}
        </li>
        <li>Arrays render each item in order: {['☕', ' ', '🥯', ' ', '🧁']}</li>
        <li>
          true, false, null and undefined render NOTHING: [{true}
          {false}
          {null}
          {undefined}]
        </li>
        <li>…but the number 0 DOES render: [{0}] (remember this in lesson 06)</li>
        <li>
          Plain objects can't render at all. <code>{'{ { name: "Latte" } }'}</code> would crash with "Objects are
          not valid as a React child".
        </li>
      </ul>

      <h3>How does this reach the screen?</h3>
      <ol>
        <li>
          <code>index.html</code> contains one empty <code>{'<div id="root">'}</code>.
        </li>
        <li>
          In <code>src/main.jsx</code>, <code>createRoot(document.getElementById('root'))</code> hands that div to
          React.
        </li>
        <li>
          <code>.render(…)</code> draws your JSX inside it. From then on, React updates the DOM whenever your data
          changes (lesson 05).
        </li>
      </ol>
      <p className="muted">
        <code>&lt;StrictMode&gt;</code> in main.jsx turns on extra checks during development, and deliberately
        runs some of your code twice to catch bugs. Lesson 09 explains why that matters.
      </p>

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>When would you use let instead of const?</li>
        <li>
          Why does <code>{'() => { name: "Coffee" }'}</code> return undefined? How do you fix it?
        </li>
        <li>What does &lt;h1&gt;Hi&lt;/h1&gt; turn into before the browser runs it?</li>
        <li>Why className and not class? Why two sets of braces in style?</li>
        <li>Why can't you put an if statement inside {'{ }'}?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Replace every TODO below. The page shows ✅ or ❌ for each check as you save.
// Time: about 20 minutes.
//
// Throughout this curriculum you'll build pieces of an ordering app for an
// imaginary café called Corner Café.

// -----------------------------------------------------------------------------
// A · JavaScript warm-up. Write each one as an ARROW function.
// -----------------------------------------------------------------------------

// A1. formatPriceTag(amount) → a string with a $ and 2 decimals.
//     formatPriceTag(3.5) → '$3.50'      Hint: use a template literal and .toFixed(2)
const formatPriceTag = (amount) => {
  // TODO
};

// A2. addTax(price) → the price plus 8% tax. addTax(10) → 10.8
//     Write it as a one-liner with implicit return (no braces, no `return`).
const addTax = (price) => {
  // TODO
};

// A3. isAffordable(price, budget) → true if price is less than or equal to budget.
const isAffordable = (price, budget) => {
  // TODO
};

// A4. makeMenuItem(name, price) → { name: 'Latte', price: 4.5 }
//     As a ONE-LINER. Remember gotcha #2!
const makeMenuItem = (name, price) => {
  // TODO
};

// A5. describeItem(name, price, inStock)
//     describeItem('Coffee', 3.5, true)       → 'Coffee: $3.50'
//     describeItem('Orange Juice', 4, false)  → 'Orange Juice: SOLD OUT'
//     Use a template literal with a ternary inside ${ }.
const describeItem = (name, price, inStock) => {
  // TODO
};

// -----------------------------------------------------------------------------
// B · React: a menu card built from variables
// -----------------------------------------------------------------------------
// Build the card inside MenuCard using ONLY JSX and the variables given.
// Don't type any value by hand: every name, price and label must come from a
// variable or a calculation inside { }.
//
//   B1. An <h3> showing the drink name.
//   B2. A <p> with the price formatted as "$4.25".
//   B3. A <p> with the price WITH tax, calculated inside { }: "$4.59 with tax".
//   B4. Give the outer <div> the CSS class "card" (className!).
//   B5. Give the <h3> a style object: color 'sienna', fontSize 26.
//   B6. A <p> showing "🌱 Vegan" if isVegan is true, otherwise "Contains dairy".
//   B7. An <input /> with placeholder "Special requests" and maxLength of 30.
//   B8. Below the card (outside it!), a <small> saying "Prices shown in USD".
//       You'll need a Fragment <> </> to return both.
//
// How to check: the card shows Cappuccino (big, sienna) · $4.25 · $4.59 with
// tax · Contains dairy · an input, with "Prices shown in USD" under the card.
// Change the variables and everything updates. No red or yellow console messages.
function MenuCard() {
  const drinkName = 'Cappuccino';
  const drinkPrice = 4.25;
  const taxRate = 0.08;
  const isVegan = false;

  return (
    <div>
      <p>TODO: build the card here. Replace this whole return!</p>
      <p className="muted">
        (Ready for you: {drinkName}, {drinkPrice}, {taxRate}, {String(isVegan)})
      </p>
    </div>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript warm-up</h3>
      <Check label="formatPriceTag(3.5)" run={() => formatPriceTag(3.5)} expected="$3.50" />
      <Check label="formatPriceTag(12)" run={() => formatPriceTag(12)} expected="$12.00" />
      <Check label="addTax(10)" run={() => addTax(10)} expected={10.8} />
      <Check label="isAffordable(4, 5)" run={() => isAffordable(4, 5)} expected={true} />
      <Check label="isAffordable(5, 5)" run={() => isAffordable(5, 5)} expected={true} />
      <Check label="isAffordable(6, 5)" run={() => isAffordable(6, 5)} expected={false} />
      <Check label="makeMenuItem('Latte', 4.5)" run={() => makeMenuItem('Latte', 4.5)} expected={{ name: 'Latte', price: 4.5 }} />
      <Check label="describeItem('Coffee', 3.5, true)" run={() => describeItem('Coffee', 3.5, true)} expected="Coffee: $3.50" />
      <Check
        label="describeItem('Orange Juice', 4, false)"
        run={() => describeItem('Orange Juice', 4, false)}
        expected="Orange Juice: SOLD OUT"
      />

      <h3>B · React: the menu card</h3>
      <MenuCard />
    </div>
  );
}

// #############################################################################
// PART 3 · EXPERIMENTS
// #############################################################################
// Change the code in PART 1, save, and watch the page (and the console).
// Undo each change afterwards. Breaking things on purpose is how you learn
// what the error messages mean.
export function Experiments() {
  return (
    <ol>
      <li>
        Uncomment <code>cafeName = 'Other Café'</code> in the const/let section. Read the error. Then change{' '}
        <code>const cafeName</code> to <code>let cafeName</code>.
      </li>
      <li>
        In <code>makeItemFixed</code>, remove the parentheses around the object. What does the page show now?
      </li>
      <li>
        Delete the <code>&lt;&gt;</code> and <code>&lt;/&gt;</code> around <code>twoLines</code> and read the error.
      </li>
      <li>
        Change <code>className="card"</code> to <code>class="card"</code> and check the console warning.
      </li>
      <li>
        Put an object like <code>{'{ { name: "Latte" } }'}</code> inside a &lt;p&gt; and see what happens.
      </li>
      <li>
        Change <code>inStock</code> to <code>true</code>. Which lines on the page change?
      </li>
      <li>
        Look at the object logged in the console ("a React element is just an object"). Find its{' '}
        <code>type</code> and <code>props</code>.
      </li>
    </ol>
  );
}

// #############################################################################
// PART 4 · SOLUTIONS  ⚠️ SPOILERS. Try the assignments first!
// #############################################################################
// Your version doesn't need to match. If your checks pass and the card looks
// right, you're right. Compare anyway: look for shorter or clearer ways.
//
//
//
//
//
//
//
//
//

const formatPriceTagSolution = (amount) => `$${amount.toFixed(2)}`;

const addTaxSolution = (price) => price * 1.08;

// A comparison already gives true/false, so return it directly.
const isAffordableSolution = (price, budget) => price <= budget;

// Parentheses around the object: gotcha #2.
const makeMenuItemSolution = (name, price) => ({ name: name, price: price });

// A ternary inside ${ } picks which text to show.
const describeItemSolution = (name, price, inStock) => `${name}: ${inStock ? `$${price.toFixed(2)}` : 'SOLD OUT'}`;

function MenuCardSolution() {
  const drinkName = 'Cappuccino';
  const drinkPrice = 4.25;
  const taxRate = 0.08;
  const isVegan = false;

  // A Fragment lets us return the card AND the note without an extra wrapper.
  return (
    <>
      <div className="card">
        <h3 style={{ color: 'sienna', fontSize: 26 }}>{drinkName}</h3>
        <p>${drinkPrice.toFixed(2)}</p>
        <p>${(drinkPrice * (1 + taxRate)).toFixed(2)} with tax</p>
        <p>{isVegan ? '🌱 Vegan' : 'Contains dairy'}</p>
        <input placeholder="Special requests" maxLength={30} />
      </div>
      <small>Prices shown in USD</small>
    </>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript warm-up</h3>
      <Check label="formatPriceTag(3.5)" run={() => formatPriceTagSolution(3.5)} expected="$3.50" />
      <Check label="formatPriceTag(12)" run={() => formatPriceTagSolution(12)} expected="$12.00" />
      <Check label="addTax(10)" run={() => addTaxSolution(10)} expected={10.8} />
      <Check label="isAffordable(5, 5)" run={() => isAffordableSolution(5, 5)} expected={true} />
      <Check label="isAffordable(6, 5)" run={() => isAffordableSolution(6, 5)} expected={false} />
      <Check
        label="makeMenuItem('Latte', 4.5)"
        run={() => makeMenuItemSolution('Latte', 4.5)}
        expected={{ name: 'Latte', price: 4.5 }}
      />
      <Check label="describeItem('Coffee', 3.5, true)" run={() => describeItemSolution('Coffee', 3.5, true)} expected="Coffee: $3.50" />
      <Check
        label="describeItem('Orange Juice', 4, false)"
        run={() => describeItemSolution('Orange Juice', 4, false)}
        expected="Orange Juice: SOLD OUT"
      />

      <h3>B · React: the menu card</h3>
      <MenuCardSolution />
    </div>
  );
}
