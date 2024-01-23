#!/bin/bash

[ -z "$1" ] && [ -z "$2" ] && echo "Usage: release.sh [release-version] [next-version]" && exit 1

RELEASE_VERSION=$1
NEXT_VERSION=$2

# Set NPM version.
# We must delete and retag because NPM is too opinionated about the tag name.
npm version $RELEASE_VERSION
git tag -d v$RELEASE_VERSION
git tag -a $RELEASE_VERSION -m "Release $RELEASE_VERSION."
git push --tags
git push origin

# Update dist repo.
git clone git@bitbucket.org:atlassian/aui-dist .dist
rm -rf .dist/*
rm -rf .dist/.gitignore
grunt build
cp -rf dist/* .dist/
cd .dist
git add .
git commit -am "Release $RELEASE_VERSION."
git tag -a $RELEASE_VERSION -m "$RELEASE_VERSION"
git push --tags
git push origin
cd ..
rm -rf .dist

# Bumps the version in all modules and pushes.
npm version $NEXT_VERSION
git tag -d v$NEXT_VERSION
git commit -am "Bump dev version $NEXT_VERSION."
git push origin
