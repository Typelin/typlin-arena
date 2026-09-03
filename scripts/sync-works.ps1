# 同步三件作品 dist 到本站 public/works（OC 出新版後跑一次即可）
# 源碼已收攏至本站 works-src/，不再依賴外部工作區。
# 用法：在本目錄執行 .\scripts\sync-works.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot | Split-Path -Parent
$map = @{ 'opus' = 'opus'; 'spark' = 'spark'; 'gemini' = 'gemini'; 'qwen' = 'qwen'; 'glm' = 'glm' }
foreach ($k in $map.Keys) {
  $proj = Join-Path $root "works-src\$k"
  $dist = Join-Path $proj 'dist'
  Push-Location -LiteralPath $proj
  if (!(Test-Path -LiteralPath (Join-Path $proj 'node_modules'))) { npm install }
  npm run build
  Pop-Location
  $to = Join-Path $root "public\works\$($map[$k])"
  Remove-Item -LiteralPath $to -Recurse -Force -ErrorAction SilentlyContinue
  Copy-Item -Path $dist -Destination $to -Recurse -Force
  Write-Host "OK works-src\$k -> public\works\$($map[$k])"
}
