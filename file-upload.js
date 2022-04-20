class FileUpload extends HTMLElement {
  constructor(){
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._root.innerHTML = `
      <link href="index.css" rel="stylesheet">
      <style>
        .button {
          position: relative;
        }
        input[type='file'] {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }
      </style>
      <form enctype="multipart/form-data">
        <span class="button">
          Insert image
          <input type="file" name="file" />
        </span>
      </form>
    `
  }

  connectedCallback() {
    this._root.querySelector('input[type=file]').addEventListener('change', e => {
      e.preventDefault();
      console.log('uploading file');
      let file = this._root.querySelector('input[type=file]').files[0];
      if (!!file) {
        this.dispatchEvent(new CustomEvent('onFileSelected', { detail: {file} }));
      };
    });
  }

}
customElements.define('file-upload', FileUpload);
