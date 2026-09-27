// =============================================================================
// LESSON 07 · LISTS AND KEYS
// =============================================================================
//
//   PART 1 · LEARN        array methods, then lists in React
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–06 (spread and immutability from lesson 05!).
//
// What you'll learn
//   JavaScript: map, filter, find, some/every, reduce, chaining, which methods
//               mutate, toSorted, the update/remove patterns
//   React:      rendering arrays, keys (and the index-key bug), derived lists,
//               add/update/remove in array state
// =============================================================================

import { useState } from 'react';
import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST: ARRAY METHODS
// =============================================================================
// Each method below takes a CALLBACK (lesson 04): a function called once per
// item, receiving that item. They all return NEW values and leave the original
// array alone, which is exactly what React needs (lesson 05).

const menu = [
  { id: 1, name: 'Coffee', price: 3.5, category: 'drinks', inStock: true },
  { id: 2, name: 'Bagel', price: 2.25, category: 'food', inStock: true },
  { id: 3, name: 'Orange Juice', price: 4, category: 'drinks', inStock: false },
  { id: 4, name: 'Muffin', price: 2.75, category: 'food', inStock: true },
];

// -----------------------------------------------------------------------------
// map: transform EVERY item → a new array of the same length
// -----------------------------------------------------------------------------
const names = menu.map((item) => item.name);
const labels = menu.map(({ name, price }) => `${name}: $${price.toFixed(2)}`); // destructuring, lesson 03
const numbered = menu.map((item, index) => `${index + 1}. ${item.name}`); // 2nd argument: the index

// ⚠️ The classic map bug: braces without `return` (lesson 01's gotcha!)
const broken = menu.map((item) => {
  // oxlint-disable-next-line no-unused-expressions -- deliberately broken for the lesson
  item.name;
});

// -----------------------------------------------------------------------------
// filter: KEEP the items whose callback returns true
// -----------------------------------------------------------------------------
const available = menu.filter((item) => item.inStock);
const cheap = menu.filter((item) => item.price < 3);

// -----------------------------------------------------------------------------
// find: the FIRST matching item, or undefined
// -----------------------------------------------------------------------------
const bagel = menu.find((item) => item.id === 2);
const pizza = menu.find((item) => item.name === 'Pizza'); // undefined → use ?. (lesson 06)

// -----------------------------------------------------------------------------
// some / every: yes-or-no questions about the whole list
// -----------------------------------------------------------------------------
const anySoldOut = menu.some((item) => !item.inStock);
const allUnderFive = menu.every((item) => item.price < 5);

// -----------------------------------------------------------------------------
// reduce: boil a list down to ONE value (like a total)
// -----------------------------------------------------------------------------
const cart = [
  { name: 'Coffee', price: 3.5, qty: 2 },
  { name: 'Muffin', price: 2.75, qty: 1 },
];

// With a loop you already know: start at 0, add each line.
let totalWithLoop = 0;
for (const line of cart) {
  totalWithLoop = totalWithLoop + line.price * line.qty;
}

// With reduce: the SAME idea. The callback gets (runningTotal, currentItem) and
// returns the new running total. The 0 at the end is the starting value.
const totalWithReduce = cart.reduce((runningTotal, line) => runningTotal + line.price * line.qty, 0);
// If reduce feels confusing, a loop is fine. But you'll SEE reduce for totals
// in lots of React code, so be able to read it.

// -----------------------------------------------------------------------------
// Chaining: each method returns an array, so call the next one right away
// -----------------------------------------------------------------------------
const cheapAvailableNames = menu
  .filter((item) => item.inStock)
  .filter((item) => item.price < 3)
  .map((item) => item.name);

// -----------------------------------------------------------------------------
// Which methods MUTATE the original?
// -----------------------------------------------------------------------------
// ✅ return a NEW array (safe in React):  map, filter, slice, toSorted, [...spread]
// ❌ CHANGE the original (avoid on state): push, pop, shift, unshift, splice, sort, reverse
const byPrice = menu.toSorted((a, b) => a.price - b.price); // a sorted COPY, low → high

// -----------------------------------------------------------------------------
// The two update patterns you'll use in React state ALL the time
// -----------------------------------------------------------------------------
const order = [
  { id: 1, name: 'Coffee', qty: 1 },
  { id: 4, name: 'Muffin', qty: 1 },
];
// UPDATE one item: map over everything; matching item → changed COPY; others → untouched.
const moreCoffee = order.map((line) => (line.id === 1 ? { ...line, qty: line.qty + 1 } : line));
// REMOVE one item: filter keeps everything EXCEPT that id.
const noMuffin = order.filter((line) => line.id !== 4);

// =============================================================================
// 1B · THE REACT PART: LISTS AND KEYS
// =============================================================================

const MENU = [
  { id: 1, name: 'Coffee', price: 3.5, category: 'drinks' },
  { id: 2, name: 'Latte', price: 4.5, category: 'drinks' },
  { id: 3, name: 'Chai', price: 3.25, category: 'drinks' },
  { id: 4, name: 'Bagel', price: 2.25, category: 'food' },
  { id: 5, name: 'Muffin', price: 2.75, category: 'food' },
];

// -----------------------------------------------------------------------------
// map: data → JSX
// -----------------------------------------------------------------------------
// React can render an ARRAY of elements (lesson 01). So map your data into an
// array of <li>s and put it inside the <ul>.
function SimpleMenu() {
  return (
    <ul>
      {MENU.map((item) => (
        // key: a stable, unique identifier for this item among its siblings.
        <li key={item.id}>
          {item.name} · ${item.price.toFixed(2)}
        </li>
      ))}
    </ul>
  );
}
// Forget the key and React warns in the console:
//   "Each child in a list should have a unique 'key' prop."

// -----------------------------------------------------------------------------
// Why keys matter (and why index keys are risky)
// -----------------------------------------------------------------------------
// When a list changes, React matches OLD items to NEW items BY KEY. Each row's
// inner state (like text typed in an input) sticks to its KEY.
// With index keys, inserting at the top shifts every index by one, so typed
// text stays at "row 0" even though row 0 is now a DIFFERENT drink.
// Try it: type a note next to "Latte" in BOTH lists, then click the button.
const EXTRA_DRINKS = ['Mocha', 'Espresso', 'Cortado', 'Flat White', 'Matcha'];

function KeyDemo() {
  const [drinks, setDrinks] = useState([
    { id: 'latte', name: 'Latte' },
    { id: 'tea', name: 'Tea' },
  ]);

  function addToTop() {
    const name = EXTRA_DRINKS[(drinks.length - 2) % EXTRA_DRINKS.length];
    // crypto.randomUUID() makes a unique id: great for items people create.
    setDrinks([{ id: crypto.randomUUID(), name }, ...drinks]);
  }

  return (
    <div>
      <button onClick={addToTop}>Add a drink to the top</button>
      <div className="row" style={{ alignItems: 'flex-start', gap: 32 }}>
        <div>
          <p className="error">❌ key={'{index}'}</p>
          <ul>
            {drinks.map((drink, index) => (
              <li key={index}>
                {drink.name} <input placeholder="note" size={10} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="success">✅ key={'{drink.id}'}</p>
          <ul>
            {drinks.map((drink) => (
              <li key={drink.id}>
                {drink.name} <input placeholder="note" size={10} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
// Key rules:
//   • Use a stable, unique id from your data.
//   • Keys only need to be unique among SIBLINGS.
//   • Never generate keys during render (key={Math.random()}): every render
//     would rebuild every row from scratch.
//   • Index keys are OK only if the list never reorders, filters or inserts.

// -----------------------------------------------------------------------------
// Filter, then map (with an extracted row component)
// -----------------------------------------------------------------------------
// The visible list is CALCULATED from state. Only the chosen category is state.
function FilterableMenu() {
  const [category, setCategory] = useState('all');

  // ✅ Derived data: compute during render. Don't store the filtered list in its
  //    own useState: it would duplicate the menu and could get out of sync.
  const visibleItems = category === 'all' ? MENU : MENU.filter((item) => item.category === category);

  return (
    <div>
      <div className="row">
        <button onClick={() => setCategory('all')} disabled={category === 'all'}>
          All
        </button>
        <button onClick={() => setCategory('drinks')} disabled={category === 'drinks'}>
          Drinks
        </button>
        <button onClick={() => setCategory('food')} disabled={category === 'food'}>
          Food
        </button>
      </div>
      <ul>
        {/* The key goes HERE, on the element in the map, not inside MenuRow. */}
        {visibleItems.map((item) => (
          <MenuRow key={item.id} name={item.name} price={item.price} />
        ))}
      </ul>
      <p className="muted">
        Showing {visibleItems.length} of {MENU.length} items.
      </p>
    </div>
  );
}

// `key` is used by React itself and is NOT passed to your component. If MenuRow
// needs the id, pass it separately (e.g. id={item.id}).
function MenuRow({ name, price }) {
  return (
    <li>
      {name} · ${price.toFixed(2)}
    </li>
  );
}

// -----------------------------------------------------------------------------
// Arrays in state: add, update, remove, without mutating
// -----------------------------------------------------------------------------
function CartDemo() {
  const [cartLines, setCartLines] = useState([]); // each line: { id, name, price, qty }

  function addToCart(menuItem) {
    if (cartLines.some((line) => line.id === menuItem.id)) {
      // UPDATE: map → change the matching line (as a copy), keep the rest
      setCartLines(cartLines.map((line) => (line.id === menuItem.id ? { ...line, qty: line.qty + 1 } : line)));
    } else {
      // ADD: spread the old lines into a new array, plus the new line
      setCartLines([...cartLines, { ...menuItem, qty: 1 }]);
    }
  }

  function removeFromCart(id) {
    setCartLines(cartLines.filter((line) => line.id !== id)); // REMOVE
  }

  const total = cartLines.reduce((sum, line) => sum + line.price * line.qty, 0); // derived

  return (
    <div className="row" style={{ alignItems: 'flex-start', gap: 32 }}>
      <div>
        <strong>Menu</strong>
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {MENU.map((item) => (
            <li key={item.id} className="row" style={{ marginBottom: 6 }}>
              <button onClick={() => addToCart(item)}>+</button> {item.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="card" style={{ minWidth: 240 }}>
        <strong>Your cart</strong>
        {cartLines.length === 0 ? (
          <p className="muted">Nothing here yet.</p>
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {cartLines.map((line) => (
              <li key={line.id} className="row" style={{ marginBottom: 6 }}>
                {line.qty} × {line.name} = ${(line.price * line.qty).toFixed(2)}
                <button onClick={() => removeFromCart(line.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <p>
          <strong>Total: ${total.toFixed(2)}</strong>
        </p>
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
      <h2>1A · The JavaScript you need first: array methods</h2>

      <h3>map</h3>
      <Show code="menu.map((item) => item.name)" value={names} />
      <Show code="menu.map(({ name, price }) => `${name}: $${price.toFixed(2)}`)" value={labels} />
      <Show code="menu.map((item, index) => `${index + 1}. ${item.name}`)" value={numbered} />
      <Show code="menu.map((item) => { item.name; })   ⚠️ no return" value={broken} />

      <h3>filter</h3>
      <Show code="menu.filter((item) => item.inStock)   (names)" value={available.map((item) => item.name)} />
      <Show code="menu.filter((item) => item.price < 3)   (names)" value={cheap.map((item) => item.name)} />

      <h3>find</h3>
      <Show code="menu.find((item) => item.id === 2)" value={bagel} />
      <Show code="menu.find((item) => item.name === 'Pizza')" value={pizza} />
      <Show code="pizza?.price ?? 'not on the menu'" value={pizza?.price ?? 'not on the menu'} />

      <h3>some / every</h3>
      <Show code="menu.some((item) => !item.inStock)" value={anySoldOut} />
      <Show code="menu.every((item) => item.price < 5)" value={allUnderFive} />

      <h3>reduce</h3>
      <Show code="totalWithLoop" value={totalWithLoop} />
      <Show code="cart.reduce((total, line) => total + line.price * line.qty, 0)" value={totalWithReduce} />

      <h3>Chaining</h3>
      <Show code="menu.filter(inStock).filter(price < 3).map(name)" value={cheapAvailableNames} />

      <h3>Sorting without mutating</h3>
      <Show code="menu.toSorted((a, b) => a.price - b.price)   (names)" value={byPrice.map((item) => item.name)} />
      <Show code="menu   (names, original order unchanged)" value={menu.map((item) => item.name)} />

      <h3>Update & remove</h3>
      <Show code="order.map((line) => line.id === 1 ? { ...line, qty: line.qty + 1 } : line)" value={moreCoffee} />
      <Show code="order.filter((line) => line.id !== 4)" value={noMuffin} />
      <Show code="order   (original untouched)" value={order} />

      <h2>1B · The React part: lists and keys</h2>

      <h3>map: data → JSX</h3>
      <SimpleMenu />

      <h3>Why keys matter</h3>
      <KeyDemo />

      <h3>Filter, then map</h3>
      <FilterableMenu />

      <h3>Arrays in state</h3>
      <CartDemo />

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>map vs filter: which one can change the LENGTH of the array?</li>
        <li>What does find() give back when nothing matches?</li>
        <li>Why is menu.sort(…) risky in React, and what do you use instead?</li>
        <li>What does React use keys for? Why did the note jump to the wrong drink?</li>
        <li>Why is the filtered list NOT stored in state?</li>
        <li>Write the setter call that removes the line with id 3.</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 20 minutes. No `for` loops and no mutating in part A!

const cafeMenu = [
  { id: 1, name: 'Coffee', price: 3.5, category: 'drinks', inStock: true },
  { id: 2, name: 'Bagel', price: 2.25, category: 'food', inStock: true },
  { id: 3, name: 'Orange Juice', price: 4, category: 'drinks', inStock: false },
  { id: 4, name: 'Muffin', price: 2.75, category: 'food', inStock: true },
];
const cafeOrder = [
  { id: 1, name: 'Coffee', price: 3.5, qty: 2 },
  { id: 2, name: 'Bagel', price: 2.25, qty: 1 },
];

// -----------------------------------------------------------------------------
// A · JavaScript: array methods
// -----------------------------------------------------------------------------

// A1. getAvailableNames(items) → names of in-stock items: ['Coffee', 'Bagel', 'Muffin']
const getAvailableNames = (items) => {
  // TODO
};

// A2. getByCategory(items, category) → the full item objects in that category.
const getByCategory = (items, category) => {
  // TODO
};

// A3. findItem(items, id) → the item with that id, or undefined.
const findItem = (items, id) => {
  // TODO
};

// A4. hasSoldOut(items) → true if ANY item is out of stock.
const hasSoldOut = (items) => {
  // TODO
};

// A5. getOrderTotal(lines) → sum of price × qty.  cafeOrder → 9.25,  [] → 0
const getOrderTotal = (lines) => {
  // TODO
};

// A6. increaseQty(lines, id) → a NEW array where the line with that id has qty + 1.
//     Every other line stays exactly the same object.
const increaseQty = (lines, id) => {
  // TODO
};

// A7. removeLine(lines, id) → a NEW array without that line.
const removeLine = (lines, id) => {
  // TODO
};

// A8. cheapestFirst(items) → sorted by price, low to high, WITHOUT changing the original.
const cheapestFirst = (items) => {
  // TODO
};

// -----------------------------------------------------------------------------
// B · React: the Corner Café menu and cart
// -----------------------------------------------------------------------------
//   B1. In CafeShop, render MENU as a list of <CafeMenuRow /> with .map() and a
//       proper key. (No key warning in the console!)
//   B2. Category filter: the All / Drinks / Food buttons set a `category`
//       state; show only matching items; disable the active button. The
//       filtered list is DERIVED, not state.
//   B3. Cart: keep a `cartLines` array in state, each line { id, name, price, qty }.
//       The "Add" button: not in cart yet → add a line with qty 1 (spread);
//       already in cart → increase its qty (map).
//   B4. Show each line as "2 × Latte · $9.00" with a "−" button that lowers qty
//       by 1. When qty would reach 0, remove the line instead (filter).
//   B5. Show the total (reduce), and "Your cart is empty" when it's empty.
//
// How to check: Add Latte twice → ONE line "2 × Latte · $9.00". "−" on a qty-1
// line removes it. Filtering the menu doesn't affect the cart. 2 lattes + 1
// bagel = $11.25.
function CafeMenuRow({ item, onAdd }) {
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {item.name} · ${item.price.toFixed(2)}
      <button onClick={() => onAdd(item)}>Add</button>
    </li>
  );
}

function CafeShop() {
  // TODO B2: category state
  // TODO B3: cartLines state

  function addToCart(item) {
    // TODO B3
  }

  function decreaseQty(id) {
    // TODO B4
  }

  return (
    <div className="row" style={{ alignItems: 'flex-start', gap: 32 }}>
      <div>
        <div className="row">
          <button>All</button>
          <button>Drinks</button>
          <button>Food</button>
        </div>
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {/* TODO B1: map over MENU here */}
          <CafeMenuRow item={MENU[0]} onAdd={addToCart} />
        </ul>
      </div>
      <div className="card" style={{ minWidth: 240 }}>
        <strong>Your cart</strong>
        {/* TODO B4 + B5 */}
      </div>
    </div>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="getAvailableNames(cafeMenu)" run={() => getAvailableNames(cafeMenu)} expected={['Coffee', 'Bagel', 'Muffin']} />
      <Check label="getByCategory(cafeMenu, 'food')   (names)" run={() => getByCategory(cafeMenu, 'food').map((i) => i.name)} expected={['Bagel', 'Muffin']} />
      <Check label="findItem(cafeMenu, 3).name" run={() => findItem(cafeMenu, 3).name} expected="Orange Juice" />
      <Check label="[findItem(cafeMenu, 1)?.name, findItem(cafeMenu, 99)]" run={() => [findItem(cafeMenu, 1)?.name, findItem(cafeMenu, 99)]} expected={['Coffee', undefined]} />
      <Check label="hasSoldOut(cafeMenu)" run={() => hasSoldOut(cafeMenu)} expected={true} />
      <Check label="hasSoldOut(only in-stock items)" run={() => hasSoldOut(cafeMenu.filter((i) => i.inStock))} expected={false} />
      <Check label="getOrderTotal(cafeOrder)" run={() => getOrderTotal(cafeOrder)} expected={9.25} />
      <Check label="getOrderTotal([])" run={() => getOrderTotal([])} expected={0} />
      <Check label="increaseQty(cafeOrder, 2)   (quantities)" run={() => increaseQty(cafeOrder, 2).map((l) => l.qty)} expected={[2, 2]} />
      <Check label="increaseQty keeps other lines as the same objects" run={() => increaseQty(cafeOrder, 2)[0] === cafeOrder[0]} expected={true} />
      <Check label="removeLine(cafeOrder, 1)   (names)" run={() => removeLine(cafeOrder, 1).map((l) => l.name)} expected={['Bagel']} />
      <Check label="cheapestFirst(cafeMenu)   (names)" run={() => cheapestFirst(cafeMenu).map((i) => i.name)} expected={['Bagel', 'Muffin', 'Coffee', 'Orange Juice']} />
      <Check label="cafeMenu was not mutated   (first name)" run={() => cafeMenu[0].name} expected="Coffee" />
      <Check label="cafeOrder was not mutated   (quantities)" run={() => cafeOrder.map((l) => l.qty)} expected={[2, 1]} />

      <h3>B · React</h3>
      <CafeShop />
    </div>
  );
}

// #############################################################################
// PART 3 · EXPERIMENTS
// #############################################################################
export function Experiments() {
  return (
    <ol>
      <li>Remove the key from SimpleMenu's &lt;li&gt; and read the console warning.</li>
      <li>
        In the key demo, type a note next to Latte in both lists and click "Add a drink to the top". Explain what
        happened in the left list.
      </li>
      <li>
        Change <code>toSorted</code> to <code>sort</code> in 1A. Look at the "original order unchanged" line now.
      </li>
      <li>
        Add a <code>byName</code> sort (alphabetical) using{' '}
        <code>menu.toSorted((a, b) =&gt; a.name.localeCompare(b.name))</code>.
      </li>
      <li>In CartDemo, change the ADD branch to use cartLines.push(…) and setCartLines(cartLines). Does it work?</li>
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

const getAvailableNamesSolution = (items) => items.filter((item) => item.inStock).map((item) => item.name);
const getByCategorySolution = (items, category) => items.filter((item) => item.category === category);
const findItemSolution = (items, id) => items.find((item) => item.id === id);
const hasSoldOutSolution = (items) => items.some((item) => !item.inStock);
const getOrderTotalSolution = (lines) => lines.reduce((total, line) => total + line.price * line.qty, 0);
const increaseQtySolution = (lines, id) => lines.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line));
const removeLineSolution = (lines, id) => lines.filter((line) => line.id !== id);
const cheapestFirstSolution = (items) => items.toSorted((a, b) => a.price - b.price);

function CafeShopSolution() {
  const [category, setCategory] = useState('all');
  const [cartLines, setCartLines] = useState([]);

  const visibleMenu = category === 'all' ? MENU : MENU.filter((item) => item.category === category);
  const total = cartLines.reduce((sum, line) => sum + line.price * line.qty, 0);

  function addToCart(item) {
    if (cartLines.some((line) => line.id === item.id)) {
      setCartLines(cartLines.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line)));
    } else {
      setCartLines([...cartLines, { id: item.id, name: item.name, price: item.price, qty: 1 }]);
    }
  }

  function decreaseQty(id) {
    const line = cartLines.find((l) => l.id === id);
    if (line.qty === 1) {
      setCartLines(cartLines.filter((l) => l.id !== id)); // remove
    } else {
      setCartLines(cartLines.map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))); // update
    }
  }

  return (
    <div className="row" style={{ alignItems: 'flex-start', gap: 32 }}>
      <div>
        <div className="row">
          <button onClick={() => setCategory('all')} disabled={category === 'all'}>
            All
          </button>
          <button onClick={() => setCategory('drinks')} disabled={category === 'drinks'}>
            Drinks
          </button>
          <button onClick={() => setCategory('food')} disabled={category === 'food'}>
            Food
          </button>
        </div>
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {visibleMenu.map((item) => (
            <CafeMenuRow key={item.id} item={item} onAdd={addToCart} />
          ))}
        </ul>
      </div>
      <div className="card" style={{ minWidth: 240 }}>
        <strong>Your cart</strong>
        {cartLines.length === 0 ? (
          <p className="muted">Your cart is empty</p>
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {cartLines.map((line) => (
              <li key={line.id} className="row" style={{ marginBottom: 6 }}>
                {line.qty} × {line.name} · ${(line.price * line.qty).toFixed(2)}
                <button onClick={() => decreaseQty(line.id)}>−</button>
              </li>
            ))}
          </ul>
        )}
        <p>
          <strong>Total: ${total.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="getAvailableNames(cafeMenu)" run={() => getAvailableNamesSolution(cafeMenu)} expected={['Coffee', 'Bagel', 'Muffin']} />
      <Check label="getByCategory(cafeMenu, 'food')   (names)" run={() => getByCategorySolution(cafeMenu, 'food').map((i) => i.name)} expected={['Bagel', 'Muffin']} />
      <Check label="findItem(cafeMenu, 3).name" run={() => findItemSolution(cafeMenu, 3).name} expected="Orange Juice" />
      <Check label="hasSoldOut(cafeMenu)" run={() => hasSoldOutSolution(cafeMenu)} expected={true} />
      <Check label="getOrderTotal(cafeOrder)" run={() => getOrderTotalSolution(cafeOrder)} expected={9.25} />
      <Check label="increaseQty(cafeOrder, 2)   (quantities)" run={() => increaseQtySolution(cafeOrder, 2).map((l) => l.qty)} expected={[2, 2]} />
      <Check label="removeLine(cafeOrder, 1)   (names)" run={() => removeLineSolution(cafeOrder, 1).map((l) => l.name)} expected={['Bagel']} />
      <Check label="cheapestFirst(cafeMenu)   (names)" run={() => cheapestFirstSolution(cafeMenu).map((i) => i.name)} expected={['Bagel', 'Muffin', 'Coffee', 'Orange Juice']} />

      <h3>B · React</h3>
      <CafeShopSolution />
    </div>
  );
}
