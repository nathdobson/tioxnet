#!/bin/sh
set -e
set -u

KIND=$1

if [[ "$KIND" == "patch" ]]; then

elif [[ "$KIND" == "minor" ]]; then

else
  echo "Unknown kind $KIND"
  exit 1
fi

SRC_BRANCH=$(git rev-parse --abbrev-ref HEAD)

BUILD_DIRECTORY=/tmp/tioxnet-release-builder
rm -rf /tmp/tioxnet-release-builder
mkdir $BUILD_DIRECTORY
ORIGIN=$PWD
cd $BUILD_DIRECTORY
git clone -b $SRC_BRANCH file:///$ORIGIN $BUILD_DIRECTORY
if [[ "$KIND" == "patch" ]]; then
  git checkout $BRANCH
  VERSION=$(npm version --no-git-tag-version patch)
elif [[ "$KIND" == "minor" ]]; then
  git clone -b main file:///$ORIGIN $BUILD_DIRECTORY
  git checkout -b $BRANCH
  VERSION=$(npm version --no-git-tag-version  minor)
fi
BRANCH=$(echo $VERSION | cut -d '.' -f 1-2)

#./build.sh
echo $RANDOM > dist.txt
git add .
git commit -m "Built release $VERSION"
git tag -a release-$VERSION -m "Releasing $VERSION"
#git push --set-upstream origin $BRANCH