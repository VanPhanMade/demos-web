[CmdletBinding()]
param(
  [switch]$SkipInstall,
  [switch]$SkipTypecheck
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$CachePath = Join-Path $Root ".npm-cache"
$ReleasePath = Join-Path $Root "release\demo"
$LogsPath = Join-Path $Root "logs"
$ConstructionLogPath = Join-Path $LogsPath "build-exe-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"

function Write-LogLine {
  param(
    [string]$Message
  )

  Write-Host $Message
  Add-Content -Path $ConstructionLogPath -Value $Message
}

function Write-LogBlock {
  param(
    [string]$Message
  )

  if ([string]::IsNullOrWhiteSpace($Message)) {
    return
  }

  Write-Host $Message
  Add-Content -Path $ConstructionLogPath -Value $Message
}

function ConvertTo-ArgumentString {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  return ($Arguments | ForEach-Object {
      if ($_ -match '[\s"]') {
        '"' + ($_ -replace '"', '\"') + '"'
      }
      else {
        $_
      }
    }) -join " "
}

function Invoke-Npm {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  $NpmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if (-not $NpmCommand) {
    $NpmCommand = Get-Command npm -ErrorAction Stop
  }

  $ArgumentString = ConvertTo-ArgumentString $Arguments
  Write-LogLine ""
  Write-LogLine "> npm $ArgumentString"

  $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
  $ProcessInfo.FileName = $NpmCommand.Source
  $ProcessInfo.Arguments = $ArgumentString
  $ProcessInfo.WorkingDirectory = $Root
  $ProcessInfo.RedirectStandardOutput = $true
  $ProcessInfo.RedirectStandardError = $true
  $ProcessInfo.UseShellExecute = $false
  $ProcessInfo.CreateNoWindow = $true
  $ProcessInfo.EnvironmentVariables["npm_config_cache"] = $CachePath

  $Process = New-Object System.Diagnostics.Process
  $Process.StartInfo = $ProcessInfo

  [void]$Process.Start()
  $Stdout = $Process.StandardOutput.ReadToEnd()
  $Stderr = $Process.StandardError.ReadToEnd()
  $Process.WaitForExit()

  Write-LogBlock $Stdout
  Write-LogBlock $Stderr

  if ($Process.ExitCode -ne 0) {
    throw "npm $ArgumentString failed with exit code $($Process.ExitCode)."
  }
}

Push-Location $Root

try {
  New-Item -ItemType Directory -Force -Path $LogsPath | Out-Null

  Write-LogLine "Construction log: $ConstructionLogPath"
  Write-LogLine "Start time: $(Get-Date -Format o)"
  Write-LogLine "Host root: $Root"

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
    Write-LogLine "Running typecheck..."
    Invoke-Npm @("run", "typecheck")
  }

  Write-LogLine "Building Windows .exe artifacts..."
  Invoke-Npm @("run", "dist:win")

  Write-LogLine ""
  Write-LogLine "Build complete. Artifacts:"

  $ArtifactTable = Get-ChildItem -Path $ReleasePath -Filter "*.exe" |
    Sort-Object Name |
    Select-Object Name, @{ Name = "SizeMB"; Expression = { [math]::Round($_.Length / 1MB, 2) } } |
    Format-Table -AutoSize |
    Out-String

  Write-LogBlock $ArtifactTable
  Write-LogLine "End time: $(Get-Date -Format o)"
}
finally {
  Pop-Location
}
