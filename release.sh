#!/bin/sh
set -e
set -u

KIND=$1
MAJOR=$2

if [[ "$KIND" == "patch" ]]; then
  MINOR=$3
  echo "patch $MINOR"
elif [[ "$KIND" == "minor" ]]; then
  echo "minor"
else
  echo "Unknown kind $KIND"
  exit 1
fi

BUILD_DIRECTORY=/tmp/tioxnet-release-builder
rm -rf /tmp/tioxnet-release-builder
mkdir $BUILD_DIRECTORY
ORIGIN=$PWD
cd $BUILD_DIRECTORY
if [[ "$KIND" == "patch" ]]; then
  BRANCH="v$MAJOR.$MINOR"
  git clone -b $BRANCH file:///$ORIGIN $BUILD_DIRECTORY
  git checkout $BRANCH
  VERSION=$(npm version --no-git-tag-version patch)
elif [[ "$KIND" == "minor" ]]; then
  git clone -b main file:///$ORIGIN $BUILD_DIRECTORY
  VERSION=$(npm version --no-git-tag-version  minor)
  git add .
  git commit -m "Bumping version"
  BRANCH=$(echo $VERSION | cut -d '.' -f 1-2)
  git checkout -b $BRANCH
fi

./build.sh
git add .
git commit -m "Built release $VERSION"
git tag -a $VERSION -m "Releasing $VERSION"
git push --set-upstream origin $BRANCH
cd $ORIGIN
git push --all origin