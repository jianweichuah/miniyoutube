#!/usr/bin/env bash
#
# This script assumes a linux environment

echo "*** MiniYouTube Edge: Creating web store package"
echo "*** MiniYouTube Edge: Copying files"

DES=dist/build/edge
rm -rf $DES
mkdir -p $DES

cp manifest_edge.json     $DES/manifest.json

cp -R images    $DES/
cp *.html       $DES/
cp *.js         $DES/
cp *.css        $DES/
cp LICENSE.md   $DES/

echo "*** MiniYouTube Edge: Package done."
