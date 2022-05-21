/* global HTMLElement, CustomEvent, customElements */
class FileUpload extends HTMLElement {
  constructor () {
    super()
    this.innerHTML = `
      <style>
        input[type='file'] {
          display: none;
        }
      </style>
      <form enctype="multipart/form-data">
        <label for="fileSelect" class="button">
          Insert image
        </label>
        <input id="fileSelect" type="file" name="file" />
      </form>
    `
  }

  connectedCallback () {
    this.querySelector('input[type=file]').addEventListener('change', e => {
      e.preventDefault()
      console.log('uploading file')
      const file = this.querySelector('input[type=file]').files[0]
      if (file) {
        this.dispatchEvent(new CustomEvent('onFileSelected', { detail: { file } }))
      }
    })
  }
}
customElements.define('file-upload', FileUpload)
