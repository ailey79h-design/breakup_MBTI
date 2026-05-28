# Supabase 원클릭 설정 (PowerShell)
# 사용법: 프로젝트 생성 후 대시보드에서 Access Token 발급

param(
    [Parameter(Mandatory = $true)]
    [string]$AccessToken,
    [Parameter(Mandatory = $true)]
    [string]$ProjectRef
)

$env:SUPABASE_ACCESS_TOKEN = $AccessToken
$env:SUPABASE_PROJECT_REF = $ProjectRef
Set-Location $PSScriptRoot\..
node scripts/supabase-setup.mjs
