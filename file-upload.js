class FileUpload extends HTMLElement {
  constructor(){
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._root.innerHTML = `
      <form enctype="multipart/form-data">
        <input type="file" name="file" />
        <button type="submit">Upload</button>
      </form>
    `
  }

  connectedCallback() {
    this._root.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      console.log('uploading file');
      let file = this._root.querySelector('input[type=file]').files[0];
      if (!!file) {
        this.dispatchEvent(new CustomEvent('onSubmit', { detail: {file} }));
      };
    });
  }

}
customElements.define('file-upload', FileUpload);
