class MessageBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        #message {
          color: inherit;
          font-family: inherit;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          display: inline-block;
        }
      </style>
      <span id="message"></span>
    `;

    this._messageElement = this.shadowRoot.getElementById('message');
    this._message = this.getAttribute('message') || '';
    this._updateDisplay();
  }

  static get observedAttributes() {
    return ['message'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'message') {
      this._message = newValue;
      this._updateDisplay();
    }
  }

  // Public API
  get message() {
    return this._message;
  }

  set message(value) {
    this.setAttribute('message', value);
  }

  setMessage(value) {
    this.message = value;
    return this; // Allow chaining
  }

  onMessageChanged(callback) {
    this.addEventListener('message-changed', callback);
    return this; // Allow chaining
  }

  // Internal method
  _updateDisplay() {
    this._messageElement.textContent = this._message;
    this.dispatchEvent(
      new CustomEvent('message-changed', {
        detail: { value: this._message },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('message-box', MessageBox);
