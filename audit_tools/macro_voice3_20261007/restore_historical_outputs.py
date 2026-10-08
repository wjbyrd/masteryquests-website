"""Remove only byte-format noise from identical historical test reports."""
import pathlib,subprocess,json
R=pathlib.Path(__file__).resolve().parents[2]
paths=['audit_tools/macro_voice2_20261007/validation.json','audit_tools/macro_voice_20261006/visual-validation.json','audit_tools/micro_voice_20261007/validation.json']
for name in paths:
 data=subprocess.check_output(['git','show','HEAD:'+name],cwd=R);p=R/name
 assert json.loads(data)==json.loads(p.read_bytes()),'Historical report content changed: '+name
 p.write_bytes(data)
print('Historical test reports retain their exact accepted bytes.')
