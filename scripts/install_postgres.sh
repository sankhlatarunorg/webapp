#!/bin/bash
sudo dnf module list postgresql
sudo dnf -y module enable postgresql:16
sudo dnf -y install postgresql-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo yum install -y nodejs gcc-c++ make
sudo dnf module -y reset nodejs
sudo dnf module -y  enable nodejs:16
sudo yum install -y nodejs 
sudo dnf install -y git
sudo yum -y install zip unzip
cd ..
cd /tmp/webapp
sudo unzip webapp.zip
cd webapp
ls
sudo npm install -y
ls
sudo chown -R csye6225:csye6225 ./
