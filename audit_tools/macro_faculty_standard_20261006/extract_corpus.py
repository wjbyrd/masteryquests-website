import json,zipfile,hashlib
from pathlib import Path
from lxml import etree
H=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
source=(H/'preflight.py').read_text()
exec(compile(source[source.index("ns={'w':"):],str(H/'preflight.py'),'exec'))
