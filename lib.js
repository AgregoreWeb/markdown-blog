export async function publish(cid){
  let r = await fetch('ipns://ipmb', {method: 'POST', body: cid});
  const ipns = await r.text();
  const updateHtml = !window.localStorage.ipns;
  window.localStorage.ipns = ipns;
  window.localStorage.lastPublishedCid = cid;
  return ipns;
}

export async function thisIsBlog(doFileStuff){

  let lastCid = window.localStorage.getItem('lastCid');
  const previousCid = lastCid;
 
  // make the update
  lastCid = await doFileStuff();

  // get content and update index
  let files = await _fetchFolder(lastCid);
  let indexBody = '';
  for (let post of files){
    indexBody = indexBody.concat(`- [${post.filename}](${post.link})\n`)
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

export async function addFile(file, filename){
  // # add file to a folder - need CID of current folder, if none, doesn't matter?
  // Current CID of folder?
  // NEW_CID = post to /ipfs/CID/path/file
  // update ipns

  let lastCid = window.localStorage.getItem('lastCid');
  const previousCid = lastCid;
  let url = `ipfs://${lastCid?lastCid:''}/ipmb-db/${filename}`

  let response = await fetch(url, {
    method: 'POST',
    body: file,
    mode: 'cors'
  });

  let contentUrl = await response.text()
  lastCid = new URL(contentUrl).host;


  // get content and update index
  let files = await _fetchFolder(lastCid);
  let indexBody = '';
  for (let post of files){
    indexBody = indexBody.concat(`- [${post.filename}](${post.link})\n`)
  }

  if (previousCid && previousCid != ''){
    indexBody = indexBody.concat(`\n[previous version of this blog](ipfs://${previousCid}/index.md)`)
  }
  
  url = `ipfs://${lastCid}/index.md`;
  response = await fetch(url, {
    method: 'POST',
    body: indexBody,
    mode: 'cors'
  });
  contentUrl = await response.text()
  lastCid = new URL(contentUrl).host;

  window.localStorage.lastCid = lastCid;
  console.log(contentUrl);

  // update IPNS (TODO do this async)
  // publish(lastCid)

  return lastCid;
}

async function _fetchFolder(cid){
  // list files in dir
  let r = await fetch(`ipfs://${cid}/ipmb-db/`);
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

  let files = _fetchFolder(lastCid);
  console.log(files);
  return files;
}

