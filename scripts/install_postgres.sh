#!/bin/bash
sudo dnf module list postgresql
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql.service
sudo systemctl status postgresql.service
pg_isready
sudo su - postgres -c "psql --echo-all -U postgres -d postgres --command \"ALTER USER postgres WITH PASSWORD 'password';\""
sudo systemctl restart postgresql
sudo yum install -y nodejs gcc-c++ make
sudo dnf module -y reset nodejs
sudo dnf module -y  enable nodejs:16
sudo yum install -y nodejs 
sudo dnf install -y git
sudo yum -y install zip unzip
cd ..
# sudo mv /var/lib/pgsql/data/pg_hba.conf /var/lib/pgsql/data/pg_hba.bak
# sudo cp -f /tmp/webapp/webapp/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf
cd /tmp/webapp
sudo unzip webapp.zip
cd webapp
ls
sudo npm install -y
ls
sudo cp -f /tmp/webapp/webapp/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf
sudo systemctl stop postgresql
sudo systemctl start postgresql  
sudo chown -R csye6225:csye6225 ./
# sudo postgresql-setup --initdb
# sudo systemctl start postgresql
# sudo systemctl enable postgresql
# sudo rm -rf /var/lib/pgsql/data
# sudo -i -u postgres
# pg_ctl initdb
# exit
# sudo systemctl status postgresql
# sudo systemctl stop postgresql
# sudo systemctl start postgresql
# sudo systemctl status postgresql
