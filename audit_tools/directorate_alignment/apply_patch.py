"""Apply reviewed content changes after the faculty publisher, with conflict checks.

Run from any directory. --check is read-only; --validate requires every patch to
be present. No private assessment sources are read by this tool.
"""
from pathlib import Path
import argparse
import ast
import copy
import hashlib
import json
import math
import operator
import re
import unicodedata

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
GAMES = ("cost-directive", "market-signal", "strategy-desk", "agency-protocol")
DECLARATION = re.compile(r"(?:const |window\.)(questionBanks|microSkillRepairPools|microSkillBridgePools|repairPoolGroups|bridgePoolGroups) = ")


def normalized(value):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", value).strip()).lower()


def fingerprint(record):
    return hashlib.sha256(json.dumps(record, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()


def inspect(source):
    sections = []
    records = {}
    for match in DECLARATION.finditer(source):
        pools, length = json.JSONDecoder().raw_decode(source[match.end():])
        sections.append((match.end(), match.end() + length, pools))
        for pool in pools.values():
            for record in pool:
                identity = str(record["id"])
                if identity in records:
                    raise ValueError(f"Duplicate ID {identity}")
                records[identity] = record
    if len(sections) != 3:
        raise ValueError("Expected one main bank and two auxiliary maps")
    return sections, records


def validate_records(records):
    required = ("q", "options", "aHash", "tag", "type", "objective", "primarySkill", "repairSkill", "commonError", "feedback")
    for identity, record in records.items():
        if any(not record.get(field) for field in required) or not isinstance(record.get("secondarySkills"), list):
            raise ValueError(f"Missing metadata: {identity}")
        options = record["options"]
        if len(options) != 4 or len(set(map(normalized, options))) != 4:
            raise ValueError(f"Invalid option set: {identity}")
        hits = sum(hashlib.sha256(normalized(option).encode()).hexdigest() == record["aHash"] for option in options)
        if hits != 1:
            raise ValueError(f"Hash matches {hits} options: {identity}")
        if "a" in record or "answer" in record:
            raise ValueError(f"Plaintext answer key: {identity}")


def arithmetic(expression):
    binary = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}
    def visit(node):
        if isinstance(node, ast.Constant) and type(node.value) in (int, float):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in binary:
            return binary[type(node.op)](visit(node.left), visit(node.right))
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
            return -visit(node.operand)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in ("min", "max") and not node.keywords:
            return {"min": min, "max": max}[node.func.id](*(visit(arg) for arg in node.args))
        raise ValueError("Unsupported arithmetic check")
    return visit(ast.parse(expression, mode="eval").body)


def plan_sources(sources, patches):
    """Build every proposed file in memory; support original, intermediate or final banks."""
    parsed = {game: inspect(source) for game, source in sources.items()}
    locations = {}
    for game, (sections, records) in parsed.items():
        # The declaration names, rather than their order, identify auxiliary maps.
        names = [m[1] for m in DECLARATION.finditer(sources[game])]
        for name, (_, _, pools) in zip(names, sections):
            for pool, questions in pools.items():
                for question in questions:
                    locations[(game, str(question['id']))] = (name, pool, question, questions)
    chains = {}
    relocated_origins = {}
    auxiliary_additions = set()
    for patch in patches:
        for addition in patch.get('auxiliaryPoolAdditions', []):
            if (addition['game'] not in GAMES or
                    addition['container'] not in ('microSkillRepairPools', 'microSkillBridgePools', 'repairPoolGroups', 'bridgePoolGroups') or
                    not re.fullmatch(r'[a-z][a-z0-9_]*', addition['pool'])):
                raise ValueError('Invalid auxiliary pool declaration')
            auxiliary_additions.add((addition['game'], addition['container'], addition['pool']))
        seen = set()
        for change in patch['changes']:
            key = (change['game'], str(change['id']))
            if key in seen or key[0] not in GAMES:
                raise ValueError(f'Invalid patch identity: {key}')
            seen.add(key)
            origin_key = relocated_origins.get(key, key)
            chain = chains.setdefault(origin_key, [])
            if chain and change['before'] != chain[-1]['after']:
                raise ValueError(f'Discontinuous patch history: {key}')
            chain.append(change)
            destination = change.get('destination')
            if destination:
                destination_key = (destination['game'], str(destination['id']))
                if destination_key != origin_key:
                    previous = relocated_origins.setdefault(destination_key, origin_key)
                    if previous != origin_key:
                        raise ValueError(f'Duplicate relocation destination: {destination_key}')
    pending = {game: 0 for game in GAMES}
    destinations = set()
    for key, chain in chains.items():
        last = chain[-1]
        destination = last.get('destination')
        destination_key = (destination['game'], str(destination['id'])) if destination else key
        if destination_key in destinations:
            raise ValueError(f'Duplicate patch destination: {destination_key}')
        destinations.add(destination_key)
        if destination_key != key and key in locations and destination_key in locations:
            raise ValueError(f'Relocation collision: {key} -> {destination_key}; no files written')
        location = locations.get(key) or locations.get(destination_key)
        current = fingerprint(location[2]) if location else None
        accepted = {change['before'] for change in chain} | {change['after'] for change in chain}
        if current not in accepted:
            raise ValueError(f'Upstream conflict: {key[0]}/{key[1]}; no files written')
        if location and current != last['after']:
            accepted_locations = set()
            for change in chain:
                source_location = change.get('source')
                target_location = change.get('destination') or source_location
                if current == change['before'] and source_location:
                    accepted_locations.add((source_location['container'], source_location['pool']))
                if current == change['after'] and target_location:
                    accepted_locations.add((target_location['container'], target_location['pool']))
            if accepted_locations and (location[0], location[1]) not in accepted_locations:
                raise ValueError(f'Unexpected source pool: {key}; no files written')
        if last['after'] is None:
            if not last.get('retire') or destination:
                raise ValueError(f'Invalid retirement: {key}; no files written')
            if location:
                location[3].remove(location[2])
                pending[key[0]] += 1
            continue
        already = current == last['after'] and (not destination or (
            location and destination_key in locations and
            (location[0], location[1]) == (destination['container'], destination['pool'])))
        if already:
            continue
        record = copy.deepcopy(location[2]) if location else copy.deepcopy(chain[0].get('record'))
        if record is None:
            raise ValueError(f'Missing source record: {key}')
        for change in chain:
            record.update(change.get('fields', {}))
            for field in change.get('removeFields', []):
                record.pop(field, None)
        if fingerprint(record) != last['after']:
            raise ValueError(f'Patch fingerprint mismatch: {key}')
        if destination:
            target_sections = parsed[destination['game']][0]
            target_names = [m[1] for m in DECLARATION.finditer(sources[destination['game']])]
            target_pools = target_sections[target_names.index(destination['container'])][2]
            if destination['pool'] not in target_pools:
                declaration = (destination['game'], destination['container'], destination['pool'])
                if declaration not in auxiliary_additions:
                    raise ValueError(f'Undeclared destination pool: {declaration}')
                target_pools[destination['pool']] = []
            target = target_pools[destination['pool']]
        else:
            target = location[3]
        if location and target is location[3]:
            target[target.index(location[2])] = record
        else:
            if location:
                location[3].remove(location[2])
            target.append(record)
        pending[key[0]] += 1
        if destination_key[0] != key[0]:
            pending[destination_key[0]] += 1
    proposed = {}
    counts = {}
    for game, (sections, _) in parsed.items():
        records = {}
        for _, _, pools in sections:
            for questions in pools.values():
                for record in questions:
                    key = str(record['id'])
                    if key in records:
                        raise ValueError(f'Duplicate final ID: {game}/{key}')
                    records[key] = record
        validate_records(records)
        counts[game] = {'records': len(records), 'pending': pending[game]}
        source = sources[game]
        if pending[game]:
            for start, end, pools in reversed(sections):
                source = source[:start] + json.dumps(pools, ensure_ascii=False, indent=2) + source[end:]
        proposed[game] = source
    numeric_checks = [check for patch in patches for check in patch['numericChecks']]
    for check in numeric_checks:
        if not math.isclose(arithmetic(check['expression']), check['expected'], abs_tol=1e-9):
            raise ValueError(f"Numeric check failed: {check['game']}/{check['id']}")
    return proposed, counts, len(numeric_checks)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()
    patches = [json.loads((HERE / name).read_text(encoding='utf-8'))
               for name in ('content-patch.json', 'continuation-patch.json', 'cost-standard-patch.json', 'market-standard-patch.json', 'strategy-standard-patch.json')]
    paths = {}
    sources = {}
    for game in GAMES:
        path = ROOT / "play/managerial-intelligence-directorate" / game / (game.replace("-", "_") + "_question_bank_student.js")
        paths[game] = path
        sources[game] = path.read_text(encoding='utf-8-sig')
    proposed, counts, numeric_count = plan_sources(sources, patches)
    package = json.loads((HERE / 'package-patch.json').read_text(encoding='utf-8'))
    text_proposals = {}
    package_pending = 0
    def public_path(relative):
        path = (ROOT / relative).resolve()
        if not path.is_relative_to(ROOT / 'play/managerial-intelligence-directorate'):
            raise ValueError('Package path escapes Directorate')
        return path
    for change in package['textChanges'] + [change for patch in patches for change in patch.get('textChanges', [])]:
        path = public_path(change['path'])
        source = text_proposals.get(path, path.read_text(encoding='utf-8-sig'))
        if change['after'] in source and change['before'] not in source:
            continue
        if source.count(change['before']) != 1 or change['after'] in source:
            raise ValueError(f'Package text conflict: {path.name}; no files written')
        text_proposals[path] = source.replace(change['before'], change['after'], 1)
        package_pending += 1
    for asset in package['requiredAssets'] + [asset for patch in patches for asset in patch.get('requiredAssets', [])]:
        path = public_path(asset['path'])
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != asset['sha256']:
            raise ValueError(f'Required practice asset missing or changed: {path.name}')
    retired = []
    for asset in package['retiredAssets']:
        path = public_path(asset['path'])
        if path.exists():
            if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != asset['sha256']:
                raise ValueError(f'Retired asset conflict: {path.name}; no files written')
            retired.append(path)
            package_pending += 1
    if args.validate and (any(count['pending'] for count in counts.values()) or package_pending):
        raise ValueError('Pending changes remain')
    # All upstream, answer, and arithmetic checks finish before the first write.
    if not args.check and not args.validate:
        for game, source in proposed.items():
            if source != sources[game]:
                paths[game].write_text(source, encoding="utf-8", newline="\n")
        for path, source in text_proposals.items():
            path.write_text(source, encoding='utf-8', newline='\n')
        for path in retired:
            path.unlink()
    print(json.dumps({"pass": True, "games": counts, "packagePending": package_pending, "numericChecks": numeric_count, "readOnly": args.check or args.validate}))


if __name__ == "__main__":
    main()
