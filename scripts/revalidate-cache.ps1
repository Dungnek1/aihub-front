# Script PowerShell để force revalidate cache
# Sử dụng: .\scripts\revalidate-cache.ps1 [all|blog|path]

param(
    [string]$Path = "all",
    [string]$ApiUrl = $env:NEXT_PUBLIC_SITE_URL,
    [string]$Secret = $env:REVALIDATE_SECRET
)

# Default values
if ([string]::IsNullOrEmpty($ApiUrl)) {
    $ApiUrl = "http://localhost:5000"
}

if ([string]::IsNullOrEmpty($Secret)) {
    # Try to read from .env.local or .env
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local" | Where-Object { $_ -match "REVALIDATE_SECRET=" }
        if ($envContent) {
            $Secret = ($envContent -split "=")[1].Trim()
        }
    }
    
    if ([string]::IsNullOrEmpty($Secret) -and (Test-Path ".env")) {
        $envContent = Get-Content ".env" | Where-Object { $_ -match "REVALIDATE_SECRET=" }
        if ($envContent) {
            $Secret = ($envContent -split "=")[1].Trim()
        }
    }
    
    # Fallback to dev secret
    if ([string]::IsNullOrEmpty($Secret)) {
        $Secret = "dev-secret-key"
    }
}

$ApiEndpoint = "$ApiUrl/api/revalidate"

Write-Host "🔄 Đang revalidate cache..." -ForegroundColor Yellow
Write-Host "📍 Path: $Path" -ForegroundColor Yellow
Write-Host "🌐 API: $ApiEndpoint" -ForegroundColor Yellow
Write-Host ""

# Prepare request
$headers = @{
    "Content-Type" = "application/json"
    "x-revalidate-secret" = $Secret
}

$body = @{
    path = $Path
} | ConvertTo-Json

# Call API
try {
    $response = Invoke-RestMethod -Uri $ApiEndpoint -Method Post -Headers $headers -Body $body
    
    Write-Host "✅ Revalidation thành công!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "✨ Xong! Cache đã được refresh." -ForegroundColor Green
    
} catch {
    Write-Host "❌ Revalidation thất bại!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    
    exit 1
}

