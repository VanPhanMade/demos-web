[CmdletBinding()]
param(
  [switch]$SkipInstall,
  [switch]$SkipTypecheck
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$CachePath = Join-Path $Root ".npm-cache"
$ReleasePath = Join-Path $Root "release\demo"

function Invoke-Npm {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  & npm @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "npm $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
  }
}

Push-Location $Root

try {
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm was not found. Install Node.js, then rerun this script."
  }

  $env:npm_config_cache = $CachePath

  if (-not (Test-Path (Join-Path $Root "node_modules"))) {
    if ($SkipInstall) {
      throw "node_modules is missing. Rerun without -SkipInstall so dependencies can be installed."
    }

    Write-Host "Installing dependencies..."
    Invoke-Npm @("install")
  }

  if (-not $SkipTypecheck) {
    Write-Host "Running typecheck..."
    Invoke-Npm @("run", "typecheck")
  }

  Write-Host "Building Windows .exe artifacts..."
  Invoke-Npm @("run", "dist:win")

  Write-Host ""
  Write-Host "Build complete. Artifacts:"

  Get-ChildItem -Path $ReleasePath -Filter "*.exe" |
    Sort-Object Name |
    Select-Object Name, @{ Name = "SizeMB"; Expression = { [math]::Round($_.Length / 1MB, 2) } } |
    Format-Table -AutoSize
}
finally {
  Pop-Location
}

