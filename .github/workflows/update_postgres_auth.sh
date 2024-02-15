#!/bin/sh

PG_HBA_CONF="/var/lib/pgsql/data/pg_hba.conf"

sed -i 's/ident/md5/g' $PG_HBA_CONF

systemctl restart postgresql
