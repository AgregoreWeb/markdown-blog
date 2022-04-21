// TODO
// - decide where to update window.localstorage.{lastCid,ipns,lastPublishedCid}
// - make function names consistent nounVerb or verbNoun

export async function publish (cid) {
  const r = await fetch('ipns://ipmb', {
    method: 'POST',
    body: cid
  });
  const ipns = await r.text();
  const updateHtml = !window.localStorage.ipns;
  window.localStorage.ipns = ipns;
  window.localStorage.lastPublishedCid = cid;
  return ipns;
}

export function parseFilename (filename) {
  const date = filename.slice(0, 10);
  const title = decodeURIComponent(filename.slice(11)).replace(/\.md$/, '');
  return { date, title };
}

export function filenameToTitle (filename) {
  return decodeURIComponent(filename.slice(11)).replace(/\.md$/, '');
}

function parseMeta (file) {
  return {
    ...file,
    title: filenameToTitle(file.filename),
    date: file.filename.slice(0, 10),
    excerpt: file.content.slice(0, Math.min(file.content.indexOf('\n'), 100))
  };
}

// Create markdown blog based on data stored in lastCid
export async function createBlogIndex (contentUpdateFunction) {
  let lastCid = window.localStorage.lastCid;
  const previousCid = lastCid;

  // make the update
  lastCid = await contentUpdateFunction();

  // get content and update index
  const files = await _fetchPosts(lastCid);
  let indexBody = '';
  for (const post of files) {
    // this should probably be a relative link
    indexBody += `- **[${post.title}](/ipmb-db/${post.filename})** (posted ${post.date}) - ${post.excerpt}\n`;
  }
  if (previousCid && previousCid != '') {
    indexBody += `\n[previous version of this blog](ipfs://${previousCid}/index.md)`;
  }

  // delete old index.md
  let url = `ipfs://${lastCid}/index.md`;
  let response = await fetch(url, {
    method: 'DELETE',
    mode: 'cors'
  });
  if (response.status == 200) {
    const contentUrl = await response.text();
    lastCid = new URL(contentUrl).host;
  }

  // write index.md
  url = `ipfs://${lastCid}/index.md`;
  response = await fetch(url, {
    method: 'POST',
    body: indexBody,
    mode: 'cors'
  });
  const contentUrl = await response.text();
  lastCid = new URL(contentUrl).host;

  window.localStorage.lastCid = lastCid;
  console.log(contentUrl);

  return lastCid;
}

export async function removeFile (filename) {
  let lastCid = window.localStorage.lastCid;

  const _removeFile = async () => {
    const EMPTY_DIRECTORY_CID = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354';
    const url = `ipfs://${lastCid || EMPTY_DIRECTORY_CID}/ipmb-db/${filename}`;
    console.log(`DELETING ${url}`);
    const response = await fetch(url, {
      method: 'DELETE',
      mode: 'cors'
    });
    const contentUrl = await response.text();
    const newCid = new URL(contentUrl).host;
    return newCid;
  };

  lastCid = await createBlogIndex(_removeFile);
  return lastCid;
}

// Adds a post and regenerates the index
export async function postAdd (file, filename) {
  let lastCid = window.localStorage.lastCid;

  const _addFile = async () => {
    const EMPTY_DIRECTORY_CID = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354';
    const url = `ipfs://${lastCid || EMPTY_DIRECTORY_CID}/ipmb-db/${filename}`;
    console.log(`ADDING ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      body: file,
      mode: 'cors'
    });
    const contentUrl = await response.text();
    return new URL(contentUrl).host;
  };

  lastCid = await createBlogIndex(_addFile);
  return lastCid;
}

export async function postUpdate (file, filename, originalFilename) {
  let lastCid = window.localStorage.lastCid;

  const _removeFile = async cid => {
    const url = `ipfs://${cid}/ipmb-db/${originalFilename}`;
    console.log(`DELETING ${url}`);
    const response = await fetch(url, {
      method: 'DELETE',
      mode: 'cors'
    });
    const contentUrl = await response.text();
    const newCid = new URL(contentUrl).host;
    return newCid;
  };

  const _addFile = async cid => {
    const url = `ipfs://${cid}/ipmb-db/${filename}`;
    console.log(`ADDING ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      body: file,
      mode: 'cors'
    });
    const contentUrl = await response.text();
    return new URL(contentUrl).host;
  };

  const _chain = async () => {
    const cid = await _removeFile(lastCid);
    return await _addFile(cid);
  };

  lastCid = await createBlogIndex(_chain);
  return lastCid;
}

// Add media
export async function mediaAdd (file) {
  const lastCid = window.localStorage.lastCid;
  const url = `ipfs://${lastCid || ''}/media/${file.name}`;
  console.log(`ADDING ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    body: file,
    mode: 'cors'
  });
  const contentUrl = await response.text();
  window.localStorage.lastCid = new URL(contentUrl).host;
  return window.localStorage.lastCid;
}

async function _fetchPosts (cid) {
  const request = await fetch(`ipfs://${cid}/ipmb-db/?noResolve`);
  let dirList = await request.json();
  dirList = dirList.filter(e => !!e); // empty dir returns `[ null ]`

  const files = await Promise.all(dirList.map(async filename => {
    const fileRequest = await fetch(`ipfs://${cid}/ipmb-db/${filename}`);
    const content = await fileRequest.text();
    return parseMeta({
      filename,
      content,
      link: `ipfs://${cid}/ipmb-db/${filename}`
    });
  }));

  return files;
}

export async function loadContent () {
  const lastCid = window.localStorage.lastCid;
  if (!lastCid || lastCid == '') {
    return [];
  }

  const files = await _fetchPosts(lastCid);
  return files;
}
