import {loadContent} from './lib.js';

const templateItem = document.createElement('template');

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
    this.innerHTML = `
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
    this.appendChild(container);
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
      const {filename, content, link, title, date, excerpt} = f;

      const h3 = itemNode.querySelector('h3');
      h3.textContent = title;
      const dateDiv = itemNode.querySelector('.date');
      dateDiv.textContent = date;
      const ex = itemNode.querySelector('.excerpt');
      ex.textContent = excerpt;
      const a = itemNode.querySelector('a');
      a.href = link;
      itemNode.querySelector('button.edit').addEventListener('click', e => {
        this.dispatchEvent(new CustomEvent('onPostEdit', { detail: {filename, content} }));
      });
      const deleteButton = itemNode.querySelector('button.delete');
      deleteButton.addEventListener('click', e => {
        this.dispatchEvent(new CustomEvent('onRemove', { detail: {filename} }));
      });
    }
    let domList = this.querySelector('.item-list');
    domList.replaceChildren(...postList);
  }
}
customElements.define('post-list', PostList);

