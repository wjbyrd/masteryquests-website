"""Repository-locked PDF audit primitives. No PDF mutation or implicit installation."""
from pathlib import Path
import hashlib, json, os, subprocess

EXPECTED_ROOT = Path(r'C:\Users\Jennings\Documents\GitHub\masteryquests-website')
TASK = 'PDF_ACCESSIBILITY_REPO_LOCK_V1'

def root_guard():
    expected = EXPECTED_ROOT.resolve(strict=True)
    if expected != EXPECTED_ROOT.absolute():
        raise RuntimeError('STOP: authorized root resolves through a redirected path')
    if Path.cwd().resolve(strict=True) != expected:
        raise RuntimeError('STOP: working directory is not the authorized checkout')
    actual = Path(subprocess.check_output(['git', '-C', str(expected), 'rev-parse', '--show-toplevel'], text=True).strip()).resolve(strict=True)
    if actual != expected or Path(__file__).resolve().parents[2] != expected:
        raise RuntimeError('STOP: wrong Git root or tool location')
    for relative in ('concept-reviews', 'build/faculty-build-composer/data/concept-reviews'):
        if not contained(relative, expected).is_dir():
            raise RuntimeError('STOP: missing active resource directory')
    return expected

def contained(value, root=None):
    root = (root or EXPECTED_ROOT).resolve(strict=True)
    value = Path(value)
    if '..' in value.parts:
        raise ValueError('Traversal rejected')
    candidate = value if value.is_absolute() else root / value
    resolved = candidate.resolve(strict=False)
    if not resolved.is_relative_to(root):
        raise ValueError('Path escapes authorized repository')
    # Reject reparse points including junctions, even those pointing into the root.
    cursor = candidate
    while cursor != root:
        if cursor.exists() and (cursor.is_symlink() or cursor.is_junction()):
            raise ValueError('Symlink/junction rejected')
        if cursor == cursor.parent:
            raise ValueError('Unrooted path')
        cursor = cursor.parent
    return resolved

def sha(path):
    return hashlib.sha256(contained(path).read_bytes()).hexdigest()

def read_json(path):
    return json.loads(contained(path).read_text(encoding='utf-8-sig'))

def write_json(path, value):
    path = contained(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')