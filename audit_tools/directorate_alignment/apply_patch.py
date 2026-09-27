"""Apply reviewed content changes after the faculty publisher, with conflict checks.

Run from any directory. --check is read-only; --validate requires every patch to
be present. No private assessment sources are read by this tool.
"""
from pathlib import Path
import argparse
import ast
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()
    patch = json.loads((HERE / "content-patch.json").read_text(encoding="utf-8"))
    proposed = []
    counts = {}
    seen_changes = set()
    for change in patch["changes"]:
        identity = (change["game"], str(change["id"]))
        if identity in seen_changes or change["game"] not in GAMES:
            raise ValueError(f"Invalid patch identity: {identity}")
        seen_changes.add(identity)
    for game in GAMES:
        path = ROOT / "play/managerial-intelligence-directorate" / game / (game.replace("-", "_") + "_question_bank_student.js")
        source = path.read_text(encoding="utf-8-sig")
        sections, records = inspect(source)
        pending = 0
        for change in patch["changes"]:
            if change["game"] != game:
                continue
            record = records.get(str(change["id"]))
            current = fingerprint(record) if record else None
            if current not in (change["before"], change["after"]):
                raise ValueError(f"Upstream conflict: {game}/{change['id']}; no files written")
            if current == change["before"]:
                pending += 1
                record.update(change["fields"])
                if fingerprint(record) != change["after"]:
                    raise ValueError("Patch fingerprint mismatch")
        validate_records(records)
        if args.validate and pending:
            raise ValueError(f"{game}: {pending} pending changes")
        counts[game] = {"records": len(records), "pending": pending}
        if pending:
            for start, end, pools in reversed(sections):
                source = source[:start] + json.dumps(pools, ensure_ascii=False, indent=2) + source[end:]
            proposed.append((path, source))
    for check in patch["numericChecks"]:
        if not math.isclose(arithmetic(check["expression"]), check["expected"], abs_tol=1e-9):
            raise ValueError(f"Numeric check failed: {check['game']}/{check['id']}")
    # All upstream, answer, and arithmetic checks finish before the first write.
    if not args.check and not args.validate:
        for path, source in proposed:
            path.write_text(source, encoding="utf-8", newline="\n")
    print(json.dumps({"pass": True, "games": counts, "numericChecks": len(patch["numericChecks"]), "readOnly": args.check or args.validate}))


if __name__ == "__main__":
    main()
