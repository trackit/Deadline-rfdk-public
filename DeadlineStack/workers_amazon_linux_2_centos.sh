#!/bin/bash
# secret ARN - StudioADAdminAccountCredentials...
secret=""
# AWS account region 
region=""
# Fsx drive DNS name
drive=""
# Active directory DNS name 
activedirectory=""
# Active directory dns IP 1
AD_DNS_1=""
# Active directory dns IP 2
AD_DNS_2=""
capactivedirectory=${activedirectory^^}
password=`aws secretsmanager get-secret-value --region $region --secret-id $secret | python -c "import sys, json; obj=json.load(sys.stdin)['SecretString'];print json.loads(obj)['password']"`


sudo yum -y update
sudo yum -y install sssd realmd krb5-workstation samba-common-tools
sudo yum install -y cifs-utils
echo $password | sudo realm join -U admin@$capactivedirectory $activedirectory --verbose

echo $password | kinit admin@$capactivedirectory
sudo mkdir /mnt/studio
sudo mount -t cifs -o vers=3.0,sec=ntlmsspi,user=Admin@$capactivedirectory,password=$password //$drive/share /mnt/studio

/opt/Thinkbox/Deadline10/bin/deadlinecommand.exe -SetIniFileSetting ProxyRoot0 "renderqueue.deadline.internal:4433"
/opt/Thinkbox/Deadline10/bin/deadlinecommand.exe -SetIniFileSetting ProxyRoot "renderqueue.deadline.internal:4433"