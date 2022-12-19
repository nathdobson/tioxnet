#!/bin/sh
set -e
set -u
MAJOR=$1
MINOR=$2
PATCH=$3
BRANCH=v$MAJOR.$MINOR
TAG=v$MAJOR.$MINOR.$PATCH
echo "Creating branch $BRANCH with tag $TAG"
#if [[ `git status --porcelain` ]]; then
#  echo "There are local changes - aborting"
#  exit 1
#fi
#if git rev-parse --verify $BRANCH > /dev/null ; then
#  echo "The new branch already exists."
#  exit 1
#fi

if [ $(git tag -l $TAG) ] ; then
  echo "The new tag already exists."
  exit 1
fi

BUILD_DIRECTORY=/tmp/tioxnet-release-builder
rm -rf /tmp/tioxnet-release-builder
mkdir $BUILD_DIRECTORY
git clone file:///$PWD $BUILD_DIRECTORY
cd $BUILD_DIRECTORY
git checkout -b $BRANCH
#./build.sh
echo $TAG > ./version.txt
git add .
git commit -m "Built release $TAG"
git tag -a $TAG -m "Releasing $TAG"
git push --set-upstream origin $BRANCH