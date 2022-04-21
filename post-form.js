import { parseFilename } from './lib.js';

export default class CreatePost extends HTMLElement {
  constructor () {
    super();
    this.innerHTML = `
      <style>
        div.formContainer {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin: 1em 0;
        }
      </style>
      <form id="postForm"></form>
      <div class="formContainer">
        <label>Title</label>
        <input name="title" form="postForm"/>
        <label>Body</label>
        <file-upload></file-upload>
        <textarea name="content" rows="15" form="postForm"></textarea>
        <input type="submit" value="Create" form="postForm"/>
      </div>
    `;
    this._form = this.querySelector('#postForm');
  }

  connectedCallback () {
    this.querySelector('file-upload').addEventListener('onFileSelected', (e) => {
      this.dispatchEvent(new CustomEvent('onFileUpload', { detail: e.detail }));
    });

    this._form.addEventListener('submit', this._onSubmitForm.bind(this));
  }

  reset () {
    this._form.reset();
  }

  _onSubmitForm (e) {
    e.preventDefault();
    const originalFilename = this.getAttribute('filename') || null;
    let filename = this.querySelector('input[name="title"]').value;

    if (!filename.match(/\d\d\d\d-\d\d-\d\d-/)) {
      let date = new Date().toISOString().slice(0, 10); // YYYY-mm-dd
      if (originalFilename) {
        date = parseFilename(originalFilename).date;
      }
      filename = `${date}-${filename}`;
    }
    if (!filename.match(/\.md$/)) {
      filename = `${filename}.md`;
    }
    const content = this.querySelector('textarea[name="content"]').value;
    console.log(`CreatePost.connectedCallback.submit ${filename} ${content}`);
    const eventDetail = {
      originalFilename,
      filename,
      content
    };
    this.dispatchEvent(new CustomEvent('onSubmit', { detail: eventDetail }));
  }

  appendText (text) {
    const textArea = this.querySelector('textarea[name=content]');
    const selectionStart = textArea.selectionStart;
    textArea.value = textArea.value.slice(0, selectionStart) + text + textArea.value.slice(selectionStart);
    textArea.selectionStart = selectionStart;
  }

  static get observedAttributes () { return ['filename', 'content']; }

  async attributeChangedCallback (name, oldValue, newValue) {
    console.log('PostForm.attributeChangedCallback');
    this._render();
  }

  _render () {
    if (this.hasAttribute('filename')) {
      this.querySelector('input[type=submit]').value = 'Update';
      const filename = this.getAttribute('filename');
      this.querySelector('input[name=title]').value = parseFilename(filename).title || '';
    } else {
      this.querySelector('input[type=submit]').value = 'Create';
    }
    if (this.hasAttribute('content')) {
      this.querySelector('textarea[name=content]').value = this.getAttribute('content') || '';
    }
  }
}

customElements.define('post-form', CreatePost);
