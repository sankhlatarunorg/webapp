#!/bin/bash

# Set the path to your pg_hba.conf file
PG_HBA_CONF="/path/to/pg_hba.conf"

# Change the authentication method to "md5" for password authentication
sed -i 's/ident/md5/g' $PG_HBA_CONF

# Restart PostgreSQL to apply changes
systemctl restart postgresql  # Adjust the command based on your system
