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
    let files = await loadContent();
    let domList = this.shadowRoot.querySelector('.item-list');
    for (let f of files){
      let {filename, link} = f;
      let li = document.createElement('li');
      let a = document.createElement('a');
      a.href = link;
      a.textContent = filename;
      li.appendChild(a)
      domList.appendChild(li);
    }
  }
}
customElements.define('post-list', PostList);

