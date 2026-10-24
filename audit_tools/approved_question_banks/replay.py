"""Replay the approved public bank sources after the historical publishers."""
from pathlib import Path
import hashlib
import json
import re
import unicodedata

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BANKS = {b['game']: b for b in json.loads((HERE / 'source-patches.json').read_text(encoding='utf-8'))['banks']}

def digest(source):
    return hashlib.sha256(source.encode()).hexdigest()

def transform(bank, source, reverse=False):
    edits = []
    delta = 0
    for edit in bank['edits']:
        start = edit['start'] + (delta if reverse else 0)
        before, after = (edit['after'], edit['before']) if reverse else (edit['before'], edit['after'])
        edits.append((start, start + len(before), before, after))
        delta += len(edit['after']) - len(edit['before'])
    for start, end, before, after in reversed(edits):
        if source[start:end] != before:
            raise ValueError(f"Unexpected source context: {bank['game']}; no files written")
        source = source[:start] + after + source[end:]
    expected = bank['before' if reverse else 'after']
    if digest(source) != expected:
        raise ValueError(f"Unexpected resulting fingerprint: {bank['game']}; no files written")
    return source

def rewind_game(game, source):
    source = source.replace('\r\n', '\n')
    bank = BANKS.get(game)
    return transform(bank, source, True) if bank and digest(source) == bank['after'] else source

def apply_game(game, source):
    source = source.replace('\r\n', '\n')
    bank = BANKS.get(game)
    if not bank or digest(source) == bank['after']:
        return source
    if digest(source) != bank['before']:
        raise ValueError(f"Unreviewed bank drift: {game}; no files written")
    return transform(bank, source)

def check():
    results = []
    for game, bank in BANKS.items():
        source = (ROOT / bank['path']).read_text(encoding='utf-8-sig')
        assert digest(source) == bank['after'], game
        before = rewind_game(game, source)
        assert digest(before) == bank['before'], game
        assert apply_game(game, before) == source == apply_game(game, source), game
        try:
            apply_game(game, before + '\n')
        except ValueError:
            pass
        else:
            raise AssertionError('Drift must be rejected: ' + game)
        results.append({'game': game, 'questions': bank['questionCount'], 'roundTrip': True, 'idempotent': True, 'rejectsDrift': True})
    authoring = check_labyrinth_authoring()
    print(json.dumps({'pass': True, 'banks': results, 'authoring': authoring}))

def check_labyrinth_authoring():
    source = (ROOT / BANKS['labyrinth-of-choice']['path']).read_text(encoding='utf-8-sig')
    markers = {'questionBanks': '"questionBanks": ', 'microSkillRepairPools': 'const microSkillRepairPools = ', 'microSkillBridgePools': 'const microSkillBridgePools = '}
    pools = {name: json.JSONDecoder().raw_decode(source.split(marker, 1)[1])[0] for name, marker in markers.items()}
    published = {}
    for name, groups in pools.items():
        for pool, records in groups.items():
            for record in records:
                assert record['id'] not in published, 'Duplicate Labyrinth ID'
                published[record['id']] = (name, pool, record)
    results = []
    directory = ROOT / 'play/micro-domains/labyrinth-of-choice/authoring'
    for path in sorted(directory.glob('*.json')):
        authored = json.loads(path.read_text(encoding='utf-8-sig'))
        seen = set()
        for name in markers:
            for pool, records in authored[name].items():
                for record in records:
                    identity = record['id']
                    assert identity not in seen, (path.name, identity, 'duplicate')
                    seen.add(identity)
                    target_name, target_pool, target = published[identity]
                    assert (name, pool) == (target_name, target_pool), (path.name, identity, 'pool')
                    for field in ['q', 'options', 'feedback', 'difficulty', 'objective', 'primarySkill', 'secondarySkills', 'repairSkill', 'image', 'imageAlt', 'graphRequired', 'graphDescription']:
                        assert record.get(field) == target.get(field), (path.name, identity, field)
                    if 'aHash' in target:
                        answer = re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', target['options'][record['a']]).strip()).lower()
                        assert digest(answer) == target['aHash'], (path.name, identity, 'answer hash')
                    else:
                        assert target['a'] == record['a'], (path.name, identity, 'answer')
        if path.name == 'labyrinth_of_choice_question_bank_author.json':
            assert seen == set(published), 'Primary authoring inventory mismatch'
        results.append({'file': path.relative_to(ROOT).as_posix(), 'records': len(seen), 'pass': True})
    assert len(results) == 2, 'Expected both existing Labyrinth authoring files'
    return results

if __name__ == '__main__':
    check()
