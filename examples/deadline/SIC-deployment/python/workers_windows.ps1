<powershell>
# secret ARN - StudioADAdminAccountCredentials...
$secret=""
# Fsx drive DNS name
$drive=""

Write-Output "Adding computer to domain"
$adInfo = Get-SECSecretValue -SecretId $secret | Select-Object -ExpandProperty SecretString | ConvertFrom-Json
$credential = New-Object -TypeName PSCredential -ArgumentList ($adInfo.username + '@' + $adInfo.fqdn),(ConvertTo-SecureString -String $adInfo.password -AsPlainText -Force)[0]
$username = $adInfo.fqdn+"\"+$adInfo.username
Add-Computer -DomainName $adInfo.fqdn -Credential $credential -Restart

Write-Output "Mounting fsx drive"
New-PSDrive -Name "Z" -Root ("\\"+$drive+"\share") -Persist -PSProvider "FileSystem" -Credential $credential

Write-Output "forcing deadline connection"
$DEADLINE_PATH = "C:\Program Files\Thinkbox\Deadline10\bin"
pushd $DEADLINE_PATH
.\deadlinecommand.exe -SetIniFileSetting ProxyRoot0 renderqueue.deadline.internal:4433
.\deadlinecommand.exe -SetIniFileSetting ProxyRoot renderqueue.deadline.internal:4433


popd
</powershell>
<persist>true</persist>