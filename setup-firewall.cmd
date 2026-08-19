netsh advfirewall firewall add rule name="OpenCode Web UI (TCP 8080)" dir=in action=allow protocol=TCP localport=8080 profile=any
netsh advfirewall firewall add rule name="OpenCode mDNS (UDP 5353)" dir=in action=allow protocol=UDP localport=5353 profile=any
pause
