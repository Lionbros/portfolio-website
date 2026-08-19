# Auto-start the OpenCode web server for remote access from the MacBook.
# Run by Task Scheduler at logon. Read-only: logs to a file, never closes.
$project = "C:\Users\Maarten\Desktop\Bussiness\Portfolio website"
$log     = "C:\Users\Maarten\AppData\Local\Temp\opencode\opencode-web.log"

Set-Location -LiteralPath $project

Start-Transcript -Path $log -Append | Out-Null

Write-Output "=== OpenCode web server starting $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
Write-Output "Project: $project"
Write-Output "UI:      http://192.168.1.164:8080  (also http://opencode.local:8080)"

try {
    & "C:\Users\Maarten\AppData\Roaming\npm\opencode.ps1" web --hostname 0.0.0.0 --port 8080 --mdns
} catch {
    Write-Output "FATAL: $($_.Exception.Message)"
}

Stop-Transcript | Out-Null