# Build and publish Frontend Shock submissions without mixing them into the main self-intro ranking.
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot | Split-Path -Parent
$manifestPath = Join-Path $root 'benchmark-assets\frontend-shock\submissions.json'
$submissions = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

foreach ($submission in $submissions) {
  $id = [string]$submission.id
  $source = Join-Path $root "works-src\frontend-shock\$id"
  if (!(Test-Path -LiteralPath $source)) { throw "Missing Frontend Shock source: $source" }

  Push-Location -LiteralPath $source
  try {
    npm run build
  }
  finally {
    Pop-Location
  }

  $portable = Join-Path $source 'outputs\unfinished-form.html'
  if (!(Test-Path -LiteralPath $portable)) { throw "Build produced no portable HTML: $portable" }

  $publicDir = Join-Path $root "public\works\frontend-shock\$id"
  New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
  Copy-Item -LiteralPath $portable -Destination (Join-Path $publicDir 'index.html') -Force

  $review = Join-Path $source 'outputs\review.html'
  if (Test-Path -LiteralPath $review) {
    Copy-Item -LiteralPath $review -Destination (Join-Path $publicDir 'review.html') -Force
  }

  foreach ($name in @('sample-weave.svg', 'five-frames.png')) {
    $artifact = Join-Path $source "outputs\$name"
    if (Test-Path -LiteralPath $artifact) {
      Copy-Item -LiteralPath $artifact -Destination (Join-Path $publicDir $name) -Force
    }
  }

  $shot = Join-Path $source 'outputs\final-01.png'
  if (Test-Path -LiteralPath $shot) {
    $shotDir = Join-Path $root 'public\shots\frontend-shock'
    New-Item -ItemType Directory -Path $shotDir -Force | Out-Null
    Copy-Item -LiteralPath $shot -Destination (Join-Path $shotDir "$id.png") -Force
  }

  Write-Host "OK Frontend Shock $id -> /works/frontend-shock/$id/"
}
