#!/bin/bash
IPFS_NODE="http://localhost:5001"

echo Creating folder
curl -X POST "$IPFS_NODE/api/v0/files/rm?arg=/ipmb&recursive=true"
curl -X POST "$IPFS_NODE/api/v0/files/mkdir?arg=/ipmb"

for f in `ls`
do
    echo Adding $f
    curl -X POST -F file=@$f "$IPFS_NODE/api/v0/files/write?arg=/ipmb/$f&create=true"        
done
FOLDER_HASH=`curl -s -X POST "$IPFS_NODE/api/v0/files/stat?arg=/ipmb" | jq -r .Hash`

V1_HASH=`curl -s -X POST "$IPFS_NODE/api/v0/cid/format?arg=$FOLDER_HASH&v=1&b=base32" | jq -r .Formatted`

echo ipfs://$V1_HASH

echo Publishing /ipmb with key: $FOLDER_HASH
IPNS_NAME=`curl -s -X POST "$IPFS_NODE/api/v0/name/publish?arg=$FOLDER_HASH" | jq -r .Name`

echo View site at ipns://$IPNS_NAME
