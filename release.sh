#!/bin/sh
set -e
set -u
VERSION=$1
if [[ `git status --porcelain` ]]; then
  echo "There are local changes - aborting"
  exit 1
fi

BUILD_DIRECTORY=/tmp/tioxnet-release-builder
rm -r /tmp/tioxnet-release-builder
mkdir $BUILD_DIRECTORY
git clone --depth 1 . $BUILD_DIRECTORY
cd $BUILD_DIRECTORY
git branch $VERSION
npm install
npm run build -- --mode=production
git add .
git commit -m "Built release $VERSION"