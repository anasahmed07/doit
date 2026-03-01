$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$content = Get-Content $hostsPath
$cleaned = $content | Where-Object { $_ -notmatch 'doit\.local' }
$cleaned + "127.0.0.1 doit.local" | Set-Content $hostsPath
Write-Host "Done. Current doit.local entry:"
Get-Content $hostsPath | Select-String "doit"
