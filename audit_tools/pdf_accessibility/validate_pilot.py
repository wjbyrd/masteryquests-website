"""Compatibility entrypoint for the maintained current pilot validator."""
from repo_guard import *
import runpy
if __name__=='__main__':
    root_guard()
    runpy.run_path(str(contained('audit_tools/pdf_accessibility/validate_candidates.py')),run_name='__main__')
