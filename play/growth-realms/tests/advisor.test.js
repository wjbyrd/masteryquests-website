import test from 'node:test';
import assert from 'node:assert/strict';
import {createCities,advanceCity} from '../model.js';
import {openingAdvice,roundOneAdvice} from '../advisor.js';

test('Opening recommendations reflect each city’s starting equipment base',()=>{
  const [meridian,rivermark]=createCities();
  assert.ok(meridian.capitalPerWorker>rivermark.capitalPerWorker);
  assert.equal(openingAdvice(meridian).category,'education');
  assert.equal(openingAdvice(rivermark).category,'capital');
});
test('Round-one coaching follows resolved investments and constraints without changing the run',()=>{
  const initial=createCities(),frontier=Math.max(...initial.map(c=>c.technology));
  for(const city of initial)for(const key of ['capital','resources','research','education']){
    const a={capital:0,resources:0,research:0,education:0,[key]:20};
    const resolved=advanceCity(city,a,1,frontier),before=structuredClone(resolved),line=roundOneAdvice(resolved);
    assert.deepEqual(resolved,before);
    assert.match(line,{capital:/new equipment/,resources:/food, water and utilities/,research:/develop better methods/,education:/building people’s skills/}[key]);
    if(resolved.constraints.resourceShortage)assert.match(line,/still stretched/);
    if(!resolved.constraints.resourceShortage&&resolved.constraints.technologyAdoption)assert.match(line,/Training is lagging/);
  }
  const small=initial.find(c=>c.id==='rivermark');
  assert.match(roundOneAdvice(advanceCity(small,{capital:20,resources:0,research:0,education:0},1,frontier)),/Consider Resources/);
  assert.match(roundOneAdvice(advanceCity(small,{capital:0,resources:0,research:20,education:0},1,frontier)),/Schools could help/);
  assert.equal(roundOneAdvice(small),'');
});
