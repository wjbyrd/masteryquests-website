param([Parameter(Mandatory=$true)][string]$WorkbookPath,
      [Parameter(Mandatory=$true)][string]$ReportPath,
      [string]$ExpectedRange='A1:AJ301', [int]$ExpectedColumns=36)
$ErrorActionPreference = 'Stop'
$file = (Resolve-Path -LiteralPath $WorkbookPath).Path
$result = [ordered]@{file=$file; corruptLoad=0; status='FAIL'; saved=$false}
$excel = $null; $book = $null
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.EnableEvents = $false
    $excel.AutomationSecurity = 3
    $result.version = $excel.Version
    $started = Get-Date
    # Explicit xlNormalLoad: never request xlRepairFile or xlExtractData.
    $book = $excel.Workbooks.Open($file,0,$true,5,'','',$true,1,',',$false,$false,0,$false,$false,0)
    $sheet = $book.Worksheets.Item('Question_Bank')
    if ($sheet.ListObjects.Count -ne 1) { throw 'Expected one drafting table' }
    $table = $sheet.ListObjects.Item(1)
    $result.tableRange = $table.Range.Address($false,$false)
    if ($result.tableRange -ne $ExpectedRange) { throw "Unexpected table range: $($result.tableRange)" }
    if ($table.ListColumns.Count -ne $ExpectedColumns) { throw "Expected $ExpectedColumns table columns" }
    for ($i=1; $i -le $ExpectedColumns; $i++) {
        if ($table.ListColumns.Item($i).Name -cne $sheet.Cells.Item(1,$i).Value2) { throw "Header mismatch at column $i" }
    }
    $excel.CalculateFull()
    if ($sheet.Range('AC2').Value2 -ne 'CHECK ONLINE') { throw 'Initial completeness failed' }
    $repairSkill = $sheet.Range('P2').Value2
    $sheet.Range('P2').Value2 = ''
    $excel.CalculateFull()
    if ($sheet.Range('AC2').Value2 -ne 'INCOMPLETE') { throw 'Missing RepairSkill not detected' }
    $sheet.Range('P2').Value2 = $repairSkill
    $excel.CalculateFull()
    if ($sheet.Range('AC2').Value2 -ne 'CHECK ONLINE') { throw 'Restored RepairSkill not accepted' }
    $result.mutation = 'PASS'
    $result.summary = @($book.Worksheets.Item('Validator_Summary').Range('B3').Value2,$book.Worksheets.Item('Validator_Summary').Range('B4').Value2,$book.Worksheets.Item('Validator_Summary').Range('B5').Value2)
    if (($result.summary -join ',') -ne '5,0,5') { throw 'Unexpected summary' }
    $logs = @(Get-ChildItem -LiteralPath $env:TEMP -Filter 'error*.xml' -File -ErrorAction SilentlyContinue | Where-Object LastWriteTime -ge $started)
    $result.newRecoveryLogs = @($logs | ForEach-Object FullName)
    if ($logs.Count) { throw 'Excel generated recovery log(s)' }
    $result.status = 'PASS'
} catch {
    $result.error = $_.Exception.Message
    $result.hresult = $_.Exception.HResult
} finally {
    if ($null -ne $book) { $book.Close($false); [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($book) }
    if ($null -ne $excel) { $excel.Quit(); [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($excel) }
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
    $result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $ReportPath -Encoding utf8
}
$result | ConvertTo-Json -Depth 6
if ($result.status -ne 'PASS') { exit 1 }
