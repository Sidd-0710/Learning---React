// =============================================================================
// LESSON 05 · STATE (useState)
// =============================================================================
//
//   PART 1 · LEARN        arrays, references & immutability, then useState
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–04 (especially closures from lesson 04).
//
// What you'll learn
//   JavaScript: array destructuring, references and ===, immutable updates
//               with spread, snapshots, a mini useState made from a closure
//   React:      useState, re-rendering, updater functions, objects in state,
//               lifting state up
// =============================================================================

import { useState } from 'react';
import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST
// =============================================================================

// -----------------------------------------------------------------------------
// Array destructuring: pull items out BY POSITION
// -----------------------------------------------------------------------------
const specials = ['Pumpkin Latte', 'Banana Bread', 'Chai'];
const [firstSpecial, secondSpecial] = specials; // item 0, item 1
const [, , thirdSpecial] = specials; // skip positions with commas

// Because arrays go by POSITION, YOU choose the names. That's why useState
// returns an array: you can call the two pieces whatever fits.
const [itemName, quantityText] = 'Latte:2'.split(':'); // .split cuts a string into an array

// A function can return TWO things by putting them in an array:
function sortTwoPrices(a, b) {
  return a < b ? [a, b] : [b, a];
}
const [cheaper, pricier] = sortTwoPrices(4.5, 2.25);

// -----------------------------------------------------------------------------
// References: `const b = a` does NOT copy an array or object
// -----------------------------------------------------------------------------
// Numbers and strings are copied when assigned. Arrays and objects are NOT: the
// variable holds a REFERENCE (an address) to one shared array.
const cart = ['Coffee'];
const sameCart = cart; // two names for ONE array
sameCart.push('Bagel'); // push changes the array in place ("mutates" it)
// Now cart ALSO contains 'Bagel'!

// === on arrays and objects asks "is this the SAME one?", not "same contents?"
const listA = [1, 2];
const listB = [1, 2];

// -----------------------------------------------------------------------------
// Immutable updates: make a NEW array/object with the change
// -----------------------------------------------------------------------------
// This is the rule React depends on. React decides whether to update the
// screen by checking "oldValue === newValue?". If you push into the same
// array, it's the same array, so React thinks nothing changed.
const oldCart = ['Coffee'];
const mutatedCart = oldCart;
mutatedCart.push('Tea'); // ❌ same array
const cart2 = ['Coffee'];
const newCart = [...cart2, 'Tea']; // ✅ ... "spreads" the old items into a NEW array

// Spread for arrays: copy, add to the end, add to the start, combine.
const drinks = ['Coffee', 'Tea'];
const food = ['Bagel', 'Muffin'];
const withJuice = [...drinks, 'Juice'];
const withWater = ['Water', ...drinks];
const fullMenu = [...drinks, ...food];

// Spread for objects (from lesson 03): copy, then override.
const drink = { size: 'Medium', milk: 'Whole' };
const bigDrink = { ...drink, size: 'Large' };

// Spread is SHALLOW: it copies one level. To change something nested, spread at
// each level you change:
const order = { id: 2, customer: { name: 'Ana', phone: '555-0101' } };
const updatedOrder = {
  ...order, // copy the outer object
  customer: { ...order.customer, phone: '555-2222' }, // copy the inner one, change phone
};

// -----------------------------------------------------------------------------
// Snapshots: each function call has its own variables
// -----------------------------------------------------------------------------
// Pretend to be React. Each time a component "renders", React calls your
// function again, and each call has its OWN `count`.
function renderCounter(count) {
  const showCount = () => `the handler sees count = ${count}`; // a closure over THIS count
  return showCount;
}
const handlerFromRender1 = renderCounter(0); // first render: count is 0
const handlerFromRender2 = renderCounter(1); // re-render:    count is 1
// Even after render 2, the handler from render 1 still sees 0. You'll see
// this "snapshot" behavior in real React below.

// -----------------------------------------------------------------------------
// A mini useState, made from a closure
// -----------------------------------------------------------------------------
// Not how React is literally written, but the same core idea: a value kept
// alive in a closure, plus a function to change it.
function createState(initialValue) {
  let value = initialValue; // kept alive by the closures below
  const getValue = () => value;
  const setValue = (newValue) => {
    value = newValue; // (React would also re-render here)
  };
  return [getValue, setValue]; // an array → destructure it
}
const [getCups, setCups] = createState(0);
const cupsBefore = getCups();
setCups(getCups() + 1);
const cupsAfter = getCups();

// =============================================================================
// 1B · THE REACT PART: STATE
// =============================================================================

// -----------------------------------------------------------------------------
// Fixing lesson 04's BrokenCounter
// -----------------------------------------------------------------------------
function CupCounter() {
  // useState(0) gives back an ARRAY of two things:
  //   cups    → the current value (0 on the first render)
  //   setCups → a function to change it AND tell React to re-render
  const [cups, setCups] = useState(0);

  function handleClick() {
    setCups(cups + 1); // "React, cups should now be cups + 1. Please redraw me."
  }

  return (
    <div className="row">
      <button onClick={handleClick}>Add a cup</button>
      <span>Cups: {cups}</span>
    </div>
  );
}

// What happens when you call setCups?
//   1. You click. handleClick runs setCups(1).
//   2. React stores 1 as this component's new state and schedules a re-render.
//   3. React calls CupCounter() AGAIN. (A "re-render" is just calling your
//      function again.)
//   4. This time useState(0) returns [1, setCups]. The 0 is only the INITIAL
//      value and is ignored after the first render.
//   5. React compares the new JSX with the old and updates ONLY what changed
//      in the real DOM (the text "Cups: 1").
// Like createState() above, React keeps the value OUTSIDE your function, so it
// survives each call. That's why a plain `let cups = 0` couldn't work.

// -----------------------------------------------------------------------------
// State is a snapshot, and updater functions
// -----------------------------------------------------------------------------
function SnapshotDemo() {
  const [count, setCount] = useState(0);

  function addThreeBroken() {
    // In THIS render, count is a constant (say 0). All three lines say
    // "set it to 0 + 1". Same snapshot idea as renderCounter above.
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  function addThreeFixed() {
    // UPDATER FUNCTION: "take the latest value, whatever it is, and add 1".
    // React runs them in order: 0 → 1 → 2 → 3.
    setCount((previous) => previous + 1);
    setCount((previous) => previous + 1);
    setCount((previous) => previous + 1);
  }

  function logRightAfterSetting() {
    setCount(count + 1);
    // setCount doesn't change `count` in this render; it schedules the NEXT one.
    console.log('Right after setCount, count is still', count);
  }

  return (
    <div className="row">
      <strong style={{ minWidth: 80 }}>Count: {count}</strong>
      <button onClick={addThreeBroken}>+3 (broken: adds 1)</button>
      <button onClick={addThreeFixed}>+3 (updater: adds 3)</button>
      <button onClick={logRightAfterSetting}>+1 and log (check console)</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
// Rule of thumb: if the new value depends on the old one, use setX(prev => …).

// -----------------------------------------------------------------------------
// Several pieces of state + objects in state
// -----------------------------------------------------------------------------
function DrinkCustomizer() {
  const [isIced, setIsIced] = useState(false); // one useState per piece of data…
  const [drink, setDrink] = useState({ size: 'Medium', milk: 'Whole' }); // …or group them

  function chooseSize(size) {
    setDrink({ ...drink, size }); // ✅ a NEW object: copy, then override size
  }

  function chooseSizeBroken() {
    // ❌ Mutating: we change the SAME object and hand it back. React compares
    //    old === new, sees the same object, and SKIPS the re-render.
    // oxlint-disable-next-line react/immutability -- deliberately broken; the linter catches it
    drink.size = 'Large';
    setDrink(drink);
  }

  return (
    <div className="card">
      <p style={{ marginTop: 0 }}>
        Your drink: <strong>{drink.size}</strong> {isIced ? 'iced' : 'hot'} latte with{' '}
        <strong>{drink.milk}</strong> milk
      </p>
      <div className="row">
        <button onClick={() => chooseSize('Small')}>Small</button>
        <button onClick={() => chooseSize('Medium')}>Medium</button>
        <button onClick={() => chooseSize('Large')}>Large</button>
        <button onClick={() => setDrink({ ...drink, milk: drink.milk === 'Whole' ? 'Oat' : 'Whole' })}>
          Switch milk
        </button>
        <button onClick={() => setIsIced((previous) => !previous)}>Hot / iced</button>
        <button onClick={chooseSizeBroken}>Large (mutating, broken)</button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Lifting state up: sharing state between components
// -----------------------------------------------------------------------------
// The badge and the Add buttons are SIBLINGS. If the count lived inside an
// AddButton, the badge couldn't see it. So move ("lift") the state UP to their
// closest shared parent, pass the value DOWN as a prop, and pass a function
// DOWN so children can ask the parent to change it (lesson 04).
function CartBadge({ count }) {
  return <span className="badge">🛒 {count}</span>;
}

function AddButton({ label, onAdd }) {
  return <button onClick={onAdd}>Add {label}</button>;
}

function MiniShop() {
  const [cartCount, setCartCount] = useState(0); // lives in the PARENT
  const addOne = () => setCartCount((previous) => previous + 1);
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>☕ Corner Café</strong>
        <CartBadge count={cartCount} />
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <AddButton label="Latte" onAdd={addOne} />
        <AddButton label="Bagel" onAdd={addOne} />
        <button onClick={() => setCartCount(0)}>Empty cart</button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript you need first</h2>

      <h3>Array destructuring</h3>
      <Show code="const [firstSpecial, secondSpecial] = specials   → firstSpecial" value={firstSpecial} />
      <Show code="                                               → secondSpecial" value={secondSpecial} />
      <Show code="const [, , thirdSpecial] = specials" value={thirdSpecial} />
      <Show code="const [itemName, quantityText] = 'Latte:2'.split(':')" value={[itemName, quantityText]} />
      <Show code="const [cheaper, pricier] = sortTwoPrices(4.5, 2.25)" value={[cheaper, pricier]} />

      <h3>References</h3>
      <Show code="cart   (after sameCart.push('Bagel'))" value={cart} />
      <Show code="cart === sameCart" value={cart === sameCart} />
      <Show code="listA === listB   (both [1, 2])" value={listA === listB} />

      <h3>Immutable updates</h3>
      <Show code="mutated: oldCart !== mutatedCart   (is it new?)" value={oldCart !== mutatedCart} />
      <Show code="spread:  cart2 !== newCart         (is it new?)" value={cart2 !== newCart} />
      <Show code="[...drinks, 'Juice']" value={withJuice} />
      <Show code="['Water', ...drinks]" value={withWater} />
      <Show code="[...drinks, ...food]" value={fullMenu} />
      <Show code="{ ...drink, size: 'Large' }" value={bigDrink} />
      <Show code="updatedOrder.customer.phone" value={updatedOrder.customer.phone} />
      <Show code="order.customer.phone   (original untouched)" value={order.customer.phone} />

      <h3>Snapshots</h3>
      <Show code="handlerFromRender1()   (called after render 2)" value={handlerFromRender1()} />
      <Show code="handlerFromRender2()" value={handlerFromRender2()} />

      <h3>A mini useState</h3>
      <Show code="getCups()   before setCups" value={cupsBefore} />
      <Show code="getCups()   after setCups(getCups() + 1)" value={cupsAfter} />

      <h2>1B · The React part: useState</h2>

      <h3>useState fixes the broken counter</h3>
      <CupCounter />

      <h3>Snapshots & updater functions</h3>
      <SnapshotDemo />

      <h3>Multiple values & objects in state</h3>
      <DrinkCustomizer />

      <h3>Each instance has its own state</h3>
      <p className="muted">Same component, twice, like calling createCounter() twice in lesson 04:</p>
      <CupCounter />
      <CupCounter />

      <h3>Lifting state up</h3>
      <MiniShop />

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>Why does useState return an array and not an object?</li>
        <li>After const b = a; b.push(1), does a change? Why?</li>
        <li>What does "re-render" mean, in terms of your component function?</li>
        <li>Why does calling setCount(count + 1) three times only add 1?</li>
        <li>Why doesn't drink.size = 'Large'; setDrink(drink) update the screen?</li>
        <li>Two sibling components need the same value. Where should the state live?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 20 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: destructuring and immutable updates (no push, no obj.x = …)
// -----------------------------------------------------------------------------

// A1. parseOrderLine(line) → turn 'Latte:2' into ['Latte', 2].
//     Use .split(':'), ARRAY destructuring, and Number() for the quantity.
const parseOrderLine = (line) => {
  // TODO
};

// A2. addToOrder(order, item) → a NEW array with item at the end.
const addToOrder = (order, item) => {
  // TODO
};

// A3. addToFront(order, item) → a NEW array with item at the start.
const addToFront = (order, item) => {
  // TODO
};

// A4. updatePhone(order, phone) → a NEW order whose customer.phone is changed.
//     Nested! Neither the original order nor its customer may change.
const updatePhone = (order, phone) => {
  // TODO
};

// A5. PREDICT, then check: what will late() return? Write your answer as a string.
function makeStockReporter(stock) {
  return () => `Stock was ${stock}`;
}
let stock = 5;
const late = makeStockReporter(stock);
stock = 0;
const myPrediction = 'TODO: what does late() return?';

// -----------------------------------------------------------------------------
// B · React: a working Corner Café counter
// -----------------------------------------------------------------------------
//   B1. CafeQuantityPicker: a qty state starting at 1. "−" and "+" change it.
//       It can't go below 1 or above 10: disable the buttons at the limits,
//       e.g. <button disabled={qty === 1}>.
//   B2. CafeDrinkCustomizer: ONE object in state: { size: 'Medium', oatMilk: false }.
//       The size buttons change size (spread! don't mutate). "Oat milk" toggles
//       oatMilk. The summary reads "Large latte with oat milk" or
//       "Medium latte with regular milk".
//   B3. Lift state up: the cart count lives in CafeCart (the parent).
//       CafeCartHeader receives it as a prop and shows "🛒 3 items".
//       Each CafeCartItem's "Add" button increases it by 1 (onAdd prop).
//       "Empty cart" sets it to 0. "Add 3 lattes" adds 3 in ONE click: use
//       updater functions so it really adds 3!
//
// How to check: quantity stops at 1 and 10 with greyed-out buttons; changing
// size keeps the milk choice (and vice versa); the badge updates from the menu
// buttons; "Add 3 lattes" from 0 gives 3, not 1.
function CafeQuantityPicker() {
  // TODO B1
  return (
    <div className="row">
      <button>−</button>
      <strong>1</strong>
      <button>+</button>
    </div>
  );
}

function CafeDrinkCustomizer() {
  // TODO B2
  return (
    <div className="card">
      <p>Medium latte with regular milk</p>
      <div className="row">
        <button>Small</button>
        <button>Medium</button>
        <button>Large</button>
        <button>Oat milk</button>
      </div>
    </div>
  );
}

function CafeCartHeader() {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <strong>☕ Corner Café</strong>
      <span className="badge">🛒 0 items</span>
    </div>
  );
}

function CafeCartItem({ name }) {
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {name} <button>Add</button>
    </li>
  );
}

function CafeCart() {
  // TODO B3: the cart count state lives here
  return (
    <div className="card">
      <CafeCartHeader />
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        <CafeCartItem name="Latte" />
        <CafeCartItem name="Bagel" />
        <CafeCartItem name="Muffin" />
      </ul>
      <div className="row">
        <button>Add 3 lattes</button>
        <button>Empty cart</button>
      </div>
    </div>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="parseOrderLine('Latte:2')" run={() => parseOrderLine('Latte:2')} expected={['Latte', 2]} />
      <Check label="parseOrderLine('Muffin:10')" run={() => parseOrderLine('Muffin:10')} expected={['Muffin', 10]} />
      <Check label="addToOrder(['Coffee'], 'Bagel')" run={() => addToOrder(['Coffee'], 'Bagel')} expected={['Coffee', 'Bagel']} />
      <Check
        label="addToOrder returns a NEW array and leaves the old one alone"
        run={() => {
          const original = ['Coffee'];
          const result = addToOrder(original, 'Bagel');
          return Array.isArray(result) && result !== original && original.length === 1;
        }}
        expected={true}
      />
      <Check label="addToFront(['Coffee'], 'Water')" run={() => addToFront(['Coffee'], 'Water')} expected={['Water', 'Coffee']} />
      <Check
        label="updatePhone(order, '222')"
        run={() => updatePhone({ id: 5, customer: { name: 'Sam', phone: '111' } }, '222')}
        expected={{ id: 5, customer: { name: 'Sam', phone: '222' } }}
      />
      <Check
        label="updatePhone leaves the original customer alone"
        run={() => {
          const original = { id: 5, customer: { name: 'Sam', phone: '111' } };
          const result = updatePhone(original, '222');
          return result?.customer?.phone === '222' && result.customer !== original.customer && original.customer.phone === '111';
        }}
        expected={true}
      />
      <Check label="your prediction for late()" run={() => myPrediction} expected={late()} />

      <h3>B · React</h3>
      <h4>B1 · Quantity</h4>
      <CafeQuantityPicker />
      <h4>B2 · Customize</h4>
      <CafeDrinkCustomizer />
      <h4>B3 · Shared cart</h4>
      <CafeCart />
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
        In DrinkCustomizer, click "Large (mutating, broken)". Nothing happens. Then click "Hot / iced". Surprise!
        Explain why the size suddenly changed.
      </li>
      <li>
        In <code>CupCounter</code>, change <code>useState(0)</code> to <code>useState(10)</code>. Then try{' '}
        <code>useState('0')</code> (a string). What does clicking do now, and why?
      </li>
      <li>
        Add <code>console.log('CupCounter rendered')</code> at the top of CupCounter. Click, and count the
        renders.
      </li>
      <li>
        Move <code>cartCount</code> state from MiniShop into AddButton. What breaks, and why?
      </li>
      <li>
        In 1A, change <code>const sameCart = cart</code> to <code>const sameCart = [...cart]</code>. What does{' '}
        <code>cart</code> show now?
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

const parseOrderLineSolution = (line) => {
  const [name, qtyText] = line.split(':');
  return [name, Number(qtyText)];
};

const addToOrderSolution = (order, item) => [...order, item];

const addToFrontSolution = (order, item) => [item, ...order];

// Copy each level on the path to the thing we change.
const updatePhoneSolution = (order, phone) => ({
  ...order,
  customer: { ...order.customer, phone },
});

// late() closes over the `stock` PARAMETER, which was 5 at the moment of the
// call. Changing the outer variable later doesn't affect it: a snapshot.
const myPredictionSolution = 'Stock was 5';

function CafeQuantityPickerSolution() {
  const [qty, setQty] = useState(1);
  return (
    <div className="row">
      <button onClick={() => setQty((q) => q - 1)} disabled={qty === 1}>
        −
      </button>
      <strong>{qty}</strong>
      <button onClick={() => setQty((q) => q + 1)} disabled={qty === 10}>
        +
      </button>
    </div>
  );
}

function CafeDrinkCustomizerSolution() {
  const [drink, setDrink] = useState({ size: 'Medium', oatMilk: false });
  const chooseSize = (size) => setDrink({ ...drink, size });
  const toggleOat = () => setDrink({ ...drink, oatMilk: !drink.oatMilk });
  return (
    <div className="card">
      <p>
        {drink.size} latte with {drink.oatMilk ? 'oat' : 'regular'} milk
      </p>
      <div className="row">
        <button onClick={() => chooseSize('Small')}>Small</button>
        <button onClick={() => chooseSize('Medium')}>Medium</button>
        <button onClick={() => chooseSize('Large')}>Large</button>
        <button onClick={toggleOat}>Oat milk</button>
      </div>
    </div>
  );
}

function CafeCartHeaderSolution({ cartCount }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <strong>☕ Corner Café</strong>
      <span className="badge">🛒 {cartCount} items</span>
    </div>
  );
}

function CafeCartItemSolution({ name, onAdd }) {
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {name} <button onClick={onAdd}>Add</button>
    </li>
  );
}

function CafeCartSolution() {
  const [cartCount, setCartCount] = useState(0); // lifted up: header AND items need it
  const addOne = () => setCartCount((count) => count + 1);
  function addThreeLattes() {
    setCartCount((count) => count + 1); // each updater sees the previous result
    setCartCount((count) => count + 1);
    setCartCount((count) => count + 1);
  }
  return (
    <div className="card">
      <CafeCartHeaderSolution cartCount={cartCount} />
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        <CafeCartItemSolution name="Latte" onAdd={addOne} />
        <CafeCartItemSolution name="Bagel" onAdd={addOne} />
        <CafeCartItemSolution name="Muffin" onAdd={addOne} />
      </ul>
      <div className="row">
        <button onClick={addThreeLattes}>Add 3 lattes</button>
        <button onClick={() => setCartCount(0)}>Empty cart</button>
      </div>
    </div>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="parseOrderLine('Latte:2')" run={() => parseOrderLineSolution('Latte:2')} expected={['Latte', 2]} />
      <Check label="addToOrder(['Coffee'], 'Bagel')" run={() => addToOrderSolution(['Coffee'], 'Bagel')} expected={['Coffee', 'Bagel']} />
      <Check label="addToFront(['Coffee'], 'Water')" run={() => addToFrontSolution(['Coffee'], 'Water')} expected={['Water', 'Coffee']} />
      <Check
        label="updatePhone(order, '222')"
        run={() => updatePhoneSolution({ id: 5, customer: { name: 'Sam', phone: '111' } }, '222')}
        expected={{ id: 5, customer: { name: 'Sam', phone: '222' } }}
      />
      <Check label="prediction for late()" run={() => myPredictionSolution} expected={late()} />

      <h3>B · React</h3>
      <h4>B1 · Quantity</h4>
      <CafeQuantityPickerSolution />
      <h4>B2 · Customize</h4>
      <CafeDrinkCustomizerSolution />
      <h4>B3 · Shared cart</h4>
      <CafeCartSolution />
    </div>
  );
}
