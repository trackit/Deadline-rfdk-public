#!/bin/bash
# secret ARN - StudioADAdminAccountCredentials...
secret="arn:aws:secretsmanager:us-west-2:325174726825:secret:StudioADAdminAccountCredentials-0IoU4y"
# AWS account region
region="us-west-2"
# Fsx drive DNS name
drive="fs-0fb8e3bba00fe1f32.ad.pixelogicpoc.cas-studio.us-west-2.aws"
# Active directory DNS name
activedirectory="ad.pixelogicpoc.cas-studio.us-west-2.aws"
# Active directory dns IP 1
AD_DNS_1="10.0.0.73"
# Active directory dns IP 2
AD_DNS_2="10.0.0.87"
capactivedirectory=${activedirectory^^}
password=`aws secretsmanager get-secret-value --region $region --secret-id $secret | python -c "import sys, json; obj=json.load(sys.stdin)['SecretString'];print json.loads(obj)['password']"`


sudo yum -y update
sudo yum -y install sssd realmd krb5-workstation samba-common-tools
sudo yum install -y cifs-utils
echo $password | sudo realm join -U admin@$capactivedirectory $activedirectory --computer-ou="OU=RenderWorkers, OU=ad" --verbose

echo $password | kinit admin@$capactivedirectory
sudo mkdir /mnt/studio
sudo mount -t cifs -o vers=3.0,sec=ntlmsspi,user=Admin@$capactivedirectory,password=$password //$drive/share /mnt/studio

/opt/Thinkbox/Deadline10/bin/deadlinecommand.exe -SetIniFileSetting ProxyRoot0 "renderqueue.deadline.internal:4433"
/opt/Thinkbox/Deadline10/bin/deadlinecommand.exe -SetIniFileSetting ProxyRoot "renderqueue.deadline.internal:4433"
