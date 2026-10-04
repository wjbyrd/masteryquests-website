// Standing figures retain the cast's faces and MQ colors; no external asset.
export function portrait(role) {
  const rival=role==='rival';
  return `<svg class="character-portrait" viewBox="0 0 80 152" aria-hidden="true">
    <ellipse cx="40" cy="147" rx="34" ry="5" fill="#03163844"/>
    <path d="M23 84H57L55 140H42L39 106 36 140H22Z" fill="${rival?'#122840':'#294b58'}"/>
    <path d="M21 137h15v10H14v-5Zm21 0h14l9 7v3H42Z" fill="#10263c"/>
    <path d="M19 49Q39 39 60 50L66 87 54 91H22L14 87Z" fill="${rival?'#244667':'#e9eee0'}" stroke="#15364c" stroke-width="2"/>
    <path d="M18 53L8 85 17 97 24 91 18 81 28 61M58 53l11 28-8 17-8-4 7-15-10-18" fill="${rival?'#244667':'#e9eee0'}" stroke="#15364c" stroke-width="2"/>
    <path d="M17 88l8 3-3 10-7-5Zm38 2 8 3-4 10-7-5Z" fill="#c98965"/>
    <g transform="translate(8 0)">
    <path d="M26 40h12v14l-6 7-6-7" fill="#b97551"/>
    <path d="M17 22Q17 6 32 6Q48 6 48 23L45 38Q40 47 32 47Q23 46 19 37Z" fill="${rival?'#c98965':'#e5b187'}"/>
    <path d="M16 27V18Q16 2 34 3Q51 4 49 25L43 20 40 13Q31 21 20 19L20 29Z" fill="${rival?'#d3d8d1':'#453a34'}"/>
    <path d="M24 29h4m9 0h4" stroke="#183043" stroke-width="3"/>
    <path d="M28 38q5 ${rival?'1':'5'} 10-1" fill="none" stroke="#754536" stroke-width="2"/>
    ${rival?'<path d="M21 49l11 12 11-12-4 33H26Z" fill="#f2eedb"/><path d="M30 59h4l3 19-5 5-5-5Z" fill="#31c1b1"/>':'<path d="M20 27h11v7H20Zm14 0h11v7H34Z" fill="none" stroke="#173b4b" stroke-width="2"/><path d="M31 30h3" stroke="#173b4b"/><path d="M20 51l7 30m17-30-7 30" stroke="#147e77" stroke-width="4"/><rect x="29" y="69" width="8" height="11" rx="1" fill="#16436a"/>'}
    </g>${rival?'':'<path d="M5 87l15-3 6 25-16 3Z" fill="#136c6a" stroke="#c3dfce" stroke-width="2"/>'}
  </svg>`;
}
