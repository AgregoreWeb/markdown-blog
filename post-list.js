import {loadContent} from './lib.js';

class PostList extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    container.innerHTML = `<ul class="item-list"></ul>`;
    shadow.appendChild(container);
  }

  async connectedCallback() {
    this._files = await loadContent(this.getAttribute('cid'));
    this._render();
  }

  static get observedAttributes() { return ['cid']; }

  async attributeChangedCallback(name, oldValue, newValue) {
    this._files = await loadContent();
    this._render();
  }

  _render(){
    let domList = this.shadowRoot.querySelector('.item-list');
    let postList = [];
    for (let f of this._files){
      let {filename, link} = f;
      let li = document.createElement('li');
      let a = document.createElement('a');
      a.href = link;
      a.textContent = filename;
      li.appendChild(a)
      postList = [...postList, li]
    }
    domList.replaceChildren(...postList);
  }


}
customElements.define('post-list', PostList);

