import {postAdd, removeFile, publish, mediaAdd} from './lib.js';

const template = document.createElement('template');
template.innerHTML = `
  <div>
    <div id="create-post-dialog" class="hidden dialog">
      <h1>Create a new post</h1>
      <a class="close-dialog" role="button" href="#">&lt;&lt; back</a>
      <create-post></create-post>
      <file-upload></file-upload>
    </div>

    <post-list></post-list>
    <button id="create-post-button">Create new post</button>

    <blog-links></blog-links>
  </div>
`;

class App extends HTMLElement {
  constructor(){
    super();

    this._root = this.attachShadow({mode: 'open'});
    this._root.innerHTML = `
      <style>
        .hidden { display: none; }
        .dialog { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: white; padding: 1rem; box-sizing: border-box;}
      </style>
    `;
    this._root.appendChild(template.content.cloneNode(true));
    this._links = this._root.querySelector('blog-links');
    this._postList = this._root.querySelector('post-list');
    this._postList.setAttribute('cid', window.localStorage.lastCid);
    this._createPostDialog = this._root.querySelector('#create-post-dialog');
    this._createPost =  this._root.querySelector('create-post');
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

    let createPostButton = this._root.querySelector('#create-post-button');
    createPostButton.addEventListener('click', e => {
      this._createPostDialog.classList.remove('hidden');
    });

    this._root.querySelector('.close-dialog').addEventListener('click', e => {
      this._createPostDialog.classList.add('hidden');
    });
  }

  async onPostAdd(e){
    const {filename, content} = e.detail;
    console.log(`submitForm ${filename} ${content}`);
    var file = new File([content], filename, {
      type: "text/plain",
    });
    let lastCid = await postAdd(file, filename);
    this._postList.setAttribute('cid', lastCid);
    this._links.setAttribute('lastcid', lastCid);
    this._createPostDialog.classList.add('hidden');
    console.log(`lastCid = ${lastCid}`);
  }

  async onPostRemove(e){
    const {filename} = e.detail;
    let lastCid = await removeFile(filename);
    this._postList.setAttribute('cid', lastCid);
    this._links.setAttribute('lastcid', lastCid);
  }

  async onFileUpload(e){
    const {file} = e.detail;
    console.log(`onFileUpload file.name=${file.name}`);
    let lastCid = await mediaAdd(file);
    this._createPost.appendText(`![${file.name}](/media/${file.name})`);
    this._postList.setAttribute('cid', lastCid);
    this._links.setAttribute('lastcid', lastCid);
  }

}
customElements.define('ipmb-app', App);
