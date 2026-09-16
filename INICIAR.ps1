$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$noeticaNode = Get-Command node -ErrorAction SilentlyContinue
if ($noeticaNode) {
    $noeticaNodePath = $noeticaNode.Source
} else {
    $noeticaNodePath = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $noeticaNodePath)) {
    throw 'Instale o Node.js 22.12 ou superior e execute este arquivo novamente.'
}
if (-not (Test-Path -LiteralPath 'node_modules/vite/bin/vite.js')) {
    throw 'As dependências não estão instaladas. Instale o Node.js e execute npm install nesta pasta uma vez.'
}
Write-Host ''
Write-Host 'Noética iniciada em http://127.0.0.1:5173' -ForegroundColor Green
Write-Host 'Esta janela precisa ficar aberta. Pressione Ctrl+C para encerrar.'
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process 'http://127.0.0.1:5173'
} | Out-Null
& $noeticaNodePath 'node_modules/vite/bin/vite.js' '--host' '127.0.0.1'
