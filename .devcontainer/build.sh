#!/bin/bash
# This is a script used by the devcontainer to build the project

# install dependencies
yarn install

# Build Server Dependencies
yarn nexio @nexio/server-native build
yarn nexio @nexio/reader build

# Create database
yarn nexio @nexio/server prisma migrate reset -f
