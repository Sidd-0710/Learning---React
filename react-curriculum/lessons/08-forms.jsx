// =============================================================================
// LESSON 08 · FORMS
// =============================================================================
//
//   PART 1 · LEARN        strings, numbers & dynamic object keys, then forms
//   PART 2 · ASSIGNMENTS  your turn
//   PART 3 · EXPERIMENTS  things to try
//   PART 4 · SOLUTIONS    at the bottom. Try first!
//
// Before this lesson: lessons 01–07.
//
// What you'll learn
//   JavaScript: input text is always a string, Number() and NaN, string
//               methods, computed property names { [key]: value }, Object.keys
//   React:      controlled inputs, every input type, one object for a whole
//               form, submit + validation + errors, derived "can submit?" values
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
// Whatever someone types is a STRING, even in <input type="number">
// -----------------------------------------------------------------------------
const typedQuantity = '2'; // what event.target.value gives you
const oops = typedQuantity + 1; // '21': + glues strings together!
const fixed = Number(typedQuantity) + 1; // 3

// Number() of something that isn't a number gives NaN ("Not a Number"):
const fromEmpty = Number(''); // 0 (surprise!)
const fromWord = Number('abc'); // NaN
const isItNaN = Number.isNaN(Number('abc')); // the reliable way to check for NaN

// -----------------------------------------------------------------------------
// String methods you'll use for validation
// -----------------------------------------------------------------------------
const rawName = '  Sam  ';
const trimmed = rawName.trim(); // removes spaces from both ends
const nameLength = rawName.trim().length;
const hasAt = 'sam@cafe.com'.includes('@');
const shouting = 'latte'.toUpperCase();

// -----------------------------------------------------------------------------
// Computed property names: a VARIABLE as the key
// -----------------------------------------------------------------------------
// Square brackets inside an object literal mean "use the VALUE of this
// variable as the key":
const key = 'email';
const byComputedKey = { [key]: 'sam@cafe.com' }; // → { email: 'sam@cafe.com' }

// Combined with spread (lesson 05), this updates ANY field of a form object:
const form = { name: 'Sam', email: '' };
const fieldName = 'email'; // in React this comes from the input's name attribute
const updatedForm = { ...form, [fieldName]: 'sam@cafe.com' };

// -----------------------------------------------------------------------------
// Object.keys: list an object's keys
// -----------------------------------------------------------------------------
// Handy for "does this errors object have anything in it?"
const someErrors = { name: 'Too short', email: 'Looks wrong' };
const noErrors = {};

// =============================================================================
// 1B · THE REACT PART: FORMS
// =============================================================================

// -----------------------------------------------------------------------------
// A controlled input
// -----------------------------------------------------------------------------
// "Controlled" = React state is the single source of truth.
//   value={name}           → the input always SHOWS the state
//   onChange={…setName…}   → every keystroke UPDATES the state
// The loop: type → onChange → setName → re-render → input shows the new value.
function NameField() {
  const [name, setName] = useState('');
  const [promoCode, setPromoCode] = useState('');

  return (
    <div className="card">
      <label>
        Your name
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={20} />
      </label>
      <p>
        Hello, {name || 'stranger'}! <span className="muted">({name.length}/20 characters)</span>
      </p>

      {/* Because state is in charge, you can TRANSFORM input as it's typed: */}
      <label>
        Promo code
        <input value={promoCode} onChange={(event) => setPromoCode(event.target.value.toUpperCase())} />
      </label>

      {/* …and change it from code: */}
      <div className="row" style={{ marginTop: 8 }}>
        <button
          onClick={() => {
            setName('');
            setPromoCode('');
          }}
        >
          Clear both
        </button>
      </div>
    </div>
  );
}
// ⚠️ value WITHOUT onChange makes the input read-only (React warns in the
//    console). Always pair them.

// -----------------------------------------------------------------------------
// Every common input type
// -----------------------------------------------------------------------------
function InputTypes() {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [milk, setMilk] = useState('whole');
  const [extraHot, setExtraHot] = useState(false);
  const [size, setSize] = useState('M');

  return (
    <div className="card">
      <p>
        <label>
          Quantity (number)
          {/* input values are strings, even type="number": convert with Number()! */}
          <input type="number" min={1} max={10} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </label>
      </p>
      <p>
        <label>
          Milk (select)
          <select value={milk} onChange={(e) => setMilk(e.target.value)}>
            <option value="whole">Whole</option>
            <option value="oat">Oat</option>
            <option value="almond">Almond</option>
          </select>
        </label>
      </p>
      <p>
        {/* Checkboxes use `checked` and event.target.CHECKED (a boolean), not value. */}
        <label>
          <input type="checkbox" checked={extraHot} onChange={(e) => setExtraHot(e.target.checked)} />
          Extra hot (checkbox)
        </label>
      </p>
      <p className="row">
        Size (radio):
        {/* Radios: each is "checked" when the state equals ITS value. */}
        <label>
          <input type="radio" name="lesson08-size" value="S" checked={size === 'S'} onChange={(e) => setSize(e.target.value)} />
          Small
        </label>
        <label>
          <input type="radio" name="lesson08-size" value="M" checked={size === 'M'} onChange={(e) => setSize(e.target.value)} />
          Medium
        </label>
        <label>
          <input type="radio" name="lesson08-size" value="L" checked={size === 'L'} onChange={(e) => setSize(e.target.value)} />
          Large
        </label>
      </p>
      <p>
        <label style={{ alignItems: 'flex-start' }}>
          Notes (textarea)
          {/* In React, a textarea uses value={…} too. */}
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </p>
      <Show code="{ quantity, milk, extraHot, size, notes }" value={{ quantity, milk, extraHot, size, notes }} />
      <p className="muted">↑ Live state. Notice quantity is a number and extraHot is a boolean.</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// One object for the whole form, one change handler, validation, submit
// -----------------------------------------------------------------------------
// With many fields, one useState per field gets repetitive. Instead:
//   • keep ONE object in state
//   • give each input a `name` matching its key in that object
//   • ONE handler updates whichever field changed:  { ...form, [name]: value }
const EMPTY_SIGNUP = { name: '', email: '', pickup: 'asap', newsletter: false };

function validateSignup(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter at least 2 characters.';
  if (!values.email.includes('@')) errors.email = "That email doesn't look right.";
  return errors; // an empty object means "no errors"
}

function SignupForm() {
  const [signup, setSignup] = useState(EMPTY_SIGNUP);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  function handleChange(event) {
    const { name, value, type, checked } = event.target; // destructuring (lesson 03)
    setSignup({ ...signup, [name]: type === 'checkbox' ? checked : value });
  }

  function handleSubmit(event) {
    event.preventDefault(); // lesson 04: no page reload
    const newErrors = validateSignup(signup);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return; // any errors? stop here
    setSubmitted(signup); // "send" it (lesson 09 shows real sending)
    setSignup(EMPTY_SIGNUP); // reset the fields
  }

  // A DERIVED value: recalculated every render, never stored in state.
  const isFilledIn = signup.name !== '' && signup.email !== '';

  return (
    <div className="card">
      {/* noValidate turns off the browser's own validation bubbles so you can see ours. */}
      <form onSubmit={handleSubmit} noValidate>
        <p>
          <label>
            Name
            <input name="name" value={signup.name} onChange={handleChange} />
          </label>
          {errors.name && <span className="error"> {errors.name}</span>}
        </p>
        <p>
          <label>
            Email
            <input name="email" type="email" value={signup.email} onChange={handleChange} />
          </label>
          {errors.email && <span className="error"> {errors.email}</span>}
        </p>
        <p>
          <label>
            Pick-up
            <select name="pickup" value={signup.pickup} onChange={handleChange}>
              <option value="asap">As soon as possible</option>
              <option value="15">In 15 minutes</option>
              <option value="30">In 30 minutes</option>
            </select>
          </label>
        </p>
        <p>
          <label>
            <input name="newsletter" type="checkbox" checked={signup.newsletter} onChange={handleChange} />
            Send me the weekly specials
          </label>
        </p>
        <button type="submit" disabled={!isFilledIn}>
          Sign up
        </button>
      </form>
      {submitted && (
        <p className="success">
          ✅ Thanks, {submitted.name}! We'll email {submitted.email}.{submitted.newsletter && ' You are on the specials list.'}
        </p>
      )}
    </div>
  );
}
// Good to know: an input with no `value` prop is "uncontrolled" (the DOM keeps
// the value and you read it on submit). React 19 also supports
// <form action={fn}>, which hands you the form data on submit. Controlled
// inputs are the foundation, and what you need for live previews,
// validation-as-you-type, and transforming input.

// -----------------------------------------------------------------------------
// The lesson page
// -----------------------------------------------------------------------------
export default function Lesson() {
  return (
    <div>
      <h2>1A · The JavaScript you need first</h2>

      <h3>Typed text is a string</h3>
      <Show code="'2' + 1" value={oops} />
      <Show code="Number('2') + 1" value={fixed} />
      <Show code="Number('')" value={fromEmpty} />
      <Show code="Number('abc')" value={fromWord} />
      <Show code="Number.isNaN(Number('abc'))" value={isItNaN} />

      <h3>String methods</h3>
      <Show code="'  Sam  '.trim()" value={trimmed} />
      <Show code="'  Sam  '.trim().length" value={nameLength} />
      <Show code="'sam@cafe.com'.includes('@')" value={hasAt} />
      <Show code="'latte'.toUpperCase()" value={shouting} />

      <h3>Computed property names</h3>
      <Show code="{ [key]: 'sam@cafe.com' }   (key is 'email')" value={byComputedKey} />
      <Show code="{ ...form, [fieldName]: 'sam@cafe.com' }" value={updatedForm} />

      <h3>Object.keys</h3>
      <Show code="Object.keys(someErrors)" value={Object.keys(someErrors)} />
      <Show code="Object.keys(someErrors).length > 0" value={Object.keys(someErrors).length > 0} />
      <Show code="Object.keys(noErrors).length > 0" value={Object.keys(noErrors).length > 0} />

      <h2>1B · The React part: forms</h2>

      <h3>A controlled input</h3>
      <NameField />

      <h3>Every input type</h3>
      <InputTypes />

      <h3>One object, one handler, validation, submit</h3>
      <SignupForm />

      <h3>Quick check (answer out loud)</h3>
      <ol>
        <li>Why is '2' + 1 equal to '21'? How do you fix it?</li>
        <li>What does {'{ ...form, [name]: value }'} do if name is 'email'?</li>
        <li>What two props make an input "controlled"?</li>
        <li>For a checkbox, do you read event.target.value or event.target.checked?</li>
        <li>Why is isFilledIn calculated instead of stored in state?</li>
      </ol>
    </div>
  );
}

// #############################################################################
// PART 2 · ASSIGNMENTS
// #############################################################################
// Time: about 20 minutes.

// -----------------------------------------------------------------------------
// A · JavaScript: the helpers a checkout form needs
// -----------------------------------------------------------------------------

// A1. setField(currentForm, name, value) → a NEW object with that one field changed.
//     setField({ name: 'Sam', note: '' }, 'note', 'Hot') → { name: 'Sam', note: 'Hot' }
const setField = (currentForm, name, value) => {
  // TODO
};

// A2. toQuantity(text) → the number, or 1 if the text is empty or not a number.
//     toQuantity('3') → 3,  toQuantity('') → 1,  toQuantity('abc') → 1
const toQuantity = (text) => {
  // TODO
};

// A3. validateOrder({ name, note, addNote }) → an errors object:
//     • name (trimmed) shorter than 2 → errors.name = 'Please tell us your name.'
//     • addNote is true but note (trimmed) is empty → errors.note = 'Write a note or untick the box.'
//     No problems → {}
const validateOrder = ({ name, note, addNote }) => {
  // TODO
};

// A4. hasErrors(errors) → true if the errors object has any keys.
const hasErrors = (errors) => {
  // TODO
};

// -----------------------------------------------------------------------------
// B · React: the Corner Café checkout
// -----------------------------------------------------------------------------
//   B1. Make every field CONTROLLED with ONE `order` state object:
//         { name: '', pickup: 'asap', payment: 'card', addNote: false, note: '' }
//       Use a single handleChange with [name]: value (and `checked` for the checkbox).
//   B2. Show the note <textarea> ONLY when "Add a note" is ticked, with a live
//       counter underneath like "12/100".
//   B3. On submit (no reload!), validate with your validateOrder from A3.
//       Show each error next to its field; don't submit if there are errors.
//   B4. On a valid submit, REPLACE the form with a confirmation:
//         "Thanks, Sam! Your order will be ready ASAP. Paying by card."
//       ('asap' → "ASAP", '15' → "in 15 minutes", '30' → "in 30 minutes")
//       Also show the note, if there is one.
//   B5. A "Place another order" button brings back an EMPTY form.
//
// How to check: submitting empty shows the name error without reloading;
// ticking "Add a note" shows the textarea; the counter updates and stops at
// 100; the confirmation shows the right pickup text and payment.
function CafeCheckout() {
  // TODO: state for the order, the errors, and whether it was submitted

  function handleChange(event) {
    // TODO B1
  }

  function handleSubmit(event) {
    // TODO B3 + B4
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h4 style={{ marginTop: 0 }}>Checkout</h4>
      <p>
        <label>
          Name for the order
          <input name="name" />
        </label>
      </p>
      <p>
        <label>
          Pick-up time
          <select name="pickup">
            <option value="asap">As soon as possible</option>
            <option value="15">In 15 minutes</option>
            <option value="30">In 30 minutes</option>
          </select>
        </label>
      </p>
      <p className="row">
        Payment:
        <label>
          <input type="radio" name="payment" value="card" /> Card
        </label>
        <label>
          <input type="radio" name="payment" value="cash" /> Cash
        </label>
      </p>
      <p>
        <label>
          <input type="checkbox" name="addNote" /> Add a note for the barista
        </label>
      </p>
      <p>
        <textarea name="note" rows={3} maxLength={100} placeholder="e.g. extra hot, please" />
      </p>
      <button type="submit">Place order</button>
    </form>
  );
}

export function Assignments() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="setField({ name: 'Sam', note: '' }, 'note', 'Hot')" run={() => setField({ name: 'Sam', note: '' }, 'note', 'Hot')} expected={{ name: 'Sam', note: 'Hot' }} />
      <Check label="setField works for any field" run={() => setField({ a: 1, b: 2 }, 'b', 3)} expected={{ a: 1, b: 3 }} />
      <Check label="toQuantity('3')" run={() => toQuantity('3')} expected={3} />
      <Check label="toQuantity('')" run={() => toQuantity('')} expected={1} />
      <Check label="toQuantity('abc')" run={() => toQuantity('abc')} expected={1} />
      <Check label="validateOrder(all good)" run={() => validateOrder({ name: 'Sam', note: '', addNote: false })} expected={{}} />
      <Check label="validateOrder(short name)" run={() => validateOrder({ name: ' S ', note: '', addNote: false })} expected={{ name: 'Please tell us your name.' }} />
      <Check label="validateOrder(empty note)" run={() => validateOrder({ name: 'Sam', note: '  ', addNote: true })} expected={{ note: 'Write a note or untick the box.' }} />
      <Check label="hasErrors({ name: 'x' })" run={() => hasErrors({ name: 'x' })} expected={true} />
      <Check label="hasErrors({})" run={() => hasErrors({})} expected={false} />

      <h3>B · React</h3>
      <CafeCheckout />
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
        In <code>NameField</code>, delete <code>onChange</code> from the name input. Try typing, and read the console
        warning.
      </li>
      <li>
        In <code>InputTypes</code>, remove <code>Number(…)</code> from the quantity input. Change the number and look
        at the live state: what type is quantity now?
      </li>
      <li>
        Change <code>SignupForm</code>'s validation so the email must also contain a "." after the "@".
      </li>
      <li>
        Remove <code>noValidate</code> from the signup form and submit a bad email. Whose error message appears now?
      </li>
      <li>Make the promo code input only allow 6 characters and show "✓ valid" when it equals "LATTE6".</li>
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

const setFieldSolution = (currentForm, name, value) => ({ ...currentForm, [name]: value });

const toQuantitySolution = (text) => {
  const quantity = Number(text);
  return text === '' || Number.isNaN(quantity) ? 1 : quantity; // Number('') is 0, so check '' too
};

const validateOrderSolution = ({ name, note, addNote }) => {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please tell us your name.';
  if (addNote && note.trim() === '') errors.note = 'Write a note or untick the box.';
  return errors;
};

const hasErrorsSolution = (errors) => Object.keys(errors).length > 0;

const EMPTY_ORDER = { name: '', pickup: 'asap', payment: 'card', addNote: false, note: '' };
const PICKUP_TEXT = { asap: 'ASAP', 15: 'in 15 minutes', 30: 'in 30 minutes' };

function CafeCheckoutSolution() {
  const [order, setOrder] = useState(EMPTY_ORDER);
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(null);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setOrder({ ...order, [name]: type === 'checkbox' ? checked : value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const newErrors = validateOrderSolution(order);
    setErrors(newErrors);
    if (!hasErrorsSolution(newErrors)) setConfirmed(order);
  }

  function startOver() {
    setOrder(EMPTY_ORDER);
    setErrors({});
    setConfirmed(null);
  }

  // Early return: show the confirmation INSTEAD of the form.
  if (confirmed) {
    return (
      <div className="card">
        <p className="success">
          Thanks, {confirmed.name}! Your order will be ready {PICKUP_TEXT[confirmed.pickup]}. Paying by {confirmed.payment}.
        </p>
        {confirmed.addNote && <p>📝 Note: {confirmed.note}</p>}
        <button onClick={startOver}>Place another order</button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h4 style={{ marginTop: 0 }}>Checkout</h4>
      <p>
        <label>
          Name for the order
          <input name="name" value={order.name} onChange={handleChange} />
        </label>
        {errors.name && <span className="error"> {errors.name}</span>}
      </p>
      <p>
        <label>
          Pick-up time
          <select name="pickup" value={order.pickup} onChange={handleChange}>
            <option value="asap">As soon as possible</option>
            <option value="15">In 15 minutes</option>
            <option value="30">In 30 minutes</option>
          </select>
        </label>
      </p>
      <p className="row">
        Payment:
        <label>
          <input type="radio" name="payment" value="card" checked={order.payment === 'card'} onChange={handleChange} /> Card
        </label>
        <label>
          <input type="radio" name="payment" value="cash" checked={order.payment === 'cash'} onChange={handleChange} /> Cash
        </label>
      </p>
      <p>
        <label>
          <input type="checkbox" name="addNote" checked={order.addNote} onChange={handleChange} /> Add a note for the
          barista
        </label>
      </p>
      {order.addNote && (
        <p>
          <textarea name="note" rows={3} maxLength={100} placeholder="e.g. extra hot, please" value={order.note} onChange={handleChange} />
          <br />
          <span className="muted">{order.note.length}/100</span>
          {errors.note && <span className="error"> {errors.note}</span>}
        </p>
      )}
      <button type="submit">Place order</button>
    </form>
  );
}

export function Solutions() {
  return (
    <div>
      <h3>A · JavaScript</h3>
      <Check label="setField({ a: 1, b: 2 }, 'b', 3)" run={() => setFieldSolution({ a: 1, b: 2 }, 'b', 3)} expected={{ a: 1, b: 3 }} />
      <Check label="toQuantity('')" run={() => toQuantitySolution('')} expected={1} />
      <Check label="toQuantity('abc')" run={() => toQuantitySolution('abc')} expected={1} />
      <Check label="validateOrder(empty note)" run={() => validateOrderSolution({ name: 'Sam', note: '  ', addNote: true })} expected={{ note: 'Write a note or untick the box.' }} />
      <Check label="hasErrors({})" run={() => hasErrorsSolution({})} expected={false} />

      <h3>B · React</h3>
      <CafeCheckoutSolution />
    </div>
  );
}
