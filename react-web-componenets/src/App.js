import React, { useEffect, useRef, useState } from 'react';
import Counter from './ReactCounter';
import MessageBox from './ReactMessageBox';

function App() {
  const [timeout, setTimeout] = useState(1000);
  const timerRef = useRef();

  useEffect(() => {
    const timerHandler = (e) => {
      timerRef.current.textContent = e.detail.toLocaleTimeString();
    };
    window.addEventListener('timerTick', timerHandler);
    return () => {
      window.removeEventListener('timerTick', timerHandler);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.controlPanel}>
        <input
          type="number"
          value={timeout}
          onChange={(e) => setTimeout(e.target.value)}
          style={styles.input}
          min="100"
          step="100"
        />
        <button
          onClick={() => window.createTimer(timeout)}
          style={styles.button}
        >
          Start Window Timer
        </button>
        <button
          onClick={() => window.removeTimer()}
          style={{ ...styles.button, ...styles.stopButton }}
        >
          Stop Window Timer
        </button>
      </div>
      <div style={styles.timerDisplay}>
        Current Time: <span ref={timerRef} style={styles.timerValue}></span>
      </div>
      <Counter />
      <MessageBox />
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  controlPanel: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
    width: '100px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  timerDisplay: {
    fontSize: '18px',
    margin: '20px 0',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  timerValue: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
};

export default App;
