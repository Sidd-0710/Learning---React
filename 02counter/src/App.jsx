import React from 'react'
import { useState } from 'react' ;
import './App.css'

function App() {

    const [counter ,setCounter]= useState(15)
 

    // let counter = 5;

    const addValue = () => {
      // counter = counter + 1;
      setCounter(counter + 1);
      console.log("Counter value is: ", counter);

    }

    const removeValue = () => {
      // counter = counter - 1;
      setCounter(counter - 1);
      console.log("Counter value is: ", counter);
    }

  return (
    <>
     <h1>Chai and React</h1>
     <h2>Counter value :{counter} </h2>

     <button 
     onClick={addValue}>Add Value {counter}</button>
     <br/>
     <button onClick={removeValue}>Remove  Value {counter} </button>
     <p></p>
    </>
  )
}

export default App
  