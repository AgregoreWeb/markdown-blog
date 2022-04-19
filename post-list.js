import {loadContent} from './lib.js';

const templateItem = document.createElement('template');

// TODO - update for new mockup. Where to put link?
templateItem.innerHTML = `
    <li class="item">
      <h3></h3>
      <span class="date"></span>
      <p class="excerpt"></p>
      <a class="button">View</a>
      <button class="edit">Edit</button>
      <button class="delete">🗑 Delete</button>
    </li>
`;

class PostList extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <link href="index.css" rel="stylesheet">
      <style>
        ul {
          padding-inline-start: 0;
        }
        li > h3 {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
        }
      </style>
    `;
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
      const itemNode = templateItem.content.cloneNode(true)
      postList = [...postList, itemNode];
      const {filename, content, link, title, date} = f;

      const h3 = itemNode.querySelector('h3');
      h3.textContent = title;
      const dateDiv = itemNode.querySelector('.date');
      dateDiv.textContent = date;
      const ex = itemNode.querySelector('.excerpt');
      ex.textContent = content;
      const a = itemNode.querySelector('a');
      a.href = link;
      const deleteButton = itemNode.querySelector('button.delete');
      deleteButton.addEventListener('click', (e) => {
        this.dispatchEvent(new CustomEvent('onRemove', { detail: {filename} }));
      });
    }
    let domList = this.shadowRoot.querySelector('.item-list');
    domList.replaceChildren(...postList);
  }

}
customElements.define('post-list', PostList);

