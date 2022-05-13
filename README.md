# markdown-blog
A minimal blogging platform using IPFS Protocol Handlers and Markdown

**IN PROGRESS**

## Plans

- Use Custom Elements
- Save posts to IPNS domain using Agregore
- Use markdown renderer extension for viewing rendered content

## Data model

- Markdown based
- `index.md` file for listing your "front page", auto-generated
- Post stored in folders ordered by date, e.g. `/posts/YEAR/MONTH/YEAR-MONTH-DAY-HH-MM.md`

## Screens

### Markdown Editor

- Take path for filename in the url `searchParams`
- Use existing text editor?
	- Alternately use `contenteditable: true` or a TextArea
	- Syntax highlighting?
	- Buttons for formatting?
- Save button
- Preview?
- File upload
	- File input (limit file types?)
	- Progress indicator for upload
	- Uploads to `/media` folder
	- Injects a link to the file at the end of the document

### Post list

- List of links to posts, with `🗑` icons for deleting them
- Can click a post to open it in the editor (also have a view button?)
- "new post" (compose?) to open editor with a new filename

### Generated homepage

- List of posts sorted by most recently published
- Post shows:
  - title (taken from first heading)
  - date (taken from file name)
  - first paragraph (cropped with a max-length)


## To use:

- start agregore browser locally
- run `./push.sh`
- go to ipns URL

## Development

- Edit files
- run `./push.sh`

See site at IPNS address printed by push
