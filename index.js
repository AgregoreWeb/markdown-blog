import {addFile, removeFile, publish} from './lib.js';

class App extends HTMLElement {
  constructor(){
    super();

    this._root = this.attachShadow({mode: 'open'})
    this._createPost = document.createElement('create-post');
    this._postList = document.createElement('post-list');
    this._postList.setAttribute('cid', window.localStorage.lastCid);
    this._links = document.createElement('blog-links')
    if (window.localStorage.ipns){
      this._links.setAttribute('ipns', window.localStorage.ipns)
    }
    if (window.localStorage.lastCid){
      this._links.setAttribute('lastCid', window.localStorage.lastCid);
    }

    //this._startOver = document.createElement('button');
    //this._startOver.text = 'START OVER';
    this._root.appendChild(this._postList);
    this._root.appendChild(this._links);
    this._root.appendChild(this._createPost);
    //this._root.appendChild(this._startOver);
  }

  connectedCallback(){
    console.log('beep');
    let lastCid = window.localStorage.getItem('lastCid');
    console.log(`lastCid = ${lastCid}`);
    this._createPost.addEventListener('onSubmit', this.submitForm.bind(this));
    this._postList.addEventListener('onRemove', this.onRemovePost.bind(this));
  }

  async submitForm(e){
    const {filename, content} = e.detail;
    console.log(`submitForm ${filename} ${content}`);
    var file = new File([content], filename, {
      type: "text/plain",
    });
    let lastCid = await addFile(file, filename)
    this._postList.setAttribute('cid', lastCid);
    this._links.setAttribute('lastCid', lastCid);
    console.log(`lastCid = ${lastCid}`);
  }

  async onRemovePost(e){
    const {filename} = e.detail;
    let lastCid = await removeFile(filename);
    this._postList.setAttribute('cid', lastCid);
    this._links.setAttribute('lastCid', lastCid);
  }

}
customElements.define('ipmb-app', App);
