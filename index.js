/* global HTMLElement, File, customElements */
import { postAdd, postUpdate, removeFile, mediaAdd } from './lib.js'

class App extends HTMLElement {
  constructor () {
    super()

    this.innerHTML = `
      <link href="index.css" rel="stylesheet">
      <style>
        .container { 
          display: flex;
          flex-direction: column;
        }
        .dialog { 
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background-color: white;
          padding: 1rem;
          box-sizing: border-box;
        }
        #create-post-button { margin-bottom: 1rem };
      </style>
      <div class="container">
        <div id="create-post-dialog" class="hidden dialog">
          <h1>Create a new post</h1>
          <a class="close-dialog button" role="button" href="#">&lt;&lt; back</a>
          <post-form></post-form>
        </div>
  
        <post-list></post-list>
        <button id="create-post-button">Create new post</button>
  
        <blog-links></blog-links>
      </div>
    `
    this._links = this.querySelector('blog-links')
    this._postList = this.querySelector('post-list')
    this._postList.setAttribute('cid', window.localStorage.lastCid)
    this._postFormDialog = this.querySelector('#create-post-dialog')
    this._postForm = this.querySelector('post-form')
    if (window.localStorage.ipns) {
      this._links.setAttribute('ipns', window.localStorage.ipns)
    }
    if (window.localStorage.lastCid) {
      this._links.setAttribute('lastCid', window.localStorage.lastCid)
    }
  }

  connectedCallback () {
    this._postForm.addEventListener('onSubmit', this.onPostAdd.bind(this))
    this._postForm.addEventListener('onFileUpload', this.onFileUpload.bind(this))
    this._postList.addEventListener('onRemove', this.onPostRemove.bind(this))

    this._postList.addEventListener('onPostEdit', e => {
      const { filename, content } = e.detail
      this._postForm.reset()
      this._postForm.setAttribute('filename', filename)
      this._postForm.setAttribute('content', content)
      this._postFormDialog.classList.remove('hidden')
    })

    const createPostButton = this.querySelector('#create-post-button')
    createPostButton.addEventListener('click', e => {
      this._postForm.reset()
      this._postForm.removeAttribute('filename')
      this._postForm.removeAttribute('content')
      this._postFormDialog.classList.remove('hidden')
    })

    this.querySelector('.close-dialog').addEventListener('click', e => {
      this._postFormDialog.classList.add('hidden')
    })
  }

  async onPostAdd (e) {
    const { originalFilename, filename, content } = e.detail
    console.log(`submitForm ${originalFilename} ${filename} ${content}`)
    const file = new File([content], filename, {
      type: 'text/plain'
    })
    let lastCid
    if (originalFilename) {
      lastCid = await postUpdate(file, filename, originalFilename)
    } else {
      lastCid = await postAdd(file, filename)
    }
    this._postList.setAttribute('cid', lastCid)
    this._links.setAttribute('lastcid', lastCid)
    this._postFormDialog.classList.add('hidden')
    this._postForm.reset()
    this._postForm.removeAttribute('filename')
    this._postForm.removeAttribute('content')
    console.log(`lastCid = ${lastCid}`)
  }

  async onPostRemove (e) {
    const { filename } = e.detail
    const lastCid = await removeFile(filename)
    this._postList.setAttribute('cid', lastCid)
    this._links.setAttribute('lastcid', lastCid)
  }

  async onFileUpload (e) {
    const { file } = e.detail
    console.log(`onFileUpload file.name=${file.name}`)
    const lastCid = await mediaAdd(file)
    if (file.type.startsWith('image/')) {
      this._postForm.appendText(`![${file.name}](/media/${file.name})`)
    } else {
      this._postForm.appendText(`[${file.name}](/media/${file.name})`)
    }
    this._postList.setAttribute('cid', lastCid)
    this._links.setAttribute('lastcid', lastCid)
  }
}
customElements.define('ipmb-app', App)
