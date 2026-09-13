$ErrorActionPreference='Stop'
$taskRoot=(Get-Location).Path
$taskOut=Join-Path $taskRoot 'validation_artifacts/free_faculty_template_parity/documents/rendered'
New-Item -ItemType Directory -Path $taskOut -Force | Out-Null
$taskWord=New-Object -ComObject Word.Application
$taskWord.Visible=$false
$taskWord.DisplayAlerts=0
try {
  foreach ($taskName in @('faculty-composer-quick-start-guide','faculty-game-overview-guide','faculty-implementation-guide','student-instructions-and-faculty-customization-checklist','faculty-question-bank-helper','example-question-architecture','example-question-generation-prompt')) {
    $taskDoc=$taskWord.Documents.Open((Join-Path $taskRoot "downloads/resources/$taskName.docx"),$false,$true)
    try { $taskDoc.ExportAsFixedFormat((Join-Path $taskOut "$taskName.pdf"),17) } finally { $taskDoc.Close(0) }
    Write-Output "Rendered $taskName"
  }
} finally { $taskWord.Quit() }
