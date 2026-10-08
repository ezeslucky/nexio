#!/bin/bash
# This is a script used by the devcontainer to build the project

# install dependencies
yarn install

# Build Server Dependencies
yarn affine @nexio/server-native build

# Create database
yarn affine @nexio/server prisma migrate reset -f
