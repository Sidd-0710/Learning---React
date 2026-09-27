// =============================================================================
// LESSON 04 · EVENT HANDLING
// =============================================================================
//
//   PART 1 · LEARN        functions as values & closures, then events
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–03.
// 👉 Keep the browser console open (Cmd+Option+J / Ctrl+Shift+J). Most event
//    demos log there. You'll see why at the end of PART 1.
//
// What you'll learn
//   JavaScript: functions as values, callbacks, passing vs. calling, closures
//   React:      onClick, passing arguments, the event object, preventDefault,
//               bubbling, handlers passed down as props
// =============================================================================

import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST
// =============================================================================

// -----------------------------------------------------------------------------
// Functions are values
// -----------------------------------------------------------------------------
// A function is a value, like a number or a string. You can store it in
// another variable. NO parentheses: we copy the function itself.
const sayHi = () => 'Hi!';
const alsoSayHi = sayHi;

// -----------------------------------------------------------------------------
// Callbacks: passing a function INTO another function
// -----------------------------------------------------------------------------
const applyDiscount = (price, discountRule) => discountRule(price);
const halfPrice = (price) => price / 2;
// applyDiscount(8, halfPrice)            → 4
// applyDiscount(8, (price) => price - 1) → 7   (an inline arrow, written right where it's used)
//
// The built-in setTimeout works the same way: you give it a function, and it
// calls that function LATER:
setTimeout(() => console.log('Lesson 04: ⏰ this ran 1 second after the file loaded'), 1000);

// -----------------------------------------------------------------------------
// Passing a function vs. calling it   ← the most important idea in this lesson
// -----------------------------------------------------------------------------
const makeCoffee = () => 'coffee';
const whatDidIGet = (thing) => (typeof thing === 'function' ? 'a function (nobody has called it yet)' : `the result: '${thing}'`);
//   whatDidIGet(makeCoffee)    → hands over the FUNCTION. It hasn't run.
//   whatDidIGet(makeCoffee())  → RUNS makeCoffee right now, hands over its RESULT.
//
// In React you'll write:
//   onClick={handleClick}      ✅ "call handleClick later, when clicked"
//   onClick={handleClick()}    ❌ "call handleClick right now, while drawing"
// That second one is the #1 beginner bug with events. Now you know why.

// -----------------------------------------------------------------------------
// Closures: functions remember where they were born
// -----------------------------------------------------------------------------
function createCounter() {
  let count = 0; // a local variable of createCounter
  return () => {
    count = count + 1; // the returned function USES count
    return count;
  };
}
// After createCounter finishes, its `count` would normally be gone. But the
// function we got back still needs it, so JavaScript keeps it alive.
// "A function + the variables it remembers" is a CLOSURE.
const nextTicket = createCounter();
const firstThreeTickets = [nextTicket(), nextTicket(), nextTicket()];

// Each call to createCounter makes a NEW, private count:
const counterA = createCounter();
const counterB = createCounter();
const independent = [counterA(), counterA(), counterB()]; // counterB starts at 1 on its own

// "Configure now, use later": the returned function remembers `percent`.
const createTipCalculator = (percent) => (bill) => (bill * percent) / 100;
const tip15 = createTipCalculator(15);

// Handlers that remember WHICH item they're for. This is exactly what
// onClick={() => order(item.name)} does in React.
const makeOrderMessage = (itemName) => () => `Ordered one ${itemName}`;
const orderLatte = makeOrderMessage('Latte');
const orderScone = makeOrderMessage('Scone');

// =============================================================================
// 1B · THE REACT PART: EVENT HANDLING
// =============================================================================

// -----------------------------------------------------------------------------
// Handling a click
// -----------------------------------------------------------------------------
function OrderButton() {
  // A handler is just a function. Convention: name it handleSomething.
  function handleClick() {
    console.log('☕ Order placed!');
  }
  // Pass the FUNCTION ITSELF (no parentheses). React calls it on click.
  return <button onClick={handleClick}>Order coffee</button>;
}

// -----------------------------------------------------------------------------
// The #1 mistake: calling the handler instead of passing it
// -----------------------------------------------------------------------------
function BrokenButton() {
  function handleClick() {
    console.log('😬 BrokenButton: I ran during RENDERING, not on a click!');
  }
  // ❌ handleClick() runs NOW, while React draws the button, and passes its
  //    return value (undefined) to onClick. Clicking does nothing. Look in the
  //    console: the message appeared when the page loaded. (You may see it
  //    twice. That's StrictMode, explained in lesson 09.)
  return <button onClick={handleClick()}>Broken button (clicking does nothing)</button>;
}

// -----------------------------------------------------------------------------
// Passing arguments: wrap the call in an arrow function (a closure!)
// -----------------------------------------------------------------------------
function DrinkButtons() {
  function orderDrink(drinkName) {
    alert(`You ordered a ${drinkName}!`);
  }
  return (
    <div className="row">
      {/* The arrow is a NEW function that, when called later, calls
          orderDrink('Latte'). It remembers 'Latte': a closure. */}
      <button onClick={() => orderDrink('Latte')}>Latte</button>
      <button onClick={() => orderDrink('Mocha')}>Mocha</button>
      {/* ❌ onClick={orderDrink('Tea')} would run immediately. Same bug as above. */}
    </div>
  );
}

// -----------------------------------------------------------------------------
// The event object
// -----------------------------------------------------------------------------
function EventDetails() {
  function handleClick(event) {
    console.log('type:', event.type); // 'click'
    console.log('which element:', event.currentTarget); // the <button>
    console.log('shift key held?', event.shiftKey);
  }
  // In React, onChange fires on EVERY keystroke.
  function handleChange(event) {
    console.log('input value:', event.target.value);
  }
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      console.log('⏎ Enter pressed with value:', event.target.value);
    }
  }
  return (
    <div className="row">
      <button onClick={handleClick}>Click me (try holding Shift)</button>
      <input placeholder="Type, then press Enter…" onChange={handleChange} onKeyDown={handleKeyDown} />
    </div>
  );
}
// Other common events: onSubmit, onFocus, onBlur, onMouseEnter, onMouseLeave.
// All camelCase, all take a function.

// -----------------------------------------------------------------------------
// preventDefault: stopping the browser's built-in behavior
// -----------------------------------------------------------------------------
// Submitting a <form> makes the browser RELOAD the page. In React you almost
// always stop that and handle it yourself.
function NewsletterForm() {
  function handleSubmit(event) {
    event.preventDefault(); // 🛑 no page reload
    console.log('📧 Form submitted, and the page did not reload.');
  }
  return (
    // onSubmit goes on the <form>. It fires for button clicks AND for Enter.
    <form onSubmit={handleSubmit} className="row">
      <input name="email" type="email" placeholder="you@example.com" />
      <button type="submit">Join newsletter</button>
    </form>
  );
}

// -----------------------------------------------------------------------------
// Bubbling: clicks travel UP through parent elements
// -----------------------------------------------------------------------------
function ClickableCard() {
  return (
    <div className="card" onClick={() => console.log('📦 Card clicked: show item details')}>
      <p style={{ marginTop: 0 }}>🧁 Blueberry Muffin (click anywhere on this card)</p>
      <div className="row">
        <button
          onClick={(event) => {
            event.stopPropagation(); // the card will NOT hear this click
            console.log('❤️ Favorited (and the card did not react)');
          }}
        >
          Favorite (stops propagation)
        </button>
        <button onClick={() => console.log('🛒 Added to cart… and the card also hears it ↓')}>
          Add to cart (bubbles up)
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Handlers as props: how children talk to parents
// -----------------------------------------------------------------------------
// Props flow DOWN (lesson 03). But a parent can pass DOWN a function, and the
// child can call it. That's how information travels back UP.
// Convention: the prop is onSomething, the function is handleSomething.
function MenuRow({ name, price, onOrder }) {
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {name} · ${price.toFixed(2)}
      <button onClick={() => onOrder(name)}>Order</button>
    </li>
  );
}

function MenuWithHandlers() {
  function handleOrder(itemName) {
    console.log(`👨‍🍳 The parent received an order for: ${itemName}`);
  }
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
      <MenuRow name="Latte" price={4.5} onOrder={handleOrder} />
      <MenuRow name="Scone" price={3} onOrder={handleOrder} />
    </ul>
  );
}

// -----------------------------------------------------------------------------
// The cliffhanger: why is everything going to the console?
// -----------------------------------------------------------------------------
function BrokenCounter() {
  let cups = 0; // a normal variable

  function handleClick() {
    // The linter warns about the next line. It knows this can't work!
    // oxlint-disable-next-line react/immutability
    cups = cups + 1;
    console.log('cups is now', cups); // the console says 1, 2, 3…
  }

  return (
    <div className="row">
      <button onClick={handleClick}>Add a cup</button>
      <span>Cups on screen: {cups}</span> {/* …but the screen stays at 0! */}
    </div>
  );
}
// Two reasons:
//   1. Changing a normal variable doesn't tell React to redraw anything.
//   2. Even if React DID redraw, it would call BrokenCounter() again, and the
//      first line would reset `cups` back to 0.
// We need a value React REMEMBERS between draws, plus a way to say "this
// changed, please redraw". That's state: the next lesson.

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript you need first</h2>

      <h3>Functions are values</h3>
      <Show code="typeof sayHi" value={typeof sayHi} />
      <Show code="alsoSayHi()   (a copy of sayHi)" value={alsoSayHi()} />

      <h3>Callbacks</h3>
      <Show code="applyDiscount(8, halfPrice)" value={applyDiscount(8, halfPrice)} />
      <Show code="applyDiscount(8, (price) => price - 1)" value={applyDiscount(8, (p) => p - 1)} />

      <h3>Passing vs. calling</h3>
      <Show code="whatDidIGet(makeCoffee)" value={whatDidIGet(makeCoffee)} />
      <Show code="whatDidIGet(makeCoffee())" value={whatDidIGet(makeCoffee())} />

      <h3>Closures</h3>
      <Show code="[nextTicket(), nextTicket(), nextTicket()]" value={firstThreeTickets} />
      <Show code="[counterA(), counterA(), counterB()]" value={independent} />
      <Show code="tip15(40)" value={tip15(40)} />
      <Show code="orderLatte()" value={orderLatte()} />
      <Show code="orderScone()" value={orderScone()} />

      <h2>1B · The React part: event handling</h2>
      <p className="muted">👉 Keep the browser console open while you try these.</p>

      <h3>onClick</h3>
      <OrderButton />

      <h3>The #1 mistake</h3>
      <BrokenButton />

      <h3>Passing arguments</h3>
      <DrinkButtons />

      <h3>The event object</h3>
      <EventDetails />

      <h3>preventDefault</h3>
      <NewsletterForm />

      <h3>Bubbling & stopPropagation</h3>
      <ClickableCard />

      <h3>Handlers as props</h3>
      <MenuWithHandlers />

      <h3>The cliffhanger</h3>
      <BrokenCounter />

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>What's wrong with onClick={'{save()}'}? What does React receive?</li>
        <li>How do you pass 'Latte' to a handler when a button is clicked?</li>
        <li>In your own words: what is a closure?</li>
        <li>Why call event.preventDefault() in a form's onSubmit?</li>
        <li>A child needs to tell its parent "I was clicked". How?</li>
        <li>In BrokenCounter, why doesn't the screen update?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 20 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: callbacks and closures
// -----------------------------------------------------------------------------

// A1. applyToEach(prices, fn): call fn on the FIRST and the SECOND price, and
//     return both results in a new array.
//     applyToEach([10, 20], (p) => p * 2) → [20, 40]
const applyToEach = (prices, fn) => {
  // TODO
};

// A2. happyHour(price) → price minus 1. Then set happyHourPrices by calling
//     applyToEach([4, 5], …) with happyHour. PASS it, don't call it!
const happyHour = (price) => {
  // TODO
};
const happyHourPrices = undefined; // ← TODO: replace with a call to applyToEach

// A3. createOrderNumberGenerator(prefix) → returns a FUNCTION that gives the
//     next order number each time it's called:
//       const next = createOrderNumberGenerator('A');
//       next() → 'A-1',  next() → 'A-2'
//     Two generators must count independently. (A closure over a count!)
const createOrderNumberGenerator = (prefix) => {
  // TODO
};

// A4. createDiscount(percentOff) → returns a function that takes a price and
//     returns the discounted price.   createDiscount(10)(20) → 18
const createDiscount = (percentOff) => {
  // TODO
};

// -----------------------------------------------------------------------------
// B · React: wire up the Corner Café screen (results go to the CONSOLE)
// -----------------------------------------------------------------------------
//   B1. CafeOrderRow: give the "Order" button an onClick that calls the onOrder
//       prop with the item's name and price. In CafeOrderScreen, write
//       handleOrder so it logs:   Ordered: Latte ($4.50)
//   B2. Search box: log  Searching for: <text>  on every keystroke.
//   B3. Notes box: when Enter is pressed, log  Note saved: <text>
//   B4. Checkout form: on submit, log  Order submitted!  The page must NOT reload.
//   B5. Muffin card: clicking the card logs  Show details for Muffin.
//       The "Quick add" button logs  Quick-added Muffin  and must NOT also
//       trigger the card's message.
//
// How to check (in the console):
//   • Order on Latte / Bagel logs the right name AND price.
//   • Typing "tea" in search logs "t", "te", "tea".
//   • Enter in notes logs the note; other keys log nothing.
//   • Submitting logs once, and the console isn't cleared (no reload).
//   • Quick add logs ONLY "Quick-added Muffin".
//   • Nothing is logged just by loading the page. (If it is, you're CALLING a
//     handler during render: look for handler() inside onSomething={ }.)
function CafeOrderRow({ name, price, onOrder }) {
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {name} · ${price.toFixed(2)}
      <button>Order</button>
    </li>
  );
}

function CafeOrderScreen() {
  function handleOrder(name, price) {
    // TODO B1
  }

  return (
    <div>
      <h4>Menu</h4>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        <CafeOrderRow name="Latte" price={4.5} onOrder={handleOrder} />
        <CafeOrderRow name="Bagel" price={2.25} onOrder={handleOrder} />
      </ul>

      <h4>Search</h4>
      {/* TODO B2 */}
      <input placeholder="Search the menu…" />

      <h4>Notes</h4>
      {/* TODO B3 */}
      <input placeholder="e.g. extra hot, then press Enter" />

      <h4>Checkout</h4>
      {/* TODO B4 */}
      <form className="row">
        <input placeholder="Your name" />
        <button type="submit">Place order</button>
      </form>

      <h4>Featured</h4>
      {/* TODO B5 */}
      <div className="card">
        <p>🧁 Muffin · $2.75</p>
        <button>Quick add</button>
      </div>
    </div>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="applyToEach([10, 20], (p) => p * 2)" run={() => applyToEach([10, 20], (p) => p * 2)} expected={[20, 40]} />
      <Check label="happyHour(4)" run={() => happyHour(4)} expected={3} />
      <Check label="happyHourPrices" run={() => happyHourPrices} expected={[3, 4]} />
      <Check
        label="generator 'A': first two numbers"
        run={() => {
          const next = createOrderNumberGenerator('A');
          return [next(), next()];
        }}
        expected={['A-1', 'A-2']}
      />
      <Check
        label="two generators count independently"
        run={() => {
          const a = createOrderNumberGenerator('A');
          const b = createOrderNumberGenerator('B');
          a();
          a();
          return [a(), b()];
        }}
        expected={['A-3', 'B-1']}
      />
      <Check label="createDiscount(10)(20)" run={() => createDiscount(10)(20)} expected={18} />
      <Check label="createDiscount(50)(8)" run={() => createDiscount(50)(8)} expected={4} />

      <h3>B · React: the order screen (check the console)</h3>
      <CafeOrderScreen />
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
        In <code>NewsletterForm</code>, delete the <code>event.preventDefault()</code> line, save, and submit. The
        whole page reloads and the console clears. Put it back.
      </li>
      <li>
        In <code>DrinkButtons</code>, change one button to <code>onClick={'{orderDrink(\'Tea\')}'}</code>. What
        happens when the page loads?
      </li>
      <li>
        Call <code>createCounter()</code> a third time as <code>counterC</code> and show its first value. Is it
        affected by counterA?
      </li>
      <li>
        Remove <code>event.stopPropagation()</code> from the Favorite button and click it. How many messages now?
      </li>
      <li>
        Add <code>onMouseEnter</code> and <code>onMouseLeave</code> handlers to the muffin card that log "hovering"
        and "left".
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

// fn is a callback. We decide when to call it: once per price.
const applyToEachSolution = (prices, fn) => [fn(prices[0]), fn(prices[1])];

const happyHourSolution = (price) => price - 1;
// Pass happyHourSolution itself (no parentheses). applyToEach calls it for us.
const happyHourPricesSolution = applyToEachSolution([4, 5], happyHourSolution);

// `count` lives in this call. The returned function remembers it, and each
// generator gets its own.
const createOrderNumberGeneratorSolution = (prefix) => {
  let count = 0;
  return () => {
    count = count + 1;
    return `${prefix}-${count}`;
  };
};

// An arrow returning an arrow. The inner one remembers percentOff.
const createDiscountSolution = (percentOff) => (price) => price - (price * percentOff) / 100;

function CafeOrderRowSolution({ name, price, onOrder }) {
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {name} · ${price.toFixed(2)}
      {/* Wrap in an arrow so we can pass arguments. Don't call onOrder directly! */}
      <button onClick={() => onOrder(name, price)}>Order</button>
    </li>
  );
}

function CafeOrderScreenSolution() {
  function handleOrder(name, price) {
    console.log(`Ordered: ${name} ($${price.toFixed(2)})`);
  }
  function handleSearch(event) {
    console.log(`Searching for: ${event.target.value}`);
  }
  function handleNoteKeyDown(event) {
    if (event.key === 'Enter') {
      console.log(`Note saved: ${event.target.value}`);
    }
  }
  function handleSubmit(event) {
    event.preventDefault(); // stop the page reload
    console.log('Order submitted!');
  }
  function handleQuickAdd(event) {
    event.stopPropagation(); // don't let the card hear this click
    console.log('Quick-added Muffin');
  }

  return (
    <div>
      <h4>Menu</h4>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        <CafeOrderRowSolution name="Latte" price={4.5} onOrder={handleOrder} />
        <CafeOrderRowSolution name="Bagel" price={2.25} onOrder={handleOrder} />
      </ul>

      <h4>Search</h4>
      <input placeholder="Search the menu…" onChange={handleSearch} />

      <h4>Notes</h4>
      <input placeholder="e.g. extra hot, then press Enter" onKeyDown={handleNoteKeyDown} />

      <h4>Checkout</h4>
      <form className="row" onSubmit={handleSubmit}>
        <input placeholder="Your name" />
        <button type="submit">Place order</button>
      </form>

      <h4>Featured</h4>
      <div className="card" onClick={() => console.log('Show details for Muffin')}>
        <p>🧁 Muffin · $2.75</p>
        <button onClick={handleQuickAdd}>Quick add</button>
      </div>
    </div>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="applyToEach([10, 20], (p) => p * 2)" run={() => applyToEachSolution([10, 20], (p) => p * 2)} expected={[20, 40]} />
      <Check label="happyHour(4)" run={() => happyHourSolution(4)} expected={3} />
      <Check label="happyHourPrices" run={() => happyHourPricesSolution} expected={[3, 4]} />
      <Check
        label="two generators count independently"
        run={() => {
          const a = createOrderNumberGeneratorSolution('A');
          const b = createOrderNumberGeneratorSolution('B');
          a();
          a();
          return [a(), b()];
        }}
        expected={['A-3', 'B-1']}
      />
      <Check label="createDiscount(10)(20)" run={() => createDiscountSolution(10)(20)} expected={18} />

      <h3>B · React: the order screen (check the console)</h3>
      <CafeOrderScreenSolution />
    </div>
  );
}
