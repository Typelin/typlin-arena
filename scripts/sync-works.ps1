# 同步全部作品 dist 到本站（OC 出新版後跑一次即可）
# 源碼已收攏至本站 works-src/，不再依賴外部工作區。
# 用法：在本目錄執行 .\scripts\sync-works.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot | Split-Path -Parent
$pairs = @(
  @('opus', 'works\opus'),
  @('spark', 'works\spark'),
  @('gemini', 'works\gemini'),
  @('qwen', 'works\qwen'),
  @('glm', 'works\glm'),
  @('qw27', 'works\qw27'),
  @('opus-logo', 'logo\opus'),
  @('spark-logo', 'logo\spark'),
  @('gemini-logo', 'logo\gemini'),
  @('qwen-logo', 'logo\qwen'),
  @('glm-logo', 'logo\glm')
)
foreach ($p in $pairs) {
  $proj = Join-Path $root "works-src\$($p[0])"
  if (!(Test-Path -LiteralPath $proj)) { Write-Host "SKIP $($p[0])（源碼不在本站）"; continue }
  Push-Location -LiteralPath $proj
  if (!(Test-Path -LiteralPath (Join-Path $proj 'node_modules'))) { npm install }
  npm run build
  Pop-Location
  $to = Join-Path $root "public\$($p[1])"
  Remove-Item -LiteralPath $to -Recurse -Force -ErrorAction SilentlyContinue
  Copy-Item -Path (Join-Path $proj 'dist') -Destination $to -Recurse -Force
  Write-Host "OK works-src\$($p[0]) -> public\$($p[1])"
}
