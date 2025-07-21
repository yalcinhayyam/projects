class RichTextEditor extends HTMLElement {
  constructor() {
    super();

    // Shadow DOM oluştur
    this.attachShadow({ mode: 'open' });

    // Başlangıç değerleri
    this.value = this.getAttribute('value') || '';
    this.placeholder = this.getAttribute('placeholder') || 'Metin yazın...';

    this.render();
    this.attachEventListeners();
  }

  // Gözlemlenecek attribute'lar
  static get observedAttributes() {
    return ['value', 'placeholder', 'readonly'];
  }

  // Attribute değişikliklerini dinle
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue;
      this.render();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
          <style>
              :host {
                  display: block;
                  border: 2px solid #e1e5e9;
                  border-radius: 8px;
                  background: white;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  overflow: hidden;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              :host(:focus-within) {
                  border-color: #0066cc;
                  box-shadow: 0 0 0 3px rgba(0,102,204,0.1);
              }
              
              .toolbar {
                  background: #f8f9fa;
                  border-bottom: 1px solid #e1e5e9;
                  padding: 8px 12px;
                  display: flex;
                  gap: 4px;
                  flex-wrap: wrap;
              }
              
              .btn {
                  background: white;
                  border: 1px solid #d0d7de;
                  border-radius: 4px;
                  padding: 6px 10px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                  transition: all 0.2s;
                  min-width: 32px;
                  text-align: center;
              }
              
              .btn:hover {
                  background: #f3f4f6;
                  border-color: #a1a8b0;
              }
              
              .btn.active {
                  background: #0066cc;
                  color: white;
                  border-color: #0066cc;
              }
              
              .editor {
                  min-height: 200px;
                  padding: 16px;
                  outline: none;
                  line-height: 1.6;
                  font-size: 14px;
                  color: #24292f;
              }
              
              .editor:empty:before {
                  content: attr(data-placeholder);
                  color: #656d76;
                  pointer-events: none;
              }
              
              .separator {
                  width: 1px;
                  height: 24px;
                  background: #d0d7de;
                  margin: 0 4px;
              }
              
              /* Rich text formatting */
              .editor b, .editor strong { font-weight: bold; }
              .editor i, .editor em { font-style: italic; }
              .editor u { text-decoration: underline; }
              .editor h1 { font-size: 2em; margin: 0.67em 0; font-weight: bold; }
              .editor h2 { font-size: 1.5em; margin: 0.75em 0; font-weight: bold; }
              .editor h3 { font-size: 1.17em; margin: 0.83em 0; font-weight: bold; }
              .editor ul, .editor ol { margin: 1em 0; padding-left: 40px; }
              .editor li { margin: 0.5em 0; }
              .editor blockquote { 
                  margin: 1em 0; 
                  padding: 0 1em; 
                  border-left: 4px solid #0066cc; 
                  background: #f6f8fa;
              }
              .editor a { color: #0066cc; text-decoration: underline; }
              .editor code {
                  background: #f3f4f6;
                  padding: 2px 4px;
                  border-radius: 3px;
                  font-family: 'SF Mono', Monaco, monospace;
                  font-size: 85%;
              }
          </style>
          
          <div class="toolbar">
              <button class="btn" data-command="bold" title="Kalın (Ctrl+B)"><b>B</b></button>
              <button class="btn" data-command="italic" title="İtalik (Ctrl+I)"><i>I</i></button>
              <button class="btn" data-command="underline" title="Altı Çizgili (Ctrl+U)"><u>U</u></button>
              
              <div class="separator"></div>
              
              <button class="btn" data-command="formatBlock" data-value="h1" title="Başlık 1">H1</button>
              <button class="btn" data-command="formatBlock" data-value="h2" title="Başlık 2">H2</button>
              <button class="btn" data-command="formatBlock" data-value="h3" title="Başlık 3">H3</button>
              <button class="btn" data-command="formatBlock" data-value="p" title="Paragraf">P</button>
              
              <div class="separator"></div>
              
              <button class="btn" data-command="insertUnorderedList" title="Madde İşareti">• </button>
              <button class="btn" data-command="insertOrderedList" title="Numaralı Liste">1. </button>
              <button class="btn" data-command="formatBlock" data-value="blockquote" title="Alıntı">" </button>
              
              <div class="separator"></div>
              
              <button class="btn" data-command="createLink" title="Link Ekle">🔗</button>
              <button class="btn" data-command="unlink" title="Link Kaldır">🔗✕</button>
              
              <div class="separator"></div>
              
              <button class="btn" data-command="removeFormat" title="Formatı Temizle">⌫</button>
          </div>
          
          <div class="editor" 
               contenteditable="true" 
               data-placeholder="${this.placeholder}">
              ${this.value}
          </div>
      `;
  }

  attachEventListeners() {
    const toolbar = this.shadowRoot.querySelector('.toolbar');
    const editor = this.shadowRoot.querySelector('.editor');

    // Toolbar buton tıklamaları
    toolbar.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn')) {
        e.preventDefault();
        const command = e.target.dataset.command;
        const value = e.target.dataset.value;

        this.executeCommand(command, value);
      }
    });

    // Editor olayları
    editor.addEventListener('input', () => {
      this.value = editor.innerHTML;
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: this.value },
        })
      );
    });

    editor.addEventListener('keydown', (e) => {
      // Klavye kısayolları
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            this.executeCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            this.executeCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            this.executeCommand('underline');
            break;
        }
      }
    });

    // Selection değişikliklerini dinle (buton durumları için)
    editor.addEventListener('mouseup', () => this.updateToolbarState());
    editor.addEventListener('keyup', () => this.updateToolbarState());
  }

  executeCommand(command, value = null) {
    const editor = this.shadowRoot.querySelector('.editor');
    editor.focus();

    if (command === 'createLink') {
      const url = prompt('Link URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false, value);
    }

    this.updateToolbarState();

    // Değer değişikliğini bildir
    this.value = editor.innerHTML;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
      })
    );
  }

  updateToolbarState() {
    const buttons = this.shadowRoot.querySelectorAll('.btn[data-command]');

    buttons.forEach((btn) => {
      const command = btn.dataset.command;
      const value = btn.dataset.value;

      let isActive = false;

      try {
        if (value) {
          // Block format komutları için
          isActive = document.queryCommandValue(command) === value;
        } else {
          // Basit stil komutları için
          isActive = document.queryCommandState(command);
        }
      } catch (e) {
        // Bazı komutlar desteklenmeyebilir
      }

      btn.classList.toggle('active', isActive);
    });
  }

  // Public API methodları
  getValue() {
    return this.shadowRoot.querySelector('.editor').innerHTML;
  }

  setValue(value) {
    this.shadowRoot.querySelector('.editor').innerHTML = value;
    this.value = value;
  }

  focus() {
    this.shadowRoot.querySelector('.editor').focus();
  }

  clear() {
    this.setValue('');
  }
}

// Web Component'i kaydet
if (!customElements.get('rich-text-editor')) {
  customElements.define('rich-text-editor', RichTextEditor);
}

// Export için (ES modules)
export default RichTextEditor;
