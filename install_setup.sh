#!/bin/bash

sudo apt-get update
sudo apt-get install -y nodejs npm
sudo apt-get install -y postgresql postgresql-contrib
sudo service postgresql start
psql --version
node -v
npm -v
