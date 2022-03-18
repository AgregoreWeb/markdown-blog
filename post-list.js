import {loadContent} from './lib.js';

const templateItem = document.createElement('template');
templateItem.innerHTML = `
    <li class="item">
      <a></a>
      <button class="destroy">🗑</button>
    </li>
`;

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
    let postList = [];
    for (let f of this._files){
      let itemNode = templateItem.content.cloneNode(true)
      postList = [...postList, itemNode];

      let {filename, link} = f;
      let a = itemNode.querySelector('a');
      a.href = link;
      a.textContent = filename;
      let deleteButton = itemNode.querySelector('button');
      deleteButton.addEventListener('click', (e) => {
        this.dispatchEvent(new CustomEvent('onRemove', { detail: {filename} }));
      });
    }
    let domList = this.shadowRoot.querySelector('.item-list');
    domList.replaceChildren(...postList);
  }


}
customElements.define('post-list', PostList);

