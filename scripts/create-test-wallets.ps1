$ErrorActionPreference = "Stop"

if ($PSVersionTable.PSVersion.Major -ge 7) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$wallets = @(
  @{ label = "student-01"; role = "STUDENT" },
  @{ label = "student-02"; role = "STUDENT" },
  @{ label = "parent-01"; role = "PARENT_GUARDIAN" },
  @{ label = "school-01"; role = "INSTITUTION_VERIFIER" },
  @{ label = "dorm-01"; role = "INSTITUTION_VERIFIER" },
  @{ label = "landlord-01"; role = "INSTITUTION_VERIFIER" },
  @{ label = "agency-01"; role = "AGENCY" },
  @{ label = "verifier-01"; role = "INSTITUTION_VERIFIER" },
  @{ label = "admin-01"; role = "ADMIN" },
  @{ label = "mediator-01"; role = "MEDIATOR" },
  @{ label = "reviewer-01"; role = "REVIEWER" },
  @{ label = "reviewer-02"; role = "REVIEWER" }
)

$dataDir = Join-Path (Get-Location) "data"
$outputPath = Join-Path $dataDir "test-wallets.json"
$horizonUrl = if ($env:NEXT_PUBLIC_STELLAR_HORIZON_URL) { $env:NEXT_PUBLIC_STELLAR_HORIZON_URL } else { "https://horizon-testnet.stellar.org" }

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

$rows = @()
$existingLabels = @((stellar keys ls --quiet | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_.Trim() }))

foreach ($wallet in $wallets) {
  $label = $wallet.label
  $publicKey = $null

  if ($existingLabels -notcontains $label) {
    Write-Host "Generating $label"
    stellar keys generate --network testnet --quiet $label | Out-Null
    $existingLabels += $label
  }

  Write-Host "Funding $label on Stellar testnet"
  stellar keys fund --network testnet --quiet $label | Out-Null

  $publicKey = (& stellar keys public-key --quiet $label).Trim()

  $account = Invoke-RestMethod -Uri "$horizonUrl/accounts/$publicKey" -Method Get
  $tx = Invoke-RestMethod -Uri "$horizonUrl/accounts/$publicKey/transactions?limit=1&order=desc" -Method Get
  $nativeBalance = ($account.balances | Where-Object { $_.asset_type -eq "native" } | Select-Object -First 1).balance
  $lastTxHash = $null
  $lastInteraction = $null

  if ($tx._embedded.records.Count -gt 0) {
    $lastTxHash = $tx._embedded.records[0].hash
    $lastInteraction = $tx._embedded.records[0].created_at
  }

  $rows += [pscustomobject]@{
    label           = $label
    publicKey       = $publicKey
    suggestedRole   = $wallet.role
    funded          = $true
    balance         = $nativeBalance
    lastInteraction = $lastInteraction
    lastTxHash      = $lastTxHash
    walletProvider  = "FREIGHTER"
    usedInApp       = $false
  }

  Write-Host "Manual import hint for ${label}:"
  Write-Host "  stellar keys secret $label"
}

$json = $rows | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($outputPath, "$json`n", [System.Text.UTF8Encoding]::new($false))
Write-Host "Saved public wallet fixtures to $outputPath"
