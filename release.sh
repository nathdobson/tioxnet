#!/bin/sh
set -e
set -u

KIND=$1

if [[ "$KIND" == "patch" ]]; then
  BRANCH="v$(npm pkg get version | cut -d \" -f 2 | cut -d '.' -f 1-2)"
elif [[ "$KIND" == "minor" ]]; then
  VERSION=$(npm version minor)
  BRANCH=$(echo $VERSION | cut -d '.' -f 1-2)
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
  git clone -b $BRANCH file:///$ORIGIN $BUILD_DIRECTORY
  git checkout $BRANCH
  npm version patch
elif [[ "$KIND" == "minor" ]]; then
  git clone -b main file:///$ORIGIN $BUILD_DIRECTORY
  git checkout -b $BRANCH
fi
#./build.sh
echo $RANDOM > dist.txt
git add .
git commit -m "Built release $VERSION"
git tag -a release-$VERSION -m "Releasing $VERSION"
git push --set-upstream origin $BRANCH