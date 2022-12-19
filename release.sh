#!/bin/sh
set -e
set -u

KIND=$1

if [[ "$KIND" == "patch" ]]; then
  echo "Doing patch update."
elif [[ "$KIND" == "minor" ]]; then
  echo "Doing minor update."
else
  echo "Unknown kind $KIND"
  exit 1
fi

VERSION=$(npm version $KIND)
BRANCH=$(echo $VERSION | cut -d '.' -f 1-2)
#SRC_BRANCH=$(git rev-parse --abbrev-ref HEAD)

#BRANCH=v$MAJOR.$MINOR
#TAG=v$MAJOR.$MINOR.$PATCH
#echo "Creating branch $BRANCH with tag $TAG"
#if [[ `git status --porcelain` ]]; then
#  echo "There are local changes - aborting"
#  exit 1
#fi



#if git rev-parse --verify $BRANCH > /dev/null ; then
#  SRC_BRANCH=$BRANCH
#  CHECKOUT="git checkout $BRANCH"
#else
#  CHECKOUT="git checkout -b $BRANCH"
#fi

#if [ $(git tag -l $TAG) ] ; then
#  echo "The new tag already exists."
#  exit 1
#fi

BUILD_DIRECTORY=/tmp/tioxnet-release-builder
rm -rf /tmp/tioxnet-release-builder
mkdir $BUILD_DIRECTORY
ORIGIN=$PWD
cd $BUILD_DIRECTORY
if [[ "$KIND" == "patch" ]]; then
  git clone -b $BRANCH file:///$ORIGIN $BUILD_DIRECTORY
  git checkout $BRANCH
elif [[ "$KIND" == "minor" ]]; then
  git clone -b main file:///$ORIGIN $BUILD_DIRECTORY
  git checkout -b $BRANCH
fi
#./build.sh
echo $RANDOM > dist.txt
git add .
git commit -m "Built release $VERSION"
git tag -a $VERSION -m "Releasing $VERSION"
git push --set-upstream origin $BRANCH
git push --set-upstream origin $VERSION