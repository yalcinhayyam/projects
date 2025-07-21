import React, { useRef, useEffect, useState } from 'react';
import './web-components/message-box.js';

function ReactMessageBoxWrapper() {
  const messageBoxRef = useRef(null);
  const [message, setMessage] = useState('Initial message');

  useEffect(() => {
    const current = messageBoxRef.current;
    if (!current) return;

    current.setMessage('Hello from React!');

    const handler = (e) => {
      console.log('Message changed:', e.detail.value);
      setMessage(e.detail.value);
    };
    current.addEventListener('message-changed', handler);

    return () => {
      current.removeEventListener('message-changed', handler);
    };
  }, []);

  const updateMessage = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.setMessage(
        'Updated at: ' + new Date().toLocaleTimeString()
      );
    }
  };

  return (
    <div>
      <message-box ref={messageBoxRef}></message-box>
      <p>Current message in React: {message}</p>
      <button onClick={updateMessage}>Update Message</button>
    </div>
  );
}

export default ReactMessageBoxWrapper;

// declare global {
//   interface HTMLElementTagNameMap {
//     'message-box': MessageBox;
//   }
// }

// interface MessageBox {
//   message: string;
//   setMessage(value: string): this;
//   onMessageChanged(callback: (e: CustomEvent<{value: string}>) => void): this;
// }
