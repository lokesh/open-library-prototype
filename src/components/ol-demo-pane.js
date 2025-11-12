import { LitElement, html, css, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * A demo pane component that renders a template's content live
 * alongside its source code with syntax highlighting
 *
 * @element ol-demo-pane
 *
 * @slot - Should contain a single <template> element with the demo markup
 *
 * @example
 * <ol-demo-pane>
 *   <template>
 *     <ol-button variant="primary">Click me</ol-button>
 *   </template>
 * </ol-demo-pane>
 */
export class OlDemoPane extends LitElement {
  static properties = {
    _code: { state: true },
    _highlightedCode: { state: true },
    _templateContent: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--spacing-component, 16px);
    }

    .preview {
    }

    .code {
      border: var(--border-control);
      background: var(--color-bg-elevated);
      position: relative;
      border-radius: var(--radius-card, 8px);
      overflow: hidden;
    }

    .copy-button {
      position: absolute;
      top: 8px;
      right: 8px;
      border: var(--border-width-control, 1px) solid var(--color-border, #e5e7eb);
      background: var(--color-bg-elevated, white);
      padding: var(--spacing-1) var(--spacing-2);
      cursor: pointer;
      border-radius: var(--radius-button, 4px);
      font-size: var(--font-size-xs, 14px);
      color: var(--color-text, #000);
      transition: background-color 0.2s;
      z-index: 1;
    }

    .copy-button:hover {
      background: var(--color-bg-elevated-hovered, #f5f5f5);
    }

    .copy-button:active {
      transform: translateY(1px);
    }

    pre {
      margin: 0;
      overflow: auto;
      padding: var(--spacing-inline);
    }

    code {
      font-family: var(--font-family-mono, 'Monaco', 'Courier New', monospace);
      font-size: var(--font-size-xs);
      line-height: 1.5;
    }

    /* Prism.js Syntax Highlighting Styles - Imported into Shadow DOM */
    code[class*="language-"],
    pre[class*="language-"] {
      color: black;
      background: none;
      text-shadow: 0 1px white;
      text-align: left;
      white-space: pre;
      word-spacing: normal;
      word-break: normal;
      word-wrap: normal;
      line-height: 1.5;
      tab-size: 4;
      hyphens: none;
    }

    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
      color: slategray;
    }

    .token.punctuation {
      color: #999;
    }

    .token.namespace {
      opacity: .7;
    }

    .token.property,
    .token.tag,
    .token.boolean,
    .token.number,
    .token.constant,
    .token.symbol,
    .token.deleted {
      color: #905;
    }

    .token.selector,
    .token.attr-name,
    .token.string,
    .token.char,
    .token.builtin,
    .token.inserted {
      color: #690;
    }

    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
      color: #9a6e3a;
      background: hsla(0, 0%, 100%, .5);
    }

    .token.atrule,
    .token.attr-value,
    .token.keyword {
      color: #07a;
    }

    .token.function,
    .token.class-name {
      color: #DD4A68;
    }

    .token.regex,
    .token.important,
    .token.variable {
      color: #e90;
    }

    .token.important,
    .token.bold {
      font-weight: bold;
    }

    .token.italic {
      font-style: italic;
    }

    .token.entity {
      cursor: help;
    }

    @media (max-width: 900px) {
      .demo-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  constructor() {
    super();
    this._code = '';
    this._highlightedCode = '';
    this._templateContent = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._extractTemplateContent();
  }

  /**
   * Extract the template content and code from the light DOM
   */
  _extractTemplateContent() {
    const template = this.querySelector('template');
    if (!template) return;

    // Clone the template content for rendering
    this._templateContent = template.content.cloneNode(true);

    // Extract and dedent the code
    this._code = this._dedent(template.innerHTML);

    // Highlight the code using Prism if available
    if (window.Prism && window.Prism.languages.markup) {
      this._highlightedCode = window.Prism.highlight(
        this._code,
        window.Prism.languages.markup,
        'markup'
      );
    } else {
      // Fallback: use plain code
      this._highlightedCode = this._code;
    }
  }

  /**
   * Dedent code by removing common leading whitespace
   * @param {string} str - The string to dedent
   * @returns {string} The dedented string
   */
  _dedent(str) {
    // Remove leading and trailing blank lines
    const s = str.replace(/^\n/, '').replace(/\n\s*$/, '');
    const lines = s.split('\n');

    // Find minimum indentation from non-empty lines
    const indents = lines
      .filter(l => l.trim())
      .map(l => (l.match(/^(\s*)/)?.[1].length ?? 0));

    const min = indents.length ? Math.min(...indents) : 0;

    // Remove the minimum indentation from all lines
    return lines.map(l => l.slice(min)).join('\n');
  }

  /**
   * Copy code to clipboard
   */
  async _copyCode() {
    try {
      await navigator.clipboard?.writeText(this._code);
      const button = this.shadowRoot.querySelector('.copy-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }

  render() {
    return html`
      <div class="demo-grid">
        <div class="preview">
          ${this._templateContent}
        </div>
        <div class="code">
          <button class="copy-button" @click=${this._copyCode}>Copy</button>
          <pre><code class="language-markup">${unsafeHTML(this._highlightedCode)}</code></pre>
        </div>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('ol-demo-pane', OlDemoPane);

