#!/bin/bash
IPFS_NODE="http://192.168.1.60:5001"
for f in `ls`
do
    echo Adding $f
    curl -X POST -F file=@$f "$IPFS_NODE/api/v0/files/write?arg=/ipmb/$f&create=true"        
done
FOLDER_HASH=`curl -s -X POST "http://192.168.1.60:5001/api/v0/files/stat?arg=/ipmb" | jq -r .Hash`

echo Publishing /ipmb with key: $FOLDER_HASH
IPNS_NAME = `curl -s -X POST "$IPFS_NODE/api/v0/name/publish?arg=$FOLDER_HASH" | jq -r .Name`

echo View site at ipns://$IPNS_NAME
