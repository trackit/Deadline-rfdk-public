#!/bin/bash

# Variables
secret=""
region=""
drive=""
join_account="admin"
activedirectory=""
capactivedirectory=${activedirectory^^}
password=$(aws secretsmanager get-secret-value --region $region --secret-id $secret | python3 -c "import sys, json; print(json.loads(json.load(sys.stdin)['SecretString'])['password'])")

# Install necessary packages without prompts
sudo apt-get update
sudo apt-get -y upgrade
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y sssd realmd krb5-user samba-common packagekit adcli cifs-utils

# Configure Kerberos
sudo bash -c 'cat > /etc/krb5.conf' << EOF
[libdefaults]
default_realm = ${capactivedirectory^^}
rdns = false
EOF

# Join the instance to the directory
echo $password | sudo realm join -U $join_account $activedirectory --verbose

# Mount the CIFS share
sudo mkdir /mnt/studio
sudo mount -t cifs -o vers=3.0,sec=ntlmsspi,user=Admin@$capactivedirectory,password=$password //$drive/share /mnt/studio

# Configure Deadline, assuming Deadline for Linux is installed
/opt/Thinkbox/Deadline10/bin/deadlinecommand -SetIniFileSetting ProxyRoot0 "renderqueue.deadline.internal:4433"
/opt/Thinkbox/Deadline10/bin/deadlinecommand -SetIniFileSetting ProxyRoot "renderqueue.deadline.internal:4433"


