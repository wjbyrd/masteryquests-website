"""All visual output stays in guarded staging; production installation is separate."""
from pathlib import Path
import sys

_root=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(_root/'audit_tools/pdf_accessibility'))
from repo_guard import root_guard, contained

def visual_guard(output, logo, asset_root):
    root_guard()
    output=contained(output)
    if not output.is_relative_to(contained('tmp/pdf_accessibility')):
        raise ValueError('Untagged visual PDFs may only be written to accessibility staging')
    contained(logo)
    if contained(asset_root)!=contained('build/faculty-build-composer/data'):
        raise ValueError('Wrong canonical asset root')
    output.parent.mkdir(parents=True,exist_ok=True)
    return output

def generate_selected(composer_root, output_dir, codes, publish=False):
    root_guard()
    if contained(composer_root)!=contained('build/faculty-build-composer'):
        raise ValueError('Wrong Composer root')
    if publish:
        raise ValueError('Direct publication removed: use independently validated installation evidence')
    if not codes:
        raise ValueError('Explicit review codes required; implicit library batches are disabled')
    from rebuild_pilot import build
    from validate_candidates import validate
    rows=build(output_dir,codes)
    if any(r['status']=='REJECTED' for r in rows):raise ValueError('Rejected candidate; active copies unchanged')
    result=validate(rows,contained(output_dir)/'validation')
    if not all(r['passed'] for r in result):raise ValueError('Accessibility validation failed; active copies unchanged')
    return result
