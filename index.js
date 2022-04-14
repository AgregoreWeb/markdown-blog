import {postAdd, removeFile, publish, mediaAdd} from './lib.js';

const template = document.createElement('template');
template.innerHTML = `
  <div>
    <post-list></post-list>
    <blog-links></blog-links>
    <create-post></create-post>
    <file-upload></file-upload>
  </div>
`;

class App extends HTMLElement {
  constructor(){
    super();

    this._root = this.attachShadow({mode: 'open'});
    this._root.appendChild(template.content.cloneNode(true));
    this._createPost =  this._root.querySelector('create-post');
    this._postList = this._root.querySelector('post-list');
    this._postList.setAttribute('cid', window.localStorage.lastCid);
    this._links = this._root.querySelector('blog-links');
    this._fileUpload = this._root.querySelector('file-upload');
    if (window.localStorage.ipns){
      this._links.setAttribute('ipns', window.localStorage.ipns)
    }
    if (window.localStorage.lastCid){
      this._links.setAttribute('lastCid', window.localStorage.lastCid);
    }
  }

  connectedCallback(){
    console.log('beep');
    let lastCid = window.localStorage.getItem('lastCid');
    console.log(`lastCid = ${lastCid}`);
    this._createPost.addEventListener('onSubmit', this.onPostAdd.bind(this));
    this._postList.addEventListener('onRemove', this.onPostRemove.bind(this));
    this._fileUpload.addEventListener('onSubmit', this.onFileUpload.bind(this));
  }

  async onPostAdd(e){
    const {filename, content} = e.detail;
    console.log(`submitForm ${filename} ${content}`);
    var file = new File([content], filename, {
      type: "text/plain",
    });
    let lastCid = await postAdd(file, filename);
    this._postList.setAttribute('cid', lastCid);
    this._links.setAttribute('lastCid', lastCid);
    console.log(`lastCid = ${lastCid}`);
  }

  async onPostRemove(e){
    const {filename} = e.detail;
    let lastCid = await removeFile(filename);
    this._postList.setAttribute('cid', lastCid);
    this._links.setAttribute('lastCid', lastCid);
  }

  async onFileUpload(e){
    const {file} = e.detail;
    console.log(`onFileUpload file.name=${file.name}`);
    let lastCid = await mediaAdd(file);
    this._postList.setAttribute('cid', lastCid);
    this._links.setAttribute('lastCid', lastCid);
  }

}
customElements.define('ipmb-app', App);
