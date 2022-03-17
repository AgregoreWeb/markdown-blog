import {addFile} from './lib.js';

class App extends HTMLElement {
  constructor(){
    super();

    let blogLink = document.createElement('div');
    blogLink.id = 'blogLink';
    let ipnsA = document.createElement('a');
    blogLink.appendChild(ipnsA);

    let latestLink = document.createElement('div');
    latestLink.id = 'latestLink';
    let latestLinkA = document.createElement('a');
    latestLink.appendChild(latestLinkA);

    this._root = this.attachShadow({mode: 'open'})
    this._createPost = document.createElement('create-post');
    this._postList = document.createElement('post-list');
    this._postList.setAttribute('cid', window.localStorage.lastCid);

    this._startOver = document.createElement('button');
    this._startOver.text = 'START OVER';
    this._root.appendChild(this._createPost);
    this._root.appendChild(this._postList);
    this._root.appendChild(blogLink);
    this._root.appendChild(latestLink);
    this._root.appendChild(this._startOver);
  }

  _render(){
    if (window.localStorage.ipns){
      let ipns = window.localStorage.ipns;
      const url = `${ipns}/index.md`;
      this._root.querySelector('#blogLink a').text = url;
      this._root.querySelector('#blogLink a').href = url;
    }
      
    if (window.localStorage.lastCid){
      let lastCid = window.localStorage.lastCid;
      this._root.querySelector('#latestLink a').text = `ipfs://${lastCid}/index.md`;
      this._root.querySelector('#latestLink a').href = `ipfs://${lastCid}/index.md`;
    }
  }

  async connectedCallback(){
    console.log('beep');
    let lastCid = window.localStorage.getItem('lastCid');
    console.log(`lastCid = ${lastCid}`);
    //document.querySelector('#fileForm').onsubmit = submitForm;
    this._createPost.addEventListener('onSubmit', this.submitForm.bind(this));
    this._render();
  }

  async submitForm(e){
    const {filename, content} = e.detail;
    console.log(`submitForm ${filename} ${content}`);
    var file = new File([content], filename, {
      type: "text/plain",
    });
    let lastCid = await addFile(file, filename)
    this._postList.setAttribute('cid', lastCid);
    this._root.querySelector('#latestLink a').text = `ipfs://${lastCid}/index.md`;
    this._root.querySelector('#latestLink a').href = `ipfs://${lastCid}/index.md`;

    console.log(`lastCid = ${lastCid}`);
  }

}
customElements.define('ipmb-app', App);


