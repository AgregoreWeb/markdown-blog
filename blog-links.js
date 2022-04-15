import {publish} from './lib.js';

const template = document.createElement('template');
template.innerHTML = `
  <div id="blogLink">
    <a></a>
  </div>
  <div id="latestLink">
    <a></a>
  </div>
  <button>Publish to IPNS</button>
`;

class Links extends HTMLElement {
  constructor(){
    super();
    this._root = this.attachShadow({mode: 'open'});
    this._root.innerHTML = `
      <style>
        a {
          overflow-wrap: anywhere;
        }
      </style>
    `;
    let node = template.content.cloneNode(true);
    this._root.appendChild(node);
    this._publishButton = this._root.querySelector('button');
  }

  connectedCallback(){
    this._publishButton.addEventListener('click', this.onPublishClick.bind(this));
    this._render();
  }

  async onPublishClick(e){
    e.preventDefault();
    console.log('onPublishClick');
    let cidToPublish = window.localStorage.lastCid;
    let ipns = await publish(cidToPublish);
    this._render();
  }

  static get observedAttributes() { return ['ipns', 'lastcid']; }

  attributeChangedCallback(name, oldValue, newValue) {
    this._render();
  }

  _render(){
    console.log("blog-links._render");
    console.log(window.localStorage.lastCid);
    if (window.localStorage.ipns){
      let ipns = window.localStorage.ipns;
      const url = `${ipns}index.md`;
      this._root.querySelector('#blogLink a').text = url;
      this._root.querySelector('#blogLink a').href = url;
    }

    if (window.localStorage.lastCid){
      let lastCid = window.localStorage.lastCid;
      this._root.querySelector('#latestLink a').text = `ipfs://${lastCid}/index.md`;
      this._root.querySelector('#latestLink a').href = `ipfs://${lastCid}/index.md`;
    }

    if (!!window.localStorage.lastPublishedCid && window.localStorage.lastPublishedCid == window.localStorage.lastCid) {
      this._root.querySelector('button').setAttribute('disabled', '');
    } else {
      this._root.querySelector('button').removeAttribute('disabled');
    }
  }

}
customElements.define('blog-links', Links);


