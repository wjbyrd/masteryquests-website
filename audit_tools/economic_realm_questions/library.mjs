import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
export const games=['market-gate','national-ledger','equilibrium-crisis','liquidity-grid','stabilization-protocol'];
export const groupNames=['questionBanks','microSkillRepairPools','skillRepairSeedPools','microSkillBridgePools'];
export const profiles=JSON.parse(fs.readFileSync('audit_tools/economic_realm_engine/profiles.json','utf8'));
export const libraryPath='build/faculty-build-composer/data/composer_library.js';
export function readLibrary(){const s=fs.readFileSync(libraryPath,'utf8');return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));}
export function readBank(game,ref=null){const file=`play/economic-realm/${game}/${profiles[game].bank}`;const source=ref?execFileSync('git',['show',`${ref}:${file}`],{encoding:'utf8',maxBuffer:16e6}):fs.readFileSync(file,'utf8');const c=vm.createContext({});vm.runInContext(source,c);return Object.fromEntries(groupNames.map(name=>[name,JSON.parse(vm.runInContext(`JSON.stringify(typeof ${name}==='undefined'?{}:${name})`,c))]));}
export function bankRows(bank){return Object.entries(bank).flatMap(([group,pools])=>Object.entries(pools).flatMap(([pool,qs])=>qs.map((q,index)=>({group,pool,index,q}))));}
export function canonicalRows(library){return Object.entries(library.concepts).flatMap(([concept,m])=>[...Object.entries(m.questions||{}).flatMap(([pool,qs])=>qs.map(q=>({concept,pool,role:'main',q}))),...['repairQuestions','repairSeedQuestions','bridgeQuestions'].flatMap(role=>(m[role]||[]).map(q=>({concept,pool:role,role,q})))]);}
export const normalizeGame=s=>String(s||'').replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase();
export const normalize=s=>String(s).normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
export const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
export const answerHash=q=>q.aHash||hash(normalize(q.options[q.a]));
export const contentFields=['q','options','aHash','feedback','image','imageAlt','graphDescription','graphRequired','tag','type','objective','difficulty','canonicalDifficulty','primarySkill','secondarySkills','repairSkill','commonError','conceptCluster'];
export function uniqueCanonical(rows){const m=new Map();for(const r of rows){const id=String(r.q.canonicalId||r.q.id);if(!m.has(id))m.set(id,r);}return [...m.values()];}
