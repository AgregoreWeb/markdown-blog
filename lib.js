export async function publish(cid){
  let r = await fetch('ipns://ipmb', {method: 'POST', body: cid});
  const ipns = await r.text();
  const updateHtml = !window.localStorage.ipns;
  window.localStorage.ipns = ipns;
  if (updateHtml){
    let blogLink = document.querySelector('#blogLink');
    blogLink.innerHTML = `<a href="${ipns}">${ipns}</a>`;
  }
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
  let files = await _fetchRecursive(lastCid);
  let indexBody = '';
  for (let post of files){
    indexBody = indexBody.concat(`- [${post.filename}](${post.link})\n`)
  }

  if (previousCid && previousCid != ''){
    // save previous version
    //url = `ipfs://${lastCid}/prev`;
    //response = await fetch(url, {
    //  method: 'POST',
    //  body: previousCid,
    //  mode: 'cors'
    //});
    //contentUrl = await response.text()
    //lastCid = new URL(contentUrl).host;
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

// this is a workaround the current incorrect behavior where js-ipfs-fetch nests folders when adding a file to a folder
async function _fetchRecursive(cid){
  // list files in dir
  let r = await fetch(`ipfs://${cid}/ipmb-db/`);
  let d = await r.json();

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

  // read nested dir
  //let dr = await fetch(`ipfs://${cid}/`);
  //let dd = await dr.json();
  //let nestedDirs = dd.filter( dirname => dirname != 'ipmb-db/' );
  //if (nestedDirs.length == 1){
  //  let newCid = nestedDirs[0].split('/')[0];
  //  let files = await _fetchRecursive(newCid);
  //  return [ ...files, { filename, content, link: `ipfs://${cid}/ipmb-db/${filename}` } ];
  //} else {
  //  return [ { filename, content, link: `ipfs://${cid}/ipmb-db/${filename}` } ]
  //}
}


export async function loadContent(){
  let lastCid = window.localStorage.getItem('lastCid');
  if (!lastCid || lastCid == ''){
    return [];
  };

  let files = _fetchRecursive(lastCid);
  console.log(files);
  return files;
}

