from pathlib import Path
import subprocess,json,hashlib
root=Path.cwd()
protected=json.loads((root/'tmp/general_economics_wording_graph_cleanup_20261003/protected_files.json').read_text())
paths=['build/faculty-build-composer/tests/phase3e-market-gate-sample.html','tmp/macroeconomics_exception_closure/active-generated/legendary-review-index.json','tmp/macroeconomics_exception_closure/active-generated/validation.json']
for p in paths:
 data=subprocess.check_output(['git','show','HEAD:'+p])
 if p in protected:
  # Working checkout uses CRLF, while Git's stored blob uses LF.
  if hashlib.sha256(data).hexdigest()!=protected[p]:data=data.replace(b'\r\n',b'\n').replace(b'\n',b'\r\n')
  assert hashlib.sha256(data).hexdigest()==protected[p],p
 (root/p).write_bytes(data)
 print('Restored test-generated output:',p)
