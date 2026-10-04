// Read-only presentation advice. Never changes allocations or simulation state.
export function openingAdvice(city) {
  return city.id==='meridian'
    ? {category:'education',reason:'Our industry is already strong. Training helps people get more from that equipment.',instruction:'Click the glowing Schools district to invest your first point.'}
    : {category:'capital',reason:'We’re building our base. Industry adds equipment to help our small city produce more.',instruction:'Click the glowing Industry district to invest your first point.'};
}

export function roundOneAdvice(city) {
  const h=city.history[0];
  if(!h)return '';
  const a=h.allocation,c=city.constraints;
  let progress=h.endState.output>h.startState.output?'Production rose this round.':h.endState.output<h.startState.output?'Production slipped this round.':'Production held steady this round.';
  if(a.capital>=8&&h.endState.capital>h.startState.capital)progress='Our new equipment is in place.';
  else if(a.education>=8&&h.endState.education>h.startState.education)progress='Our investment is building people’s skills.';
  else if(a.resources>=8&&h.endState.resources>h.startState.resources)progress='We’ve strengthened food, water and utilities.';
  else if(a.research>=8&&h.endState.researchCapacity>h.startState.researchCapacity)progress='We’ve built more capacity to develop better methods.';
  const next=c.resourceShortage?'Food, water and utilities are still stretched. Consider Resources next.'
    :c.technologyAdoption?'Training is lagging behind our tools. Schools could help people put them to work.'
    :c.skillsUnderused?'Our trained workers need more equipment. Industry could help them use their skills.'
    :c.capitalSaturation?'We already have plenty of equipment. Consider training or better methods next.'
    :a.education===0?'We haven’t funded training yet. Consider helping people make more of what we build.'
    :a.research===0?'We haven’t funded new methods yet. Research is another direction to consider.'
    :'Now watch which district needs support as the city grows.';
  return `${progress} ${next}`;
}
