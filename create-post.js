export default class CreatePost extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({mode: 'open'})
    this._shadow.innerHTML = `
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
    this._shadow.appendChild(form);
  }

  connectedCallback() {
    this._shadow.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      let filename = this._shadow.querySelector('input[name="filename"]').value;
      if (! filename.match(/\d\d\d\d-\d\d-\d\d-/)){
        let date = new Date().toISOString().slice(0, 10); //YYYY-mm-dd
        filename = `${date}-${filename}`;
      }
      if (! filename.match(/\.md$/) ){
        filename = `${filename}.md`;
      }
      let content = this._shadow.querySelector('textarea[name="content"]').value;
      console.log(`CreatePost.connectedCallback.submit ${filename} ${content}`);
      this.dispatchEvent(new CustomEvent('onSubmit', { detail: { filename, content } }));
    });
  }
}

customElements.define('create-post', CreatePost);
