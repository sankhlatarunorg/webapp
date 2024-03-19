#!/bin/bash
sudo yum update
sudo dnf install mysql-server
# sudo yum -y install @mysql
# sudo systemctl start mysqld.service
# sudo systemctl enable mysqld
# mysql -u root -p'' -e "CREATE DATABASE user;"
sudo yum install -y nodejs gcc-c++ make
sudo dnf module -y reset nodejs
sudo dnf module -y  enable nodejs:16
sudo yum install -y nodejs 
sudo dnf install -y git
sudo yum -y install zip unzip
cd ..
cd /opt/webapp
sudo unzip webapp.zip
ls
sudo npm install -y
ls
sudo chown -R csye6225:csye6225 ./
sudo mkdir /var/log/webapp
cd /var/log/webapp
sudo touch myapp.log
ls -l /var/log/webapp/myapp.log
sudo chown -R csye6225:csye6225 /var/log/webapp/myapp.log
sudo chmod +w /var/log/webapp/myapp.log
ls -l /var/log/webapp/myapp.log
