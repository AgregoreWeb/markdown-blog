class FileUpload extends HTMLElement {
  constructor () {
    super();
    this.innerHTML = `
      <style>
        .fileButton {
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
        <span class="button fileButton">
          Insert image
          <input type="file" name="file" />
        </span>
      </form>
    `;
  }

  connectedCallback () {
    this.querySelector('input[type=file]').addEventListener('change', e => {
      e.preventDefault();
      console.log('uploading file');
      const file = this.querySelector('input[type=file]').files[0];
      if (file) {
        this.dispatchEvent(new CustomEvent('onFileSelected', { detail: { file } }));
      }
    });
  }
}
customElements.define('file-upload', FileUpload);
