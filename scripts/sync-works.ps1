# 重打並同步全部 Arena 作品到 public/works。
# Canonical 路徑使用完整模型 slug；舊短網址保留為 redirect，避免歷史文章失效。
# 用法：在專案根目錄執行 .\scripts\sync-works.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot | Split-Path -Parent

$works = @(
  @{ Source = 'claude-opus-4-6';       Slug = 'claude-opus-4-6';       Legacy = 'opus' },
  @{ Source = 'muse-spark-1-3';        Slug = 'muse-spark-1-3';        Legacy = 'spark' },
  @{ Source = 'gemini-3-8-flash-high'; Slug = 'gemini-3-8-flash-high'; Legacy = 'gemini' },
  @{ Source = 'qwen-3-8-flash';        Slug = 'qwen-3-8-flash';        Legacy = 'qwen' },
  @{ Source = 'glm-5-3-flash';         Slug = 'glm-5-3-flash';         Legacy = 'glm' },
  @{ Source = 'qwen-3-8-27b-local';    Slug = 'qwen-3-8-27b-local';    Legacy = 'qw27' },
  @{ Source = 'gpt-5-6-sol';           Slug = 'gpt-5-6-sol';           Legacy = 'gpt56sol' },
  @{ Source = 'deepseek-v4-1-flash';   Slug = 'deepseek-v4-1-flash';   Legacy = 'deepseek' },
  @{ Source = 'grok-4-6';              Slug = 'grok-4-6';              Legacy = 'grok46' },
  @{ Source = 'glm-5-3';               Slug = 'glm-5-3';               Legacy = 'glm53' }
)

function Write-LegacyRedirect([string]$legacy, [string]$slug) {
  if ($legacy -eq $slug) { return }
  $dir = Join-Path $root "public\works\$legacy"
  Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  $target = "/works/$slug/"
  $html = @"
<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=$target">
  <link rel="canonical" href="$target">
  <title>Moved · TYPELIN ARENA</title>
</head>
<body>
  <p>作品已移至 <a href="$target">$target</a></p>
  <script>location.replace('$target' + location.search + location.hash)</script>
</body>
</html>
"@
  Set-Content -LiteralPath (Join-Path $dir 'index.html') -Value $html -Encoding utf8 -NoNewline
}

foreach ($work in $works) {
  $proj = Join-Path $root "works-src\$($work.Source)"
  if (!(Test-Path -LiteralPath $proj)) { throw "Missing Arena source: $proj" }

  Push-Location -LiteralPath $proj
  try {
    if (!(Test-Path -LiteralPath (Join-Path $proj 'node_modules'))) { npm install }
    npm run build
  }
  finally {
    Pop-Location
  }

  $dist = Join-Path $proj 'dist'
  if (!(Test-Path -LiteralPath (Join-Path $dist 'index.html'))) {
    throw "Build produced no dist/index.html: $($work.Source)"
  }

  $to = Join-Path $root "public\works\$($work.Slug)"
  Remove-Item -LiteralPath $to -Recurse -Force -ErrorAction SilentlyContinue
  Copy-Item -LiteralPath $dist -Destination $to -Recurse -Force
  Write-LegacyRedirect $work.Legacy $work.Slug
  Write-Host "OK works-src\$($work.Source) -> public\works\$($work.Slug) (legacy /works/$($work.Legacy)/ redirects)"
}

# 第二測 LOGO 與主作品共用完整模型 slug；舊 vendor-level 短網址只保留 redirect。
$logos = @(
  @{ Source = 'claude-opus-4-6-logo';       Slug = 'claude-opus-4-6';       Legacy = 'opus' },
  @{ Source = 'muse-spark-1-3-logo';        Slug = 'muse-spark-1-3';        Legacy = 'spark' },
  @{ Source = 'gemini-3-8-flash-high-logo'; Slug = 'gemini-3-8-flash-high'; Legacy = 'gemini' },
  @{ Source = 'qwen-3-8-flash-logo';        Slug = 'qwen-3-8-flash';        Legacy = 'qwen' },
  @{ Source = 'qwen-3-8-27b-local-logo';    Slug = 'qwen-3-8-27b-local';    Legacy = 'qwen-3-8-27b-local' },
  @{ Source = 'glm-5-3-flash-logo';         Slug = 'glm-5-3-flash';         Legacy = 'glm' },
  @{ Source = 'gpt-5-6-sol-logo';           Slug = 'gpt-5-6-sol';           Legacy = 'gpt-5-6-sol' },
  @{ Source = 'deepseek-v4-1-flash-logo';   Slug = 'deepseek-v4-1-flash';   Legacy = 'deepseek-v4-1-flash' },
  @{ Source = 'grok-4-6-logo';              Slug = 'grok-4-6';              Legacy = 'grok-4-6' },
  @{ Source = 'glm-5-3-logo';               Slug = 'glm-5-3';               Legacy = 'glm-5-3' }
)

function Write-LegacyLogoRedirect([string]$legacy, [string]$slug) {
  if ($legacy -eq $slug) { return }
  $dir = Join-Path $root "public\logo\$legacy"
  Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  $target = "/logo/$slug/"
  $html = @"
<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=$target">
  <link rel="canonical" href="$target">
  <title>Moved · TYPELIN ARENA</title>
</head>
<body>
  <p>LOGO 第二測已移至 <a href="$target">$target</a></p>
  <script>location.replace('$target' + location.search + location.hash)</script>
</body>
</html>
"@
  Set-Content -LiteralPath (Join-Path $dir 'index.html') -Value $html -Encoding utf8 -NoNewline
}

foreach ($logo in $logos) {
  $proj = Join-Path $root "works-src\$($logo.Source)"
  if (!(Test-Path -LiteralPath $proj)) { throw "Missing Arena LOGO source: $proj" }

  Push-Location -LiteralPath $proj
  try {
    if (!(Test-Path -LiteralPath (Join-Path $proj 'node_modules'))) { npm install }
    npm run build
  }
  finally {
    Pop-Location
  }

  $dist = Join-Path $proj 'dist'
  if (!(Test-Path -LiteralPath (Join-Path $dist 'index.html'))) {
    throw "Build produced no dist/index.html: $($logo.Source)"
  }

  $to = Join-Path $root "public\logo\$($logo.Slug)"
  Remove-Item -LiteralPath $to -Recurse -Force -ErrorAction SilentlyContinue
  Copy-Item -LiteralPath $dist -Destination $to -Recurse -Force
  Write-LegacyLogoRedirect $logo.Legacy $logo.Slug
  Write-Host "OK works-src\$($logo.Source) -> public\logo\$($logo.Slug) (legacy /logo/$($logo.Legacy)/ redirects)"
}