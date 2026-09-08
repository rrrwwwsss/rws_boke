$ErrorActionPreference = 'Stop'
$assetDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\src\content\posts\projects\road-evidence-agent'))
$svgPath = Join-Path $assetDir 'system-architecture.svg'
$vsdxPath = Join-Path $assetDir 'system-architecture.vsdx'
$visioExe = 'C:\Program Files\Microsoft Office\root\Office16\VISIO.EXE'

$process = Start-Process -FilePath $visioExe -ArgumentList '/nologo','/nonew' -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 8
$visio = [Runtime.InteropServices.Marshal]::GetActiveObject('Visio.Application')
$visio.Visible = $false
$visio.AlertResponse = 7
$document = $null
try {
    $document = $visio.Documents.Open($svgPath)
    $document.SaveAs($vsdxPath)
}
finally {
    if ($document) { $document.Close() }
    $visio.Quit()
    if ($document) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($visio)
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

Write-Output $vsdxPath
