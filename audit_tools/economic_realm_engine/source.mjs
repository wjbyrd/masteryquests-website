import vm from 'node:vm';
export function declaration(source, name) {
  const match = new RegExp(`^(?:const|let|var) ${name}\\s*=`, 'm').exec(source);
  if (!match) throw Error(`Missing declaration ${name}`);
  const expressionStart = match.index + match[0].length;
  for (let end = expressionStart; end < source.length; end++) {
    if (!['}', ';', '\n'].includes(source[end])) continue;
    const expressionEnd = source[end] === '}' ? end + 1 : end;
    const expression = source.slice(expressionStart, expressionEnd).trim();
    if (!expression) continue;
    try {
      new vm.Script(`(${expression})`);
      return source.slice(match.index, source[expressionEnd] === ';' ? expressionEnd + 1 : expressionEnd);
    } catch {}
  }
  throw Error(`Unterminated ${name}`);
}
export function fn(source, name) {
  const match = new RegExp(`^[ \\t]*(?:async )?function ${name}\\(`, 'm').exec(source);
  if (!match) throw Error(`Missing function ${name}`);
  for (let end = source.indexOf('}', match.index); end >= 0; end = source.indexOf('}', end + 1)) {
    const text = source.slice(match.index, end + 1);
    try { new vm.Script(text); return text.trimStart(); } catch {}
  }
  throw Error(`Unterminated ${name}`);
}
export function value(source, name) {
  return vm.runInNewContext(`${declaration(source, name)}; ${name}`);
}
export const games = ['market-gate', 'national-ledger', 'equilibrium-crisis', 'liquidity-grid', 'stabilization-protocol'];
export const templatePath = 'build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html';
export const baselineCommit = '4c4335bba1f98580bb39cae2fe397c0682ba094d';
