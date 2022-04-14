// TODO
// - decide where to update window.localstorage.{lastCid,ipns,lastPublishedCid}
// - make function names consistent nounVerb or verbNoun


export async function publish(cid){
  let r = await fetch('ipns://ipmb', {
    method: 'POST', 
    body: cid,
  });
  const ipns = await r.text();
  const updateHtml = !window.localStorage.ipns;
  window.localStorage.ipns = ipns;
  window.localStorage.lastPublishedCid = cid;
  return ipns;
}

function parseMeta(file){
  return {
    ...file,
    title: decodeURIComponent(file.filename.slice(11)).replace(/\.md$/, ''),
    date: file.filename.slice(0, 10),
    excerpt: file.content.slice(0, Math.min(file.content.indexOf('\n'), 100)),
  }
}


// Create markdown blog based on data stored in lastCid
export async function thisIsBlog(doFileStuff){

  let lastCid = window.localStorage.getItem('lastCid');
  const previousCid = lastCid;
 
  // make the update
  lastCid = await doFileStuff();

  // get content and update index
  let files = await _fetchFolder(lastCid);
  files = files.map(parseMeta);
  let indexBody = '';
  for (let post of files){
    // this should probably be a relative link
    indexBody = indexBody.concat(`- **[${post.title}](/ipmb-db/${post.filename})** (posted ${post.date}) - ${post.excerpt}\n`)
  }
  if (previousCid && previousCid != ''){
    indexBody = indexBody.concat(`\n[previous version of this blog](ipfs://${previousCid}/index.md)`)
  }

  // delete old index.md
  let url = `ipfs://${lastCid}/index.md`;
  let response = await fetch(url, {
    method: 'DELETE',
      mode: 'cors'
  });
  let contentUrl = await response.text()
  let newCid = new URL(contentUrl).host;

  // write index.md
  url = `ipfs://${newCid}/index.md`;
  response = await fetch(url, {
    method: 'POST',
    body: indexBody,
    mode: 'cors'
  });
  contentUrl = await response.text()
  lastCid = new URL(contentUrl).host;

  window.localStorage.lastCid = lastCid;
  console.log(contentUrl);

  return lastCid;

}

export async function removeFile(filename){

  let lastCid = window.localStorage.getItem('lastCid');

  const _removeFile = async ( ) => {
    let url = `ipfs://${lastCid?lastCid:''}/ipmb-db/${filename}`
    console.log(`DELETING ${url}`);
    let response = await fetch(url, {
      method: 'DELETE',
      mode: 'cors'
    });
    let contentUrl = await response.text()
    let newCid = new URL(contentUrl).host;
    return newCid;
  }

  lastCid = await thisIsBlog(_removeFile);
  return lastCid;

}

// Adds a post and regenerates the index
export async function postAdd(file, filename){

  let lastCid = window.localStorage.getItem('lastCid');

  const _addFile = async () => {
    let url = `ipfs://${lastCid?lastCid:''}/ipmb-db/${filename}`
    console.log(`ADDING ${url}`);
    let response = await fetch(url, {
      method: 'POST',
      body: file,
      mode: 'cors'
    });
    let contentUrl = await response.text()
    return new URL(contentUrl).host;
  }

  lastCid = await thisIsBlog(_addFile);
  return lastCid;
}

// Add media
export async function mediaAdd(file){
  let lastCid = window.localStorage.getItem('lastCid');
  let url = `ipfs://${lastCid?lastCid:''}/media/${file.name}`
  console.log(`ADDING ${url}`);
  let response = await fetch(url, {
    method: 'POST',
    body: file,
    mode: 'cors'
  });
  let contentUrl = await response.text()
  window.localStorage.lastCid = new URL(contentUrl).host;
  return window.localStorage.lastCid;
}

// list files in dir
// TODO remove hard-coded /ipmb-db and pass as parameter
async function _fetchFolder(cid){
  let r = await fetch(`ipfs://${cid}/ipmb-db/`, {
    headers: {
      'X-Resolve': 'none',
    }
  });
  let d = await r.json();
  d = d.filter( e => !!e); // empty dir returns `[ null ]`

  let files = [];
  for (let filename of d){
    let fileRequest = await fetch(`ipfs://${cid}/ipmb-db/${filename}`);
    let content = await fileRequest.text();
    files.push({
      filename, 
      content,
      link: `ipfs://${cid}/ipmb-db/${filename}`,
    });
  }
  return files;
}


export async function loadContent(){
  let lastCid = window.localStorage.getItem('lastCid');
  if (!lastCid || lastCid == ''){
    return [];
  };

  let files = await _fetchFolder(lastCid);
  files = files.map(parseMeta);
  console.log(files);
  return files;
}
