// counter-wc.js
class CounterWC extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        span {
          font-size: 20px;
          margin: 0 10px;
        }
      </style>
      <div>
        <span id="count">0</span>
      </div>
    `;
    this.countDisplay = this.shadowRoot.getElementById('count');
  }

  set count(value) {
    this._count = value;
    this.countDisplay.textContent = `${value} : )`;
  }

  get count() {
    return this._count;
  }
}

customElements.define('counter-wc', CounterWC);
