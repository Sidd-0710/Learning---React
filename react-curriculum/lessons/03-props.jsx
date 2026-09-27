// =============================================================================
// LESSON 03 · PROPS
// =============================================================================
//
//   PART 1 · LEARN        objects & destructuring, then props
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–02.
//
// What you'll learn
//   JavaScript: objects, object destructuring (rename, defaults, nested),
//               destructuring in parameters, shorthand properties, spread & rest
//   React:      props, destructuring props, defaults, children, read-only props
// =============================================================================

import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST
// =============================================================================
// Every component receives its data as ONE object called "props". So you need
// to be fluent with objects, and especially with pulling values OUT of them.

// -----------------------------------------------------------------------------
// Objects: named values grouped together
// -----------------------------------------------------------------------------
const latte = { id: 7, name: 'Latte', price: 4.5, category: 'drinks' };
const order = {
  id: 101,
  customer: { firstName: 'Sam', phone: '555-0100' }, // objects can nest
};

// Read a property with a dot, or with [ ] and a string (useful when the name
// is in a variable):
const propertyName = 'price';
const readWithDot = latte.name;
const readWithBrackets = latte[propertyName];
const readNested = order.customer.firstName;

// -----------------------------------------------------------------------------
// Object destructuring: pull properties out into variables BY NAME
// -----------------------------------------------------------------------------
// Without destructuring:
//   const name = latte.name;
//   const price = latte.price;
// With destructuring: "make variables called name and price, filled from the
// properties with the same names":
const { name, price } = latte;

// Rename with a colon:  { propertyName: newVariableName }
const { name: drinkName } = latte;

// Default with = . Used only when the property is missing (undefined).
const { size = 'Medium', category = 'misc' } = latte;

// Nested: reach inside `customer`. (This creates only `firstName`.)
const {
  customer: { firstName },
} = order;

// -----------------------------------------------------------------------------
// Destructuring in function parameters  ← THE props pattern
// -----------------------------------------------------------------------------
// Without: receive the whole object and dig into it.
function describeLong(item) {
  return item.name + ' costs $' + item.price.toFixed(2);
}

// With: the { } in the parameter list says "I expect an object; pull out
// name and price". Defaults work here too.
function describe({ name, price, size = 'Regular' }) {
  return `${size} ${name} costs $${price.toFixed(2)}`;
}

// -----------------------------------------------------------------------------
// Shorthand properties: the reverse of destructuring
// -----------------------------------------------------------------------------
// If a property name matches the variable name, write it once.
const itemTitle = 'Cappuccino';
const itemPrice = 4.25;
const longForm = { itemTitle: itemTitle, itemPrice: itemPrice };
const shortForm = { itemTitle, itemPrice }; // identical result

// -----------------------------------------------------------------------------
// Spread (...) and rest (...) for objects
// -----------------------------------------------------------------------------
// SPREAD copies all properties into a NEW object. Put overrides AFTER it
// (later keys win):
const latteCopy = { ...latte };
const largeLatte = { ...latte, price: 5.25, size: 'Large' };
const oops = { price: 5.25, ...latte }; // latte's price came later, so it wins

// REST collects "everything else" when destructuring:
const { id, ...latteWithoutId } = latte;

// =============================================================================
// 1B · THE REACT PART: PROPS
// =============================================================================

// -----------------------------------------------------------------------------
// Props are the component's arguments
// -----------------------------------------------------------------------------
// You pass props like HTML attributes:   <MenuItemBasic name="Latte" price={4.5} />
// React collects them into ONE object:   { name: 'Latte', price: 4.5 }
// and passes that object as the first argument.
function MenuItemBasic(props) {
  return (
    <li>
      {props.name} · ${props.price.toFixed(2)}
    </li>
  );
}

// -----------------------------------------------------------------------------
// Destructure props: the style you'll see everywhere
// -----------------------------------------------------------------------------
function MenuItem({ name, price, emoji = '☕', isVegan = false }) {
  return (
    <li>
      {emoji} {name} · ${price.toFixed(2)} {isVegan ? <span className="badge">🌱 vegan</span> : null}
    </li>
  );
}

// -----------------------------------------------------------------------------
// Passing different kinds of values
// -----------------------------------------------------------------------------
//   name="Latte"            → a plain string: quotes are enough
//   price={4.5}             → anything that isn't a plain string needs { }
//   isVegan={true}          → booleans need { } …
//   isVegan                 → …or just the name: shorthand for {true}
//   tags={['hot', 'milk']}  → arrays
//   customer={{ name: 'Priya' }} → objects (double braces, like style)
//   onOrder={handleOrder}   → even functions (next lesson!)
function ItemTags({ tags }) {
  return (
    <p>
      Tags: <strong>{tags.join(', ')}</strong> ({tags.length} total)
    </p>
  );
}

function CustomerCard({ customer }) {
  const { name, visits } = customer; // destructure again inside
  return (
    <p>
      {name} has visited {visits} times {visits >= 10 ? '(regular! ⭐)' : ''}
    </p>
  );
}

// -----------------------------------------------------------------------------
// children: whatever you put BETWEEN the tags
// -----------------------------------------------------------------------------
// <Panel title="Drinks"> …anything… </Panel>
// Everything between the tags arrives as a prop called `children`.
function Panel({ title, children }) {
  return (
    <section className="card">
      <h4 style={{ marginTop: 0 }}>{title}</h4>
      {children}
    </section>
  );
}

// -----------------------------------------------------------------------------
// Props are read-only
// -----------------------------------------------------------------------------
//   function MenuItem({ price }) { price = price * 0.9; }   ❌ don't reassign props
//   function MenuItem(props) { props.price = 5; }           ❌ React freezes props in
//        development, so this throws "Cannot assign to read only property 'price'"
//
// Props belong to the PARENT. Need a different value? Make a new variable:
//   const salePrice = price * 0.9;   ✅
// If a value must CHANGE over time, that's state (lesson 05), not props.

// -----------------------------------------------------------------------------
// Spreading an object into props
// -----------------------------------------------------------------------------
const featuredItem = { name: 'Mocha', price: 5, emoji: '🍫' };
// <MenuItem {...featuredItem} />  is the same as  <MenuItem name="Mocha" price={5} emoji="🍫" />
// Handy, but use it sparingly: explicit props are easier to read.

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript you need first</h2>

      <h3>Objects</h3>
      <Show code="latte.name" value={readWithDot} />
      <Show code="latte[propertyName]   (propertyName is 'price')" value={readWithBrackets} />
      <Show code="order.customer.firstName" value={readNested} />

      <h3>Destructuring</h3>
      <Show code="const { name, price } = latte   → name" value={name} />
      <Show code="                               → price" value={price} />
      <Show code="const { name: drinkName } = latte   → drinkName" value={drinkName} />
      <Show code="const { size = 'Medium' } = latte   → size (missing → default)" value={size} />
      <Show code="const { category = 'misc' } = latte   → category (present → no default)" value={category} />
      <Show code="const { customer: { firstName } } = order   → firstName" value={firstName} />

      <h3>Destructuring in parameters</h3>
      <Show code="describeLong(latte)" value={describeLong(latte)} />
      <Show code="describe(latte)" value={describe(latte)} />
      <Show code="describe({ name: 'Mocha', price: 5, size: 'Large' })" value={describe({ name: 'Mocha', price: 5, size: 'Large' })} />

      <h3>Shorthand properties</h3>
      <Show code="{ itemTitle: itemTitle, itemPrice: itemPrice }" value={longForm} />
      <Show code="{ itemTitle, itemPrice }" value={shortForm} />

      <h3>Spread & rest</h3>
      <Show code="{ ...latte }" value={latteCopy} />
      <Show code="{ ...latte, price: 5.25, size: 'Large' }" value={largeLatte} />
      <Show code="{ price: 5.25, ...latte }   ⚠️ order matters" value={oops} />
      <Show code="const { id, ...latteWithoutId } = latte   → id" value={id} />
      <Show code="                                        → latteWithoutId" value={latteWithoutId} />

      <h2>1B · The React part: props</h2>

      <h3>props as one object</h3>
      <ul>
        <MenuItemBasic name="Latte" price={4.5} />
        <MenuItemBasic name="Tea" price={2.75} />
      </ul>

      <h3>Destructured props with defaults</h3>
      <ul>
        <MenuItem name="Espresso" price={3} />
        <MenuItem name="Oat Latte" price={5} isVegan />
        <MenuItem name="Muffin" price={2.75} emoji="🧁" />
      </ul>
      <p className="muted">One component, three different outputs. That's the power of props.</p>

      <h3>Arrays and objects as props</h3>
      <ItemTags tags={['hot', 'contains milk', 'bestseller']} />
      <CustomerCard customer={{ name: 'Priya', visits: 12 }} />
      <CustomerCard customer={{ name: 'Tom', visits: 2 }} />

      <h3>children</h3>
      <Panel title="Drinks">
        <ul>
          <MenuItem name="Coffee" price={3.5} />
          <MenuItem name="Chai" price={3.25} isVegan />
        </ul>
      </Panel>
      <Panel title="A note from the owner">
        <p>Anything can go inside a Panel: lists, paragraphs, other components.</p>
      </Panel>

      <h3>Spreading props</h3>
      <ul>
        <MenuItem {...featuredItem} />
      </ul>

      <h3>Data flows down</h3>
      <p>
        Lesson → Panel → MenuItem. Each parent decides what its children show. Children can't send data back up by
        changing props. (They CAN call a function the parent gives them. That's the next lesson.)
      </p>

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>What's the difference between {'{ name } = obj'} and {'{ name: title } = obj'}?</li>
        <li>What's the difference between {'{ ...obj, x: 1 }'} and {'{ x: 1, ...obj }'}?</li>
        <li>In &lt;MenuItem name="Tea" price={'{2}'} /&gt;, what object does MenuItem receive?</li>
        <li>Why does price={'{2}'} need braces but name="Tea" doesn't?</li>
        <li>What is children, and where does it come from?</li>
        <li>A component wants a discounted price. Should it change its price prop?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 20 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: destructuring, shorthand, spread, rest
// -----------------------------------------------------------------------------

// A1. receiptLine(item): destructure { name, price, qty } IN THE PARAMETER LIST,
//     with qty defaulting to 1.
//     receiptLine({ name: 'Coffee', price: 3.5, qty: 2 }) → '2 x Coffee = $7.00'
//     receiptLine({ name: 'Bagel', price: 2.25 })         → '1 x Bagel = $2.25'
const receiptLine = (item) => {
  // TODO (start by changing `item` in the line above!)
};

// A2. getCustomerName(order): use NESTED destructuring.
//     getCustomerName({ id: 1, customer: { name: 'Priya' } }) → 'Priya'
const getCustomerName = (order) => {
  // TODO
};

// A3. toMenuItem(name, price, category): return an object using SHORTHAND properties.
//     toMenuItem('Tea', 2, 'drinks') → { name: 'Tea', price: 2, category: 'drinks' }
const toMenuItem = (name, price, category) => {
  // TODO
};

// A4. changeSize(drink, size): return a NEW object with size changed (spread).
//     changeSize({ name: 'Latte', size: 'M' }, 'L') → { name: 'Latte', size: 'L' }
const changeSize = (drink, size) => {
  // TODO
};

// A5. withoutId(item): a copy WITHOUT the id property (rest).
//     withoutId({ id: 9, name: 'Tea', price: 2 }) → { name: 'Tea', price: 2 }
const withoutId = (item) => {
  // TODO
};

// -----------------------------------------------------------------------------
// B · React: reusable Corner Café components
// -----------------------------------------------------------------------------
// The components below show hard-coded text. Make them reusable with props:
//
//   B1. CafeMenuItem: props name, price, emoji (default '☕'). Show "☕ Latte · $4.50".
//   B2. CafeMenuItem: an isVegan prop (default false). When true, also show
//       <span className="badge">🌱 vegan</span>.
//   B3. CafePriceTag: props amount and showTax (default false). Show "$4.50", or
//       with showTax "$4.86 incl. tax" (8% tax). Then use CafePriceTag INSIDE
//       CafeMenuItem instead of formatting the price there.
//   B4. CafeMenuSection: props title and children. Title in an <h4>, children
//       inside a <ul>, all wrapped in <section className="card">.
//   B5. In CafeMenu, build using ONLY your components:
//         "Drinks": Latte $4.50, Oat Flat White $4.75 (vegan), Chai $3.25 (vegan)
//         "Food":   🥯 Bagel $2.25, 🧁 Muffin $2.75
//       Show one drink with its tax-included price (showTax).
//
// How to check: two cards with the right emoji, prices and vegan badges.
// Change a price in CafeMenu → only that item changes. No console warnings.
function CafePriceTag() {
  return <span>$0.00</span>;
}

function CafeMenuItem() {
  return (
    <li>
      ☕ Item name · <CafePriceTag />
    </li>
  );
}

function CafeMenuSection() {
  return (
    <section className="card">
      <h4>Section title</h4>
      <ul>{/* children go here */}</ul>
    </section>
  );
}

function CafeMenu() {
  return (
    <div>
      <CafeMenuSection />
      <CafeMenuItem />
    </div>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check
        label="receiptLine({ name: 'Coffee', price: 3.5, qty: 2 })"
        run={() => receiptLine({ name: 'Coffee', price: 3.5, qty: 2 })}
        expected="2 x Coffee = $7.00"
      />
      <Check label="receiptLine({ name: 'Bagel', price: 2.25 })" run={() => receiptLine({ name: 'Bagel', price: 2.25 })} expected="1 x Bagel = $2.25" />
      <Check
        label="getCustomerName({ id: 1, customer: { name: 'Priya' } })"
        run={() => getCustomerName({ id: 1, customer: { name: 'Priya' } })}
        expected="Priya"
      />
      <Check label="toMenuItem('Tea', 2, 'drinks')" run={() => toMenuItem('Tea', 2, 'drinks')} expected={{ name: 'Tea', price: 2, category: 'drinks' }} />
      <Check label="changeSize({ name: 'Latte', size: 'M' }, 'L')" run={() => changeSize({ name: 'Latte', size: 'M' }, 'L')} expected={{ name: 'Latte', size: 'L' }} />
      <Check
        label="changeSize returns a NEW object"
        run={() => {
          const drink = { name: 'Latte', size: 'M' };
          const result = changeSize(drink, 'L');
          return typeof result === 'object' && result !== drink && drink.size === 'M';
        }}
        expected={true}
      />
      <Check label="withoutId({ id: 9, name: 'Tea', price: 2 })" run={() => withoutId({ id: 9, name: 'Tea', price: 2 })} expected={{ name: 'Tea', price: 2 }} />

      <h3>B · React: the menu</h3>
      <CafeMenu />
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
        In the lesson page, remove <code>price</code> from one <code>&lt;MenuItem&gt;</code>. Read the error (why
        does it crash?). Then give <code>price</code> a default value in MenuItem and try again.
      </li>
      <li>
        Inside <code>MenuItemBasic</code>, add <code>props.price = 1;</code> before the return. Read the error.
      </li>
      <li>
        Swap the order in <code>largeLatte</code>: put <code>...latte</code> last. What changes on the page?
      </li>
      <li>
        Make a <code>&lt;Badge&gt;New&lt;/Badge&gt;</code> component that renders its children inside{' '}
        <code>&lt;span className="badge"&gt;</code>, and use it next to a menu item.
      </li>
      <li>
        Add <code>console.log(props)</code> inside <code>MenuItemBasic</code> and look at the objects in the console.
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

const receiptLineSolution = ({ name, price, qty = 1 }) => `${qty} x ${name} = $${(price * qty).toFixed(2)}`;

const getCustomerNameSolution = ({ customer: { name } }) => name;

const toMenuItemSolution = (name, price, category) => ({ name, price, category });

const changeSizeSolution = (drink, size) => ({ ...drink, size });

const withoutIdSolution = (item) => {
  const { id, ...rest } = item; // id is collected and ignored; rest is everything else
  return rest;
};

const TAX_RATE = 0.08;

function CafePriceTagSolution({ amount, showTax = false }) {
  // Calculate a NEW value. Never change the prop itself.
  const displayAmount = showTax ? amount * (1 + TAX_RATE) : amount;
  return (
    <span>
      ${displayAmount.toFixed(2)}
      {showTax ? ' incl. tax' : ''}
    </span>
  );
}

function CafeMenuItemSolution({ name, price, emoji = '☕', isVegan = false, showTax = false }) {
  return (
    <li>
      {emoji} {name} · <CafePriceTagSolution amount={price} showTax={showTax} />{' '}
      {isVegan ? <span className="badge">🌱 vegan</span> : null}
    </li>
  );
}

function CafeMenuSectionSolution({ title, children }) {
  return (
    <section className="card">
      <h4>{title}</h4>
      <ul>{children}</ul>
    </section>
  );
}

function CafeMenuSolution() {
  return (
    <div>
      <CafeMenuSectionSolution title="Drinks">
        <CafeMenuItemSolution name="Latte" price={4.5} showTax />
        <CafeMenuItemSolution name="Oat Flat White" price={4.75} isVegan />
        <CafeMenuItemSolution name="Chai" price={3.25} isVegan />
      </CafeMenuSectionSolution>
      <CafeMenuSectionSolution title="Food">
        <CafeMenuItemSolution name="Bagel" price={2.25} emoji="🥯" />
        <CafeMenuItemSolution name="Muffin" price={2.75} emoji="🧁" />
      </CafeMenuSectionSolution>
    </div>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check
        label="receiptLine({ name: 'Coffee', price: 3.5, qty: 2 })"
        run={() => receiptLineSolution({ name: 'Coffee', price: 3.5, qty: 2 })}
        expected="2 x Coffee = $7.00"
      />
      <Check label="receiptLine({ name: 'Bagel', price: 2.25 })" run={() => receiptLineSolution({ name: 'Bagel', price: 2.25 })} expected="1 x Bagel = $2.25" />
      <Check
        label="getCustomerName({ id: 1, customer: { name: 'Priya' } })"
        run={() => getCustomerNameSolution({ id: 1, customer: { name: 'Priya' } })}
        expected="Priya"
      />
      <Check label="toMenuItem('Tea', 2, 'drinks')" run={() => toMenuItemSolution('Tea', 2, 'drinks')} expected={{ name: 'Tea', price: 2, category: 'drinks' }} />
      <Check label="changeSize({ name: 'Latte', size: 'M' }, 'L')" run={() => changeSizeSolution({ name: 'Latte', size: 'M' }, 'L')} expected={{ name: 'Latte', size: 'L' }} />
      <Check label="withoutId({ id: 9, name: 'Tea', price: 2 })" run={() => withoutIdSolution({ id: 9, name: 'Tea', price: 2 })} expected={{ name: 'Tea', price: 2 }} />

      <h3>B · React: the menu</h3>
      <CafeMenuSolution />
    </div>
  );
}
