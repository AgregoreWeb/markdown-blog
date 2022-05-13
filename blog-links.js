import { publish } from './lib.js';

const template = document.createElement('template');
template.innerHTML = `
  <div id="blogLinks">
    <button>Publish to IPNS</button>
    <p id="status"></p>
    <div id="ipnsLink"><a></a></div>
    <div id="latestLink"><a></a></div>
  </div>
`;

class Links extends HTMLElement {
  constructor () {
    super();
    this.innerHTML = `
      <style>
        #blogLinks a {
          overflow-wrap: anywhere;
        }
        #blogLinks {
          padding: 0.5em;
          background-color: lightgrey;
        }
      </style>
    `;
    const node = template.content.cloneNode(true);
    this.appendChild(node);
    this._publishButton = this.querySelector('button');
    this._status = this.querySelector('#status');
    this._ipnsLink = this.querySelector('#ipnsLink > a');
    this._latestLink = this.querySelector('#latestLink > a');
    this._ipnsInProgress = false;
  }

  connectedCallback () {
    this._publishButton.addEventListener('click', this.onPublishClick.bind(this));
    this._render();
  }

  async onPublishClick (e) {
    e.preventDefault();
    console.log('onPublishClick');
    this._ipnsInProgress = true;
    this._render();
    const cidToPublish = window.localStorage.lastCid;
    const ipns = await publish(cidToPublish).catch((err) => {
      console.log('publish(cid) failed');
      this._ipnsInProgress = false;
    });
    this._ipnsInProgress = false;
    this._render();
  }

  static get observedAttributes () { return ['ipns', 'lastcid']; }

  attributeChangedCallback (name, oldValue, newValue) {
    this._render();
  }

  _render () {
    const lastCid = window.localStorage.lastCid;
    const ipns = window.localStorage.ipns;
    const ipnsCid = window.localStorage.ipnsCid;

    if (!lastCid) {
      this.classList.add('hidden');
      return;
    } 

    this.classList.remove('hidden');
    if (!ipns){
      // publish your blog
      this._publishButton.textContent = 'Publish your blog';
      this._status.innerText = 'Your blog is not yet published';
      this._latestLink.text = `Preview latest changes`;
      this._latestLink.href = `ipfs://${lastCid}/index.md`;
    } else if (lastCid != ipnsCid) {
      // update your blog
      this._status.innerText = 'There are unpublished changes to your blog';
      // update
      this._publishButton.textContent = 'Publish latest changes';
      // last published version
      this._ipnsLink.text = 'View last published version';
      this._ipnsLink.href = `${ipns}index.md`;
      // latest changes
      this._latestLink.text = `Preview latest changes`;
      this._latestLink.href = `ipfs://${lastCid}/index.md`;
    } else if (lastCid == ipnsCid) {
      // view your blog
      this._status.innerText = 'You can share the link below with other users';
      this._publishButton.textContent = 'Publish latest changes';
      this._ipnsLink.text = 'View blog';
      this._ipnsLink.href = `${ipns}index.md`;
      this._latestLink.text = '';
      this._latestLink.href = '';
    }

    if (this._ipnsInProgress) {
      this._status.innerHTML = 'IPNS update in progress <div class="lds-dual-ring"></div>';
    }

    if (this._ipnsInProgress || ipnsCid == lastCid) {
      this._publishButton.setAttribute('disabled', '');
    } else {
      this._publishButton.removeAttribute('disabled');
    }
  }
}
customElements.define('blog-links', Links);
