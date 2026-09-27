// =============================================================================
// LESSON 06 · CONDITIONAL RENDERING
// =============================================================================
//
//   PART 1 · LEARN        truthy/falsy and the logical operators, then conditional UI
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–05.
//
// What you'll learn
//   JavaScript: truthy & falsy, && and || as "pick a value" operators, the 0
//               gotcha, ?? (nullish coalescing), ?. (optional chaining)
//   React:      early returns, ternaries in JSX, &&, returning null, JSX in
//               variables, conditional classes, one "status" value
// =============================================================================

import { useState } from 'react';
import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST
// =============================================================================
// JSX only accepts EXPRESSIONS (lesson 01). You've used the ternary. Here are
// the other expression-sized ways to make decisions.

// -----------------------------------------------------------------------------
// Truthy and falsy
// -----------------------------------------------------------------------------
// When JavaScript needs true/false (in `if`, `? :`, &&, ||), it converts values.
// These 6 are FALSY (they act like false):
//     false   0   ''   null   undefined   NaN
// EVERYTHING else is TRUTHY, including '0', 'false', [] and {}.
const truthiness = (value) => (value ? 'truthy' : 'falsy');

// -----------------------------------------------------------------------------
// && and || give back one of their VALUES, not just true/false
// -----------------------------------------------------------------------------
// a && b → if a is falsy, gives back a. Otherwise gives back b.   ("if a, then b")
// a || b → if a is truthy, gives back a. Otherwise gives back b.  ("a, or else b")
const isMember = true;
const isGuest = false;
const memberPerk = isMember && 'Free cookie!';
const guestPerk = isGuest && 'Free cookie!';
const nickname = '';
const displayName = nickname || 'Guest';

// ⚠️ THE 0 GOTCHA. Remember this one, it shows up on screen in React:
const cartCount = 0;
const buggyLabel = cartCount && `${cartCount} items`; // 0, not false!
const fixedLabel = cartCount > 0 && `${cartCount} items`; // false: a real boolean on the left

// -----------------------------------------------------------------------------
// ?? (nullish coalescing): defaults that respect 0 and ''
// -----------------------------------------------------------------------------
// a ?? b → gives back b ONLY if a is null or undefined. Keeps 0 and ''.
const savedQuantity = 0; // the customer really chose 0
const withOr = savedQuantity || 1; // 1 ❌ || treats 0 as "missing"
const withNullish = savedQuantity ?? 1; // 0 ✅
const neverSaved = undefined;
const defaulted = neverSaved ?? 1; // 1

// -----------------------------------------------------------------------------
// ?. (optional chaining): reading data that might not be there
// -----------------------------------------------------------------------------
// Reading a property of undefined CRASHES. ?. stops early and gives undefined.
const orderWithCustomer = { id: 1, customer: { name: 'Sam', address: { city: 'Pune' } } };
const orderWithoutCustomer = { id: 2 };
// orderWithoutCustomer.customer.address   ← TypeError: Cannot read properties of undefined
const safeCity = orderWithoutCustomer.customer?.address?.city;
const cityOrDefault = orderWithoutCustomer.customer?.name ?? 'Walk-in customer'; // ?. and ?? together

// Putting it together: a CSS class name, the way React code builds them.
const isSelected = true;
const isSoldOut = false;
const className = `menu-item ${isSelected ? 'selected' : ''} ${isSoldOut ? 'sold-out' : ''}`.trim();

// =============================================================================
// 1B · THE REACT PART: CONDITIONAL RENDERING
// =============================================================================

// -----------------------------------------------------------------------------
// if / else with an early return
// -----------------------------------------------------------------------------
// A plain `if` works fine, just OUTSIDE the JSX, before the return.
function OpeningStatus({ isOpen }) {
  if (!isOpen) {
    return <p className="error">🔒 Closed. See you tomorrow at 7am!</p>;
  }
  return <p className="success">✅ We're open. Come on in!</p>;
}

// -----------------------------------------------------------------------------
// Ternary: pick one of two things INSIDE the JSX
// -----------------------------------------------------------------------------
function MenuItem({ name, price, inStock }) {
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {name} · {inStock ? <span>${price.toFixed(2)}</span> : <span className="badge">Sold out</span>}
      {/* A conditional ATTRIBUTE: any prop can take an expression. */}
      <button disabled={!inStock}>{inStock ? 'Add' : 'Unavailable'}</button>
    </li>
  );
}

// -----------------------------------------------------------------------------
// && : "if this, show that; otherwise nothing"
// -----------------------------------------------------------------------------
function CartNotices({ cartCount }) {
  return (
    <div>
      {/* ✅ Left side is a real boolean. When false, React renders nothing. */}
      {cartCount > 0 && <p>You have {cartCount} item(s) in your cart.</p>}
      {cartCount >= 5 && <p>🍪 Free cookie unlocked!</p>}

      {/* ❌ The 0 gotcha: with cartCount 0, `0 && …` gives back 0, and React
          renders the number 0. Set the cart to 0 and look for a stray "0": */}
      <div className="card">Buggy notice: {cartCount && <span>{cartCount} items</span>}</div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Returning null: render nothing at all
// -----------------------------------------------------------------------------
function HappyHourBanner({ isHappyHour }) {
  if (!isHappyHour) return null;
  return <div className="card success">🎉 Happy hour! All drinks $1 off.</div>;
}

// -----------------------------------------------------------------------------
// JSX in a variable: for logic with 3+ branches
// -----------------------------------------------------------------------------
function CartSummary({ cartCount }) {
  let message;
  if (cartCount === 0) {
    message = <p className="muted">Your cart is empty.</p>;
  } else if (cartCount < 5) {
    message = <p>{cartCount === 1 ? '1 item' : `${cartCount} items`} in your cart.</p>;
  } else {
    message = <p>🛍️ {cartCount} items. That's a big order!</p>;
  }
  return <div className="card">{message}</div>;
}

// -----------------------------------------------------------------------------
// Conditional classes and styles
// -----------------------------------------------------------------------------
function StockLevel({ stock }) {
  const isLow = stock > 0 && stock < 3;
  return (
    <p className={stock === 0 ? 'error' : isLow ? 'badge' : ''} style={{ fontWeight: isLow ? 'bold' : 'normal' }}>
      {stock === 0 ? 'Out of stock' : `${stock} left${isLow ? ', hurry!' : ''}`}
    </p>
  );
}

// -----------------------------------------------------------------------------
// Show / hide with state
// -----------------------------------------------------------------------------
function AllergenInfo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="card">
      <button onClick={() => setIsOpen((open) => !open)}>{isOpen ? 'Hide allergens ▲' : 'Show allergens ▼'}</button>
      {isOpen && (
        <ul>
          <li>Muffin: gluten, egg, dairy</li>
          <li>Latte: dairy (ask for oat milk!)</li>
        </ul>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// One "status" value picks the whole UI
// -----------------------------------------------------------------------------
// Instead of juggling isLoading + hasError + hasData (which can contradict each
// other), store ONE status string. Lesson 09 uses exactly this for loading data.
function OrderStatus({ status }) {
  if (status === 'idle') return <p className="muted">No order yet.</p>;
  if (status === 'loading') return <p>⏳ Sending your order…</p>;
  if (status === 'error') return <p className="error">❌ Something went wrong. Please try again.</p>;
  return <p className="success">✅ Order confirmed! Pick-up in 5 minutes.</p>;
}

// -----------------------------------------------------------------------------
// The lesson page (with a control panel to drive the examples)
// -----------------------------------------------------------------------------
export default function Lesson() {
  const [isOpen, setIsOpen] = useState(true);
  const [latteInStock, setLatteInStock] = useState(true);
  const [count, setCount] = useState(0);
  const [isHappyHour, setIsHappyHour] = useState(false);
  const [status, setStatus] = useState('idle');

  return (
    <div>
      <h2>1A · The JavaScript you need first</h2>

      <h3>Truthy and falsy</h3>
      <Show code="truthiness(0)" value={truthiness(0)} />
      <Show code="truthiness(1)" value={truthiness(1)} />
      <Show code="truthiness('')" value={truthiness('')} />
      <Show code="truthiness('hi')" value={truthiness('hi')} />
      <Show code="truthiness(null)" value={truthiness(null)} />
      <Show code="truthiness(undefined)" value={truthiness(undefined)} />
      <Show code="truthiness([])" value={truthiness([])} />
      <Show code="truthiness({})" value={truthiness({})} />

      <h3>&& and ||</h3>
      <Show code="isMember && 'Free cookie!'" value={memberPerk} />
      <Show code="isGuest && 'Free cookie!'" value={guestPerk} />
      <Show code="nickname || 'Guest'   (nickname is '')" value={displayName} />
      <Show code="cartCount && `${cartCount} items`   ⚠️ cartCount is 0" value={buggyLabel} />
      <Show code="cartCount > 0 && `${cartCount} items`" value={fixedLabel} />

      <h3>?? vs ||</h3>
      <Show code="savedQuantity || 1   (savedQuantity is 0)" value={withOr} />
      <Show code="savedQuantity ?? 1" value={withNullish} />
      <Show code="neverSaved ?? 1   (neverSaved is undefined)" value={defaulted} />

      <h3>Optional chaining</h3>
      <Show code="orderWithCustomer.customer.address.city" value={orderWithCustomer.customer.address.city} />
      <Show code="orderWithoutCustomer.customer?.address?.city" value={safeCity} />
      <Show code="orderWithoutCustomer.customer?.name ?? 'Walk-in customer'" value={cityOrDefault} />
      <Show code="className" value={className} />

      <h2>1B · The React part: conditional rendering</h2>

      <div className="card" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <strong>🎛️ Control panel</strong>
        <div className="row" style={{ marginTop: 8 }}>
          <button onClick={() => setIsOpen((open) => !open)}>Café: {isOpen ? 'open' : 'closed'}</button>
          <button onClick={() => setLatteInStock((inStock) => !inStock)}>
            Latte: {latteInStock ? 'in stock' : 'sold out'}
          </button>
          <button onClick={() => setCount((c) => Math.max(0, c - 1))}>Cart −</button>
          <strong>{count}</strong>
          <button onClick={() => setCount((c) => c + 1)}>Cart +</button>
          <button onClick={() => setIsHappyHour((on) => !on)}>Happy hour: {isHappyHour ? 'on' : 'off'}</button>
        </div>
      </div>

      <h3>if / else with early return</h3>
      <OpeningStatus isOpen={isOpen} />

      <h3>Ternary in JSX (+ a conditional attribute)</h3>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        <MenuItem name="Latte" price={4.5} inStock={latteInStock} />
        <MenuItem name="Orange Juice" price={4} inStock={false} />
      </ul>

      <h3>&& (and the 0 gotcha)</h3>
      <CartNotices cartCount={count} />

      <h3>Returning null</h3>
      <HappyHourBanner isHappyHour={isHappyHour} />
      {!isHappyHour && <p className="muted">(The banner returned null. Turn happy hour on.)</p>}

      <h3>JSX in a variable</h3>
      <CartSummary cartCount={count} />

      <h3>Conditional classes & styles</h3>
      <StockLevel stock={Math.max(0, 5 - count)} />
      <p className="muted">(Stock goes down as you add to the cart.)</p>

      <h3>Show / hide with state</h3>
      <AllergenInfo />

      <h3>A status value</h3>
      <div className="row">
        <button onClick={() => setStatus('idle')} disabled={status === 'idle'}>
          idle
        </button>
        <button onClick={() => setStatus('loading')} disabled={status === 'loading'}>
          loading
        </button>
        <button onClick={() => setStatus('error')} disabled={status === 'error'}>
          error
        </button>
        <button onClick={() => setStatus('success')} disabled={status === 'success'}>
          success
        </button>
      </div>
      <OrderStatus status={status} />

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>What does 0 && 'hello' give back? What about 0 &gt; 0 && 'hello'?</li>
        <li>When would x || 10 and x ?? 10 give different answers?</li>
        <li>What does user?.address?.city give if user is undefined?</li>
        <li>Where can you use an if statement in a component, and where can't you?</li>
        <li>What does a component render if it returns null?</li>
        <li>Why is one status string often better than several booleans?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 20 minutes. No `if` statements in part A: use expressions!

// -----------------------------------------------------------------------------
// A · JavaScript
// -----------------------------------------------------------------------------

// A1. cartLabel(count): 0 → 'Your cart is empty', 1 → '1 item', 3 → '3 items'
//     Hint: ternaries can nest:  a ? x : b ? y : z
const cartLabel = (count) => {
  // TODO
};

// A2. greet(name): greet('Sam') → 'Hello, Sam!'; greet(undefined) and
//     greet(null) → 'Hello, guest!'
const greet = (name) => {
  // TODO
};

// A3. getQuantity(saved): the saved quantity, or 1 if nothing was saved.
//     getQuantity(3) → 3, getQuantity(0) → 0 (a real choice!), getQuantity(undefined) → 1
const getQuantity = (saved) => {
  // TODO
};

// A4. getCity(order): the customer's city, or 'Unknown' if any part is missing.
const getCity = (order) => {
  // TODO
};

// A5. stockBadge(stockLeft): false when there's no stock, otherwise 'Only N left!'
//     stockBadge(3) → 'Only 3 left!',  stockBadge(0) → false (NOT 0!). Use &&.
const stockBadge = (stockLeft) => {
  // TODO
};

// -----------------------------------------------------------------------------
// B · React: a smarter café screen
// -----------------------------------------------------------------------------
// The state and control buttons in CafeScreen already work. Make each
// component show the RIGHT thing:
//
//   B1. CafeStockItem: when inStock is false, show
//       <span className="badge">Sold out</span> INSTEAD of the price, and
//       disable the Add button.
//   B2. CafeCartSummary: 0 → "Your cart is empty", 1 → "1 item in your cart",
//       2+ → "3 items in your cart". ALSO, only at 5 or more, show
//       "🍪 Free cookie unlocked!". No stray "0" ever (the && gotcha).
//   B3. CafeOrderPanel: if isOpen is false, return ONLY
//       <p className="error">Sorry, we're closed. Ordering opens at 7am.</p>
//       Otherwise render its children. (Early return!)
//   B4. CafeAllergens: give it its OWN state. A button toggles the list, and
//       its text says "Show allergens" or "Hide allergens".
//
// How to check: toggle "Muffin in stock" (price ↔ badge, button enables/
// disables); cart at 0, 1, 3, 5 (right text, cookie at 5, no stray 0); close
// the café (menu disappears, only the message shows); allergens toggle.
function CafeStockItem({ name, price, inStock }) {
  // TODO B1
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {name} · ${price.toFixed(2)}
      <button>Add</button>
    </li>
  );
}

function CafeCartSummary({ count }) {
  // TODO B2
  return <div className="card">Cart: {count}</div>;
}

function CafeOrderPanel({ isOpen, children }) {
  // TODO B3
  return <div className="card">{children}</div>;
}

function CafeAllergens() {
  // TODO B4
  return (
    <div className="card">
      <button>Show allergens</button>
      <ul>
        <li>Muffin: gluten, egg, dairy</li>
        <li>Latte: dairy</li>
      </ul>
    </div>
  );
}

function CafeScreen() {
  const [isOpen, setIsOpen] = useState(true);
  const [muffinInStock, setMuffinInStock] = useState(true);
  const [count, setCount] = useState(0);
  return (
    <div>
      <div className="row card">
        <button onClick={() => setIsOpen((open) => !open)}>Café: {isOpen ? 'open' : 'closed'}</button>
        <button onClick={() => setMuffinInStock((inStock) => !inStock)}>Muffin in stock: {muffinInStock ? 'yes' : 'no'}</button>
        <button onClick={() => setCount((c) => Math.max(0, c - 1))}>Cart −</button>
        <button onClick={() => setCount((c) => c + 1)}>Cart +</button>
      </div>
      <CafeOrderPanel isOpen={isOpen}>
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          <CafeStockItem name="Latte" price={4.5} inStock />
          <CafeStockItem name="Muffin" price={2.75} inStock={muffinInStock} />
        </ul>
        <CafeCartSummary count={count} />
      </CafeOrderPanel>
      <CafeAllergens />
    </div>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="cartLabel(0)" run={() => cartLabel(0)} expected="Your cart is empty" />
      <Check label="cartLabel(1)" run={() => cartLabel(1)} expected="1 item" />
      <Check label="cartLabel(3)" run={() => cartLabel(3)} expected="3 items" />
      <Check label="greet('Sam')" run={() => greet('Sam')} expected="Hello, Sam!" />
      <Check label="greet(undefined)" run={() => greet(undefined)} expected="Hello, guest!" />
      <Check label="greet(null)" run={() => greet(null)} expected="Hello, guest!" />
      <Check label="getQuantity(3)" run={() => getQuantity(3)} expected={3} />
      <Check label="getQuantity(0)" run={() => getQuantity(0)} expected={0} />
      <Check label="getQuantity(undefined)" run={() => getQuantity(undefined)} expected={1} />
      <Check label="getCity(full order)" run={() => getCity({ customer: { address: { city: 'Pune' } } })} expected="Pune" />
      <Check label="getCity({ customer: {} })" run={() => getCity({ customer: {} })} expected="Unknown" />
      <Check label="getCity({})" run={() => getCity({})} expected="Unknown" />
      <Check label="stockBadge(3)" run={() => stockBadge(3)} expected="Only 3 left!" />
      <Check label="stockBadge(0)" run={() => stockBadge(0)} expected={false} />

      <h3>B · React</h3>
      <CafeScreen />
    </div>
  );
}

// #############################################################################
// PART 3 · EXPERIMENTS
// #############################################################################
export function Experiments() {
  return (
    <ol>
      <li>Set the cart to 0 in the control panel and find the stray "0" in the buggy notice. Then fix that line.</li>
      <li>
        In 1A, change <code>savedQuantity</code> to <code>null</code>. Which results change, and why?
      </li>
      <li>
        Remove the <code>?</code> from <code>customer?.address</code> in <code>safeCity</code>. That line runs as
        soon as the file loads, so the WHOLE lesson crashes. Read the error, then put the <code>?</code> back.
      </li>
      <li>
        Rewrite <code>CartSummary</code> using nested ternaries instead of if/else. Which version do you find easier
        to read?
      </li>
      <li>
        Add a fifth status, <code>'cancelled'</code>, to <code>OrderStatus</code> and a button for it.
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

// Nested ternary, split over lines so it reads like if / else if / else.
const cartLabelSolution = (count) =>
  count === 0 ? 'Your cart is empty'
  : count === 1 ? '1 item'
  : `${count} items`;

const greetSolution = (name) => `Hello, ${name ?? 'guest'}!`;

// ?? keeps 0. Using || here would turn a real 0 into 1 (a bug).
const getQuantitySolution = (saved) => saved ?? 1;

const getCitySolution = (order) => order.customer?.address?.city ?? 'Unknown';

// A real boolean on the left, so we never give back a bare 0.
const stockBadgeSolution = (stockLeft) => stockLeft > 0 && `Only ${stockLeft} left!`;

function CafeStockItemSolution({ name, price, inStock }) {
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {name} · {inStock ? `$${price.toFixed(2)}` : <span className="badge">Sold out</span>}
      <button disabled={!inStock}>Add</button>
    </li>
  );
}

function CafeCartSummarySolution({ count }) {
  let message;
  if (count === 0) message = 'Your cart is empty';
  else if (count === 1) message = '1 item in your cart';
  else message = `${count} items in your cart`;
  return (
    <div className="card">
      <p style={{ margin: 0 }}>{message}</p>
      {count >= 5 && <p style={{ marginBottom: 0 }}>🍪 Free cookie unlocked!</p>}
    </div>
  );
}

function CafeOrderPanelSolution({ isOpen, children }) {
  if (!isOpen) {
    return <p className="error">Sorry, we're closed. Ordering opens at 7am.</p>;
  }
  return <div className="card">{children}</div>;
}

function CafeAllergensSolution() {
  const [isShown, setIsShown] = useState(false);
  return (
    <div className="card">
      <button onClick={() => setIsShown((shown) => !shown)}>{isShown ? 'Hide allergens' : 'Show allergens'}</button>
      {isShown && (
        <ul>
          <li>Muffin: gluten, egg, dairy</li>
          <li>Latte: dairy</li>
        </ul>
      )}
    </div>
  );
}

function CafeScreenSolution() {
  const [isOpen, setIsOpen] = useState(true);
  const [muffinInStock, setMuffinInStock] = useState(true);
  const [count, setCount] = useState(0);
  return (
    <div>
      <div className="row card">
        <button onClick={() => setIsOpen((open) => !open)}>Café: {isOpen ? 'open' : 'closed'}</button>
        <button onClick={() => setMuffinInStock((inStock) => !inStock)}>Muffin in stock: {muffinInStock ? 'yes' : 'no'}</button>
        <button onClick={() => setCount((c) => Math.max(0, c - 1))}>Cart −</button>
        <button onClick={() => setCount((c) => c + 1)}>Cart +</button>
      </div>
      <CafeOrderPanelSolution isOpen={isOpen}>
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          <CafeStockItemSolution name="Latte" price={4.5} inStock />
          <CafeStockItemSolution name="Muffin" price={2.75} inStock={muffinInStock} />
        </ul>
        <CafeCartSummarySolution count={count} />
      </CafeOrderPanelSolution>
      <CafeAllergensSolution />
    </div>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="cartLabel(0)" run={() => cartLabelSolution(0)} expected="Your cart is empty" />
      <Check label="cartLabel(3)" run={() => cartLabelSolution(3)} expected="3 items" />
      <Check label="greet(null)" run={() => greetSolution(null)} expected="Hello, guest!" />
      <Check label="getQuantity(0)" run={() => getQuantitySolution(0)} expected={0} />
      <Check label="getCity({})" run={() => getCitySolution({})} expected="Unknown" />
      <Check label="stockBadge(0)" run={() => stockBadgeSolution(0)} expected={false} />

      <h3>B · React</h3>
      <CafeScreenSolution />
    </div>
  );
}
