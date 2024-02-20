#!/bin/bash
sudo dnf module list postgresql
sudo dnf -y module enable postgresql:16
sudo dnf -y install postgresql-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
