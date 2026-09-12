"""Manifest-complete, read-only release gate for reviewed staged candidates.

Machine PASS is distinct from semantic/visual PASS. Missing records fail closed.
This never installs files or updates the active manifest.
"""
from repo_guard import *
from install_validated import prepare, MANIFEST
import argparse


def assess(validation, review_path):
    root_guard()
    manifest = read_json(MANIFEST)
    expected = {r['code'] for r in manifest['reviews']}
    records = {r['code']: r for r in validation}
    if len(records) != len(validation):
        raise ValueError('Duplicate staged resource')
    review = read_json(review_path)
    results = []
    for code in sorted(expected | set(records)):
        errors = []
        row = records.get(code)
        approved = review.get('records', {}).get(code, {})
        if code not in expected:
            errors.append('RESOURCE_NOT_ACTIVE')
        if not row:
            errors.append('MISSING_VALIDATED_CANDIDATE')
        else:
            try:
                if not row.get('deterministic') or sha(row['determinismRebuild']) != row['sha256']:
                    errors.append('REPRODUCTION_MISMATCH')
                prepare([row], review_path)
            except (ValueError, KeyError, FileNotFoundError) as exc:
                errors.append(str(exc))
        results.append({'code': code, 'status': 'BLOCKED' if errors else 'PASS',
                        'errors': errors, 'reviewBlockers': approved.get('blockers', []),
                        'candidateSha256': row.get('sha256') if row else None})
    return {'task': review.get('task','PDF_ACCESSIBILITY_FULL_BATCH_V1'), 'manifestSha256': sha(MANIFEST),
            'activeCount': len(expected), 'records': results,
            'passed': sum(r['status'] == 'PASS' for r in results),
            'blocked': sum(r['status'] != 'PASS' for r in results),
            'activeInstallPerformed': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--validation', required=True)
    parser.add_argument('--review', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    result = assess(read_json(args.validation), args.review)
    output = contained(args.output)
    if not output.is_relative_to(contained('validation_artifacts/pdf_accessibility')):
        raise ValueError('Gate evidence must stay in the PDF evidence directory')
    write_json(output, result)
    print(json.dumps({k: v for k, v in result.items() if k != 'records'}))
    raise SystemExit(1 if result['blocked'] else 0)
