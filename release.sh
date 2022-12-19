#!/bin/sh
set -e
set -u
VERSION=$1
if [[ `git status --porcelain` ]]; then
  echo "There are local changes - aborting"
  exit 1
fi
if git rev-parse --verify $VERSION > /dev/null; then
  echo "The new branch already exists."
  exit 1
fi

BUILD_DIRECTORY=/tmp/tioxnet-release-builder
rm -rf /tmp/tioxnet-release-builder
mkdir $BUILD_DIRECTORY
git clone --depth 1 file:///$PWD $BUILD_DIRECTORY
cd $BUILD_DIRECTORY
git branch $VERSION
./build.sh
echo $VERSION > ./version.txt
git add .
git commit -m "Built release $VERSION"