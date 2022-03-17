import {addFile, loadContent} from './lib.js';

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

async function submitForm(event){
  event.preventDefault();
  let text = document.querySelector('textarea[name="content"]').value;
  let filename = document.querySelector('input[name="filename"]').value;
  var file = new File([text], filename, {
    type: "text/plain",
  });
  let lastCid = await addFile(file, filename)
  console.log(lastCid);
}

console.log('beep');
let lastCid = window.localStorage.getItem('lastCid');
console.log(`lastCid = ${lastCid}`);

if (window.localStorage.ipns){
  let ipns = window.localStorage.ipns;
  let blogLink = document.querySelector('#blogLink');
  blogLink.innerHTML = `<a href="${ipns}">${ipns}</a>`;
}
document.querySelector('#fileForm').onsubmit = submitForm;
