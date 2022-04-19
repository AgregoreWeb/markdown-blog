export default class CreatePost extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({mode: 'open'})
    this._root.innerHTML = `
      <link href="index.css" rel="stylesheet">
      <style>
        form > div {
          display: flex;
          flex-direction: column;
        }
      </style>
    `
    let form = document.createElement('form');
    form.innerHTML = `
      <div>
        <label>Title</label>
        <input name="filename" />
      </div>
      <div>
        <label>Body</label>
        <textarea name="content" rows="15"></textarea>
      </div>
      <input type="submit" value="Create" />
    `;
    this._root.appendChild(form);
  }

  connectedCallback() {
    this._root.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      let filename = this._root.querySelector('input[name="filename"]').value;
      if (! filename.match(/\d\d\d\d-\d\d-\d\d-/)){
        let date = new Date().toISOString().slice(0, 10); //YYYY-mm-dd
        filename = `${date}-${filename}`;
      }
      if (! filename.match(/\.md$/) ){
        filename = `${filename}.md`;
      }
      let content = this._root.querySelector('textarea[name="content"]').value;
      console.log(`CreatePost.connectedCallback.submit ${filename} ${content}`);
      this.dispatchEvent(new CustomEvent('onSubmit', { detail: { filename, content } }));
    });
  }

  appendText(text) {
    let textArea = this._root.querySelector('textarea[name=content]');
    textArea.value = `${textArea.value} ${text}`;
  }
}

customElements.define('create-post', CreatePost);
