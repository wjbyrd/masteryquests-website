param([ValidateSet('the-economys-edge','signal-house','gdp-live','cpi-live')][string]$Game='the-economys-edge')
$ErrorActionPreference='Stop'
$taskRoot=(Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$taskOut=Join-Path $taskRoot $(if($Game -eq 'the-economys-edge'){'tmp/econ-rpg/economys-edge-guide/rendered'}else{"tmp/econ-rpg/$Game-guide/rendered"})
New-Item -ItemType Directory -Path $taskOut -Force | Out-Null
$taskWord=New-Object -ComObject Word.Application
$taskWord.Visible=$false
$taskWord.DisplayAlerts=0
try {
  $taskDoc=$taskWord.Documents.Open((Join-Path $taskRoot "downloads/resources/$Game-faculty-guide.docx"),$false,$true)
  try {
    $taskDoc.Repaginate()
    $taskDoc.ExportAsFixedFormat((Join-Path $taskOut "$Game-faculty-guide.pdf"),17)
  } finally { $taskDoc.Close(0) }
} finally { $taskWord.Quit() }
