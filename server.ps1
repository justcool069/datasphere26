$port = 8080
$localPath = $PSScriptRoot
if ([string]::IsNullOrEmpty($localPath)) {
    $localPath = Get-Location
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

Write-Host "Initializing server prefix: http://localhost:$port/"
try {
    $listener.Start()
    Write-Host "============================================="
    Write-Host "Server successfully active at http://localhost:$port/"
    Write-Host "Double-click / Open: http://localhost:$port/"
    Write-Host "Press Ctrl+C in terminal or close window to stop."
    Write-Host "============================================="
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        
        # Handle API Registration POST request
        if ($request.HttpMethod -eq "POST" -and $urlPath -eq "/api/register") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $requestBodyString = $reader.ReadToEnd()
                $reader.Close()
                
                $postData = ConvertFrom-Json $requestBodyString
                
                # Verify that required data fields exist
                if ($postData -ne $null -and $postData.teamName -and $postData.leaderEmail) {
                    $obj = [PSCustomObject]@{
                        TeamName         = $postData.teamName
                        LeaderName       = $postData.leaderName
                        LeaderEmail      = $postData.leaderEmail
                        Track            = $postData.track
                        RegistrationTime = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
                    }
                    
                    $csvPath = Join-Path $localPath "registrations.csv"
                    
                    # Lock & write to CSV safely
                    $obj | Export-Csv -Path $csvPath -NoTypeInformation -Append -Encoding UTF8
                    
                    # Return success response
                    $response.ContentType = "application/json; charset=utf-8"
                    $response.StatusCode = 200
                    $resObj = @{ success = $true; message = "Registration logged to registrations.csv" }
                    $json = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                } else {
                    $response.StatusCode = 400
                    $resObj = @{ success = $false; message = "Invalid registration payloads" }
                    $json = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                }
            } catch {
                $response.StatusCode = 500
                $resObj = @{ success = $false; message = $_.Exception.Message }
                $json = ConvertTo-Json $resObj
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            }
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }
        
        # Default static file handling
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        $filePath = Join-Path $localPath $urlPath.Replace('/', '\')
        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath)
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".svg"  { "image/svg+xml; charset=utf-8" }
                default { "application/octet-stream" }
            }
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "An error occurred starting the listener: $_"
} finally {
    if ($listener -ne $null) {
        $listener.Stop()
    }
}
