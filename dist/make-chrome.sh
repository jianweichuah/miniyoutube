#!/usr/bin/env bash
#
# This script assumes a linux environment

echo "*** MiniYouTube Chrome: Creating web store package"
echo "*** MiniYouTube Chrome: Copying files"

DES=dist/build/chrome
rm -rf $DES
mkdir -p $DES

cp manifest_chrome.json     $DES/manifest.json

cp -R images    $DES/
cp *.html       $DES/
cp *.js         $DES/
cp *.css        $DES/
cp *.png        $DES/
cp LICENSE.md   $DES/

echo "*** MiniYouTube Chrome: Package done."
