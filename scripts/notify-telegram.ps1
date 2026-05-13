$ErrorActionPreference = "Stop"

$envPath = Join-Path $PSScriptRoot "..\\.env"
if (!(Test-Path $envPath)) {
  throw "Missing .env at $envPath"
}

Get-Content $envPath | ForEach-Object {
  $line = $_
  if ($line -match "^\s*#" -or $line -match "^\s*$") { return }

  $parts = $line -split "=", 2
  if ($parts.Length -ne 2) { return }

  $key = $parts[0].Trim()
  $value = $parts[1].Trim()

  if (-not $key) { return }
  [Environment]::SetEnvironmentVariable($key, $value)
}

if (-not $env:TELEGRAM_BOT_TOKEN) { throw "Missing TELEGRAM_BOT_TOKEN in .env" }
if (-not $env:TELEGRAM_CHAT_ID) { throw "Missing TELEGRAM_CHAT_ID in .env" }

Invoke-RestMethod -Uri "https://api.telegram.org/bot$env:TELEGRAM_BOT_TOKEN/sendMessage" -Method Post -Body @{
  chat_id = $env:TELEGRAM_CHAT_ID
  text    = "Task Done"
}

