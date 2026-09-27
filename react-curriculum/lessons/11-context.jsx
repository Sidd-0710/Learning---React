// =============================================================================
// LESSON 11 · THE CONTEXT API
// =============================================================================
//
//   PART 1 · LEARN        objects that bundle data + functions, then context
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–10.
//
// What you'll learn
//   JavaScript: objects that hold functions, destructuring just what you need,
//               "do nothing" default functions, optional calls with ?.()
//   React:      prop drilling, createContext, providers, useContext, the
//               provider-component pattern, when (not) to use context
// =============================================================================

import { createContext, useContext, useState } from 'react';
import { Check, Show } from '../src/helpers.jsx';

// #############################################################################
// PART 1 · LEARN
// #############################################################################

// =============================================================================
// 1A · THE JAVASCRIPT YOU NEED FIRST
// =============================================================================
// A context shares ONE value with many components. That value is usually an
// object bundling data AND the functions that change it.

// -----------------------------------------------------------------------------
// Objects can hold functions
// -----------------------------------------------------------------------------
// A property can be any value, including a function. Call it with ().
function createThemeValue() {
  let theme = 'light'; // private, thanks to the closure (lesson 04)
  return {
    getTheme: () => theme,
    toggleTheme: () => {
      theme = theme === 'light' ? 'dark' : 'light';
    },
  };
}
const themeValue = createThemeValue();
const themeBefore = themeValue.getTheme();
themeValue.toggleTheme(); // call the function stored in the object
const themeAfter = themeValue.getTheme();

// -----------------------------------------------------------------------------
// Destructure just what you need
// -----------------------------------------------------------------------------
// Different parts of an app need different pieces of the same bundle:
const cartValue = { items: ['Latte', 'Scone'], addItem: (name) => `added ${name}`, clearCart: () => 'cleared' };
const { items } = cartValue; // the badge only needs items
const { addItem } = cartValue; // a button only needs addItem

// -----------------------------------------------------------------------------
// "Do nothing" default functions
// -----------------------------------------------------------------------------
// When a function might not be provided, a safe default is a function that
// does nothing:  () => {}   Calling it is harmless: it returns undefined.
const noop = () => {};
const defaultTheme = { theme: 'light', toggleTheme: noop };

// -----------------------------------------------------------------------------
// Optional calls: ?.()
// -----------------------------------------------------------------------------
// Like ?. for properties (lesson 06): ?.() calls the function only if it exists.
const withCallback = { onDone: () => 'done!' };
const withoutCallback = {};

// =============================================================================
// 1B · THE REACT PART: CONTEXT
// =============================================================================

const THEMES = {
  light: { background: '#fffaf0', color: '#3b2f2f', border: '1px solid #e6d8c3' },
  dark: { background: '#2b2320', color: '#f5e9dc', border: '1px solid #4a3c35' },
};

// -----------------------------------------------------------------------------
// The problem: prop drilling
// -----------------------------------------------------------------------------
// Only DrilledButton needs `theme`, but DrilledPage and DrilledSidebar must
// accept it and pass it along anyway. With 5 levels and 4 shared values, this
// gets unmanageable fast.
function DrilledPage({ theme }) {
  return <DrilledSidebar theme={theme} />; // doesn't use theme; just passes it on
}
function DrilledSidebar({ theme }) {
  return <DrilledButton theme={theme} />; // doesn't use it either
}
function DrilledButton({ theme }) {
  return <div style={{ ...THEMES[theme], padding: 12, borderRadius: 8 }}>I'm deep down and got "{theme}" via 3 props</div>;
}

// -----------------------------------------------------------------------------
// Step 1: create a context
// -----------------------------------------------------------------------------
// createContext(defaultValue) makes a "channel". The default is used only when
// a component reads the context with NO provider above it.
const ThemeContext = createContext(defaultTheme);

// -----------------------------------------------------------------------------
// Step 2: provide a value.  Step 3: read it with useContext
// -----------------------------------------------------------------------------
function ThemeDemo() {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Everything INSIDE <ThemeContext value={…}> can read that value, however deep.
  // (React 18 and older: <ThemeContext.Provider value={…}>. You'll still see it.)
  return (
    <ThemeContext value={{ theme, toggleTheme }}>
      <ContextPage />
    </ThemeContext>
  );
}

function ContextPage() {
  return <ContextSidebar />; // no theme props in the middle!
}
function ContextSidebar() {
  return <ContextButton />;
}
function ContextButton() {
  // useContext reaches up to the NEAREST provider and reads its value.
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div style={{ ...THEMES[theme], padding: 12, borderRadius: 8 }}>
      <p style={{ marginTop: 0 }}>I read "{theme}" straight from context, with no props in between.</p>
      <button onClick={toggleTheme}>Toggle theme</button>
    </div>
  );
}
// When the provider's value changes, every component reading it re-renders.

// -----------------------------------------------------------------------------
// Default values: reading context with NO provider above
// -----------------------------------------------------------------------------
function LonelyThemeLabel() {
  const { theme } = useContext(ThemeContext);
  return <p className="muted">No provider above me, so I get the default: "{theme}"</p>;
}

// -----------------------------------------------------------------------------
// The provider-component pattern: a CartProvider
// -----------------------------------------------------------------------------
// Real apps wrap the state and the context together in ONE component. The rest
// of the app just uses <CartProvider> and useContext(CartContext).
const CartContext = createContext(null);

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const addToCart = (name) => setCartItems((previous) => [...previous, name]);
  const clearCart = () => setCartItems([]);
  // The value is an object bundling data + functions (1A!)
  return <CartContext value={{ cartItems, addToCart, clearCart }}>{children}</CartContext>;
}

function ShopHeader() {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <strong>☕ Corner Café</strong>
      <CartBadge />
    </div>
  );
}
function CartBadge() {
  const { cartItems } = useContext(CartContext); // destructure just what it needs
  return <span className="badge">🛒 {cartItems.length}</span>;
}
function ShopMenu() {
  return (
    <div className="row" style={{ margin: '12px 0' }}>
      <AddButton name="Latte" />
      <AddButton name="Scone" />
      <AddButton name="Chai" />
    </div>
  );
}
function AddButton({ name }) {
  const { addToCart } = useContext(CartContext);
  return <button onClick={() => addToCart(name)}>Add {name}</button>;
}
function CartContents() {
  const { cartItems, clearCart } = useContext(CartContext);
  if (cartItems.length === 0) return <p className="muted">Cart is empty.</p>;
  return (
    <p>
      In cart: {cartItems.join(', ')} <button onClick={clearCart}>Clear</button>
    </p>
  );
}

// -----------------------------------------------------------------------------
// When to use context, and when not to
// -----------------------------------------------------------------------------
// ✅ Data MANY components at DIFFERENT depths need: theme, current user,
//    language, a shopping cart.
// ❌ Not a replacement for props. One or two levels down? Just pass props.
// ⚠️ Every component reading a context re-renders when its value changes.
//    Usually fine; lesson 13 shows what to do when it isn't.

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript you need first</h2>

      <h3>Objects can hold functions</h3>
      <Show code="themeValue.getTheme()   (before)" value={themeBefore} />
      <Show code="themeValue.getTheme()   (after themeValue.toggleTheme())" value={themeAfter} />

      <h3>Destructure just what you need</h3>
      <Show code="const { items } = cartValue" value={items} />
      <Show code="const { addItem } = cartValue; addItem('Mocha')" value={addItem('Mocha')} />

      <h3>"Do nothing" defaults and ?.()</h3>
      <Show code="noop()" value={noop()} />
      <Show code="withCallback.onDone?.()" value={withCallback.onDone?.()} />
      <Show code="withoutCallback.onDone?.()   (no crash)" value={withoutCallback.onDone?.()} />

      <h2>1B · The React part: context</h2>

      <h3>Prop drilling</h3>
      <DrilledPage theme="dark" />

      <h3>The same thing with context</h3>
      <ThemeDemo />

      <h3>Default value (no provider)</h3>
      <LonelyThemeLabel />

      <h3>A CartProvider</h3>
      <CartProvider>
        <div className="card">
          <ShopHeader />
          <ShopMenu />
          <CartContents />
        </div>
      </CartProvider>
      <p className="muted">ShopHeader, ShopMenu and CartContents never receive the cart as a prop.</p>

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>What problem does context solve?</li>
        <li>What are the three pieces? (create, provide, read)</li>
        <li>What does useContext return if there's no provider above?</li>
        <li>Why put a function (like addToCart) into the context value?</li>
        <li>Name a case where plain props are better than context.</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 20 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: bundles of data and functions
// -----------------------------------------------------------------------------

// A1. createTally(start) → an object { getCount, increment, reset } that share a
//     PRIVATE count starting at `start`. reset() goes back to `start`.
const createTally = (start) => {
  // TODO
};

// A2. makeCartValue(cartItems, addToCart) → { cartItems, addToCart, count }
//     using SHORTHAND properties, where count is cartItems.length.
const makeCartValue = (cartItems, addToCart) => {
  // TODO
};

// A3. notify(handlers) → calls handlers.onSave if it exists and returns its
//     result; otherwise returns 'nobody listening'. Use ?.() and ??.
//     notify({ onSave: () => 'saved!' }) → 'saved!',   notify({}) → 'nobody listening'
const notify = (handlers) => {
  // TODO
};

// -----------------------------------------------------------------------------
// B · React: stop drilling the Corner Café cart
// -----------------------------------------------------------------------------
// This app works, but the cart is PROP-DRILLED: CafeLayout, CafeHeaderBar and
// CafeMenuPage accept cart props they never use, just to pass them down.
//   B1. Create a CafeCartContext with createContext (above the components).
//   B2. Create a CafeCartProvider component that OWNS the cart state and
//       provides { cart, addToCart, removeFromCart } to its children.
//   B3. In CafeCartApp, wrap everything in <CafeCartProvider>, and move the
//       state and functions out of CafeCartApp into the provider.
//   B4. CafeCartButton, CafeMenuItem and CafeCartPanel read what they need with
//       useContext.
//   B5. Delete every cart prop from CafeLayout, CafeHeaderBar and CafeMenuPage.
//   B6. Bonus: a theme context with a "Dark mode" checkbox in the header that
//       changes the outer card's background and text colour.
//
// How to check: the app behaves exactly as before (add, remove, count, total),
// and "cart=", "onAdd" and "onRemove" no longer appear in the middle components.
const CAFE_MENU = [
  { id: 1, name: 'Latte', price: 4.5 },
  { id: 2, name: 'Scone', price: 3 },
  { id: 3, name: 'Chai', price: 3.25 },
];

function CafeLayout({ cart, onAdd, onRemove }) {
  return (
    <div className="card">
      <CafeHeaderBar cart={cart} />
      <CafeMenuPage onAdd={onAdd} />
      <CafeCartPanel cart={cart} onRemove={onRemove} />
    </div>
  );
}

function CafeHeaderBar({ cart }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <strong>☕ Corner Café</strong>
      <CafeCartButton cart={cart} />
    </div>
  );
}

function CafeCartButton({ cart }) {
  return <span className="badge">🛒 {cart.length} items</span>;
}

function CafeMenuPage({ onAdd }) {
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
      {CAFE_MENU.map((item) => (
        <CafeMenuItem key={item.id} item={item} onAdd={onAdd} />
      ))}
    </ul>
  );
}

function CafeMenuItem({ item, onAdd }) {
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {item.name} · ${item.price.toFixed(2)}
      <button onClick={() => onAdd(item)}>Add</button>
    </li>
  );
}

function CafeCartPanel({ cart, onRemove }) {
  const total = cart.reduce((sum, line) => sum + line.price, 0);
  return (
    <div>
      <strong>Cart</strong>
      {cart.length === 0 && <p className="muted">Empty</p>}
      <ul>
        {cart.map((line) => (
          <li key={line.cartId}>
            {line.name} <button onClick={() => onRemove(line.cartId)}>✕</button>
          </li>
        ))}
      </ul>
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}

function CafeCartApp() {
  const [cart, setCart] = useState([]);
  // Each line gets its own cartId, so two lattes are two separate lines.
  const addToCart = (item) => setCart((prev) => [...prev, { ...item, cartId: crypto.randomUUID() }]);
  const removeFromCart = (cartId) => setCart((prev) => prev.filter((line) => line.cartId !== cartId));
  return <CafeLayout cart={cart} onAdd={addToCart} onRemove={removeFromCart} />;
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check
        label="createTally(5): increment twice"
        run={() => {
          const tally = createTally(5);
          tally.increment();
          tally.increment();
          return tally.getCount();
        }}
        expected={7}
      />
      <Check
        label="createTally(5): reset"
        run={() => {
          const tally = createTally(5);
          tally.increment();
          tally.reset();
          return tally.getCount();
        }}
        expected={5}
      />
      <Check
        label="makeCartValue(['Latte'], addFn)"
        run={() => {
          const addFn = () => {};
          const value = makeCartValue(['Latte'], addFn);
          return [value.cartItems, value.addToCart === addFn, value.count];
        }}
        expected={[['Latte'], true, 1]}
      />
      <Check label="notify({ onSave: () => 'saved!' })" run={() => notify({ onSave: () => 'saved!' })} expected="saved!" />
      <Check label="notify({})" run={() => notify({})} expected="nobody listening" />

      <h3>B · React</h3>
      <CafeCartApp />
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
        Move <code>&lt;LonelyThemeLabel /&gt;</code> inside <code>ThemeDemo</code>'s provider (next to{' '}
        <code>&lt;ContextPage /&gt;</code>). What does it show now?
      </li>
      <li>
        Nest a second <code>&lt;ThemeContext value={'{{ theme: \'dark\', toggleTheme: () => {} }}'}&gt;</code> around{' '}
        <code>ContextSidebar</code>. Which value does ContextButton read? (The NEAREST provider.)
      </li>
      <li>
        Render a <code>&lt;CartBadge /&gt;</code> OUTSIDE <code>&lt;CartProvider&gt;</code>. Read the crash. Why does
        the default value of <code>null</code> cause it?
      </li>
      <li>Add a "Remove last item" button to CartContents using a new removeLast function in the provider.</li>
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

const createTallySolution = (start) => {
  let count = start;
  return {
    getCount: () => count,
    increment: () => {
      count = count + 1;
    },
    reset: () => {
      count = start;
    },
  };
};

const makeCartValueSolution = (cartItems, addToCart) => ({ cartItems, addToCart, count: cartItems.length });

const notifySolution = (handlers) => handlers.onSave?.() ?? 'nobody listening';

// ---- Cart context --------------------------------------------------------------
const CafeCartContextSolution = createContext(null);

function CafeCartProviderSolution({ children }) {
  const [cart, setCart] = useState([]);
  const addToCart = (item) => setCart((prev) => [...prev, { ...item, cartId: crypto.randomUUID() }]);
  const removeFromCart = (cartId) => setCart((prev) => prev.filter((line) => line.cartId !== cartId));
  return <CafeCartContextSolution value={{ cart, addToCart, removeFromCart }}>{children}</CafeCartContextSolution>;
}

// ---- Bonus: theme context --------------------------------------------------------
const CafeThemeContextSolution = createContext({ isDark: false, toggleDark: () => {} });

function CafeThemeProviderSolution({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleDark = () => setIsDark((d) => !d);
  return <CafeThemeContextSolution value={{ isDark, toggleDark }}>{children}</CafeThemeContextSolution>;
}

// ---- Components: no cart props in the middle any more ----------------------------
function CafeLayoutSolution() {
  const { isDark } = useContext(CafeThemeContextSolution);
  return (
    <div className="card" style={isDark ? { background: '#2b2320', color: '#f5e9dc' } : {}}>
      <CafeHeaderBarSolution />
      <CafeMenuPageSolution />
      <CafeCartPanelSolution />
    </div>
  );
}

function CafeHeaderBarSolution() {
  const { isDark, toggleDark } = useContext(CafeThemeContextSolution);
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <strong>☕ Corner Café</strong>
      <div className="row">
        <label>
          <input type="checkbox" checked={isDark} onChange={toggleDark} /> Dark mode
        </label>
        <CafeCartButtonSolution />
      </div>
    </div>
  );
}

function CafeCartButtonSolution() {
  const { cart } = useContext(CafeCartContextSolution);
  return <span className="badge">🛒 {cart.length} items</span>;
}

function CafeMenuPageSolution() {
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
      {CAFE_MENU.map((item) => (
        <CafeMenuItemSolution key={item.id} item={item} />
      ))}
    </ul>
  );
}

function CafeMenuItemSolution({ item }) {
  const { addToCart } = useContext(CafeCartContextSolution);
  return (
    <li className="row" style={{ marginBottom: 6 }}>
      {item.name} · ${item.price.toFixed(2)}
      <button onClick={() => addToCart(item)}>Add</button>
    </li>
  );
}

function CafeCartPanelSolution() {
  const { cart, removeFromCart } = useContext(CafeCartContextSolution);
  const total = cart.reduce((sum, line) => sum + line.price, 0);
  return (
    <div>
      <strong>Cart</strong>
      {cart.length === 0 && <p className="muted">Empty</p>}
      <ul>
        {cart.map((line) => (
          <li key={line.cartId}>
            {line.name} <button onClick={() => removeFromCart(line.cartId)}>✕</button>
          </li>
        ))}
      </ul>
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}

function CafeCartAppSolution() {
  return (
    <CafeThemeProviderSolution>
      <CafeCartProviderSolution>
        <CafeLayoutSolution />
      </CafeCartProviderSolution>
    </CafeThemeProviderSolution>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check
        label="createTally(5): increment, reset"
        run={() => {
          const tally = createTallySolution(5);
          tally.increment();
          const afterIncrement = tally.getCount();
          tally.reset();
          return [afterIncrement, tally.getCount()];
        }}
        expected={[6, 5]}
      />
      <Check label="makeCartValue(['Latte'], fn).count" run={() => makeCartValueSolution(['Latte'], () => {}).count} expected={1} />
      <Check label="notify({})" run={() => notifySolution({})} expected="nobody listening" />

      <h3>B · React</h3>
      <CafeCartAppSolution />
    </div>
  );
}
