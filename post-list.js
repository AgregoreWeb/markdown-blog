import {loadContent} from './lib.js';

const templateItem = document.createElement('template');

// TODO - update for new mockup. Where to put link?
templateItem.innerHTML = `
    <li class="item">
      <a></a>
      <div class="date"></div>
      <div class="excerpt"></div>
      <button class="destroy">🗑</button>
    </li>
`;

class PostList extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        ul {
          padding-inline-start: 0;
        }
        ul > li {
          list-style: none;
        }
      </style>
    `
    const container = document.createElement('div');
    container.innerHTML = `<ul class="item-list"></ul>`;
    shadow.appendChild(container);
    this._root = shadow;
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

      let {filename, content, link, title, date} = f;
      let a = itemNode.querySelector('a');
      a.href = link;
      a.textContent = title;
      let dateDiv = itemNode.querySelector('.date');
      dateDiv.textContent = date;
      let ex = itemNode.querySelector('.excerpt');
      ex.textContent = content;
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

