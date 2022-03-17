import {addFile} from './lib.js';

async function submitForm(e){
  const {filename, content} = e.detail;
  console.log(`submitForm ${filename} ${content}`);
  var file = new File([content], filename, {
    type: "text/plain",
  });
  let lastCid = await addFile(file, filename)
  console.log(`lastCid = ${lastCid}`);
}

class App extends HTMLElement {
  constructor(){
    super();

    let blogLink = '';
    if (window.localStorage.ipns){
      let ipns = window.localStorage.ipns;
      blogLink = document.createElement('div');
      blogLink.id = 'blogLink';
      blogLink.innerHTML = `<a href="${ipns}/index.md">${ipns}/index.md</a>`;
    }

    let latestLink = '';
    if (window.localStorage.lastCid){
      let lastCid = window.localStorage.lastCid;
      latestLink = document.createElement('div');
      latestLink.id = 'latestLink';
      latestLink.innerHTML = `<a href="ipfs://${lastCid}/index.md">ipfs://${lastCid}/index.md</a>`;
    }

    this._shadow = this.attachShadow({mode: 'open'})
    this._createPost = document.createElement('create-post');
    this._postList = document.createElement('post-list');
    this._shadow.appendChild(this._createPost);
    this._shadow.appendChild(this._postList);
    this._shadow.appendChild(blogLink);
    this._shadow.appendChild(latestLink);
  }

  async connectedCallback(){
    console.log('beep');
    let lastCid = window.localStorage.getItem('lastCid');
    console.log(`lastCid = ${lastCid}`);
    //document.querySelector('#fileForm').onsubmit = submitForm;
    this._createPost.addEventListener('onSubmit', submitForm);
  }
}
customElements.define('ipmb-app', App);


