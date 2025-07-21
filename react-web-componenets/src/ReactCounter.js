import React, { useRef, useEffect, useState } from 'react';
import './web-components/counter.js';

function ReactCounter() {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    if (counterRef.current) {
      counterRef.current.count = count;
    }
  }, [count]);

  const increment = () => {
    setCount((currentCount) => currentCount + 1);
  };

  const decrement = () => {
    setCount((currentCount) => currentCount - 1);
  };

  return (
    <div>
      <h2>React-Controlled Web Component Counter</h2>
      <div style={{ margin: '20px', display: 'flex', alignItems: 'center' }}>
        <button
          style={{ padding: '8px 16px', fontSize: '16px', margin: '0 5px' }}
          onClick={decrement}
        >
          -
        </button>

        <counter-wc ref={counterRef} />

        <button
          style={{ padding: '8px 16px', fontSize: '16px', margin: '0 5px' }}
          onClick={increment}
        >
          +
        </button>
      </div>
      <h3>Current count in React: {count}</h3>
    </div>
  );
}

export default ReactCounter;
