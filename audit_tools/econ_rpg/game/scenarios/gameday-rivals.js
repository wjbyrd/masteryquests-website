export default {
  id: 'gameday-rivals', version: 1, kind: 'repeated-strategy', title: 'Gameday Rivals',
  town: 'Alderwick', university: 'Alderwick University',
  firms: { player: { name: 'Copper Cart', color: '#f7983a', mark: 'P' }, rival: { name: 'Clover Run', color: '#55ce91', mark: 'R' } },
  introduction: 'Six home games. One town. The same rival. You manage Copper Cart in Alderwick, where students and visitors order from local restaurants on football weekends. Each game day, choose your offer without seeing Clover Run’s current decision. Both choices are revealed together.',
  actions: [
    { id: 'standard', label: 'Standard Promotion', short: 'Standard', detail: 'Keep normal game-day offers and protect margins.' },
    { id: 'aggressive', label: 'Aggressive Promotion', short: 'Aggressive', detail: 'Push a major discount to capture more game-day orders.' }
  ],
  rounds: [
    { key: 'home-opener', name: 'Big Home Opener', demand: 'High', multiplier: 1.15, pressure: .04, context: 'The first home crowd fills the town. Your rival has no season history with you yet; both platforms are preparing their opening offers.', image: 'round-01-home-opener.webp' },
    { key: 'small-team', name: 'Small-Team Game', demand: 'Low', multiplier: .80, pressure: .08, context: 'A smaller visiting team brings fewer travelers. The order pool is thinner, and the opening weekend offers your first clue about the rival.', image: 'round-02-small-team.webp' },
    { key: 'conference', name: 'Conference Game', demand: 'Medium-High', multiplier: 1, pressure: .05, context: 'Conference play brings more attention back to campus. Two observed weekends now inform your expectations about the same rival.', image: 'round-03-conference.webp' },
    { key: 'heated-rival', name: 'Heated Rival', demand: 'High', multiplier: 1.25, pressure: .10, context: 'A tense regional matchup packs the restaurants. A bigger market raises the stakes of winning orders and of paying for discounts.', image: 'round-04-heated-rival.webp' },
    { key: 'homecoming', name: 'Homecoming', demand: 'Very High', multiplier: 1.35, pressure: .08, context: 'Alumni, students and visitors fill the town for homecoming. Four weekends of shared market history sit behind today’s independent decisions.', image: 'round-05-homecoming.webp' },
    { key: 'biggest-rival', name: 'Biggest Rival', demand: 'Maximum', multiplier: 1.50, pressure: .12, context: 'The stadium lights come on for the season’s biggest home rivalry. Five games of history lead into the final decision, with the largest financial stakes of the season.', image: 'round-06-biggest-rival-night.webp' }
  ]
};
