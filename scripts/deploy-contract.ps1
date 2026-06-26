$ErrorActionPreference = "Stop"

if ($PSVersionTable.PSVersion.Major -ge 7) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$manifestPath = "contracts/study_bond_escrow/Cargo.toml"
$outDir = "contracts/study_bond_escrow/dist"
$wasmPath = Join-Path $outDir "study_bond_escrow.wasm"
$alias = if ($env:STELLAR_DEPLOYER_ALIAS) { $env:STELLAR_DEPLOYER_ALIAS } else { "studybond-deployer" }
$existingLabels = @((stellar keys ls --quiet | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_.Trim() }))

if ($existingLabels -notcontains $alias) {
  Write-Host "Generating deployer identity $alias"
  stellar keys generate --network testnet --quiet $alias | Out-Null
}

Write-Host "Funding deployer identity $alias"
stellar keys fund --network testnet --quiet $alias | Out-Null

Write-Host "Building optimized Soroban contract"
stellar contract build --manifest-path $manifestPath --out-dir $outDir --optimize | Out-Null

Write-Host "Deploying contract to Stellar testnet"
$rawContractId = (& stellar contract deploy --wasm $wasmPath --source-account $alias --network testnet --alias studybond-escrow --ignore-checks --quiet)

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($rawContractId)) {
  throw "Contract deployment failed."
}

$contractId = $rawContractId.Trim()

Write-Host ""
Write-Host "Deployment complete"
Write-Host "Contract ID: $contractId"
Write-Host "Update NEXT_PUBLIC_STELLAR_CONTRACT_ID in your .env and redeploy the frontend."
