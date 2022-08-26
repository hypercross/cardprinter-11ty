const { loadNotionDB } = require('../../_scripts/notion');
const _ = require('lodash');

async function loadVolleyballCards() {
  const cards = await loadNotionDB(
    'https://nine-newsprint-c9d.notion.site/c76abae545e04b09aed98e5c7ac9aba6?v=3f03e3dc31cd440b972f937f56e000f6'
  );
  const [extra] = await loadNotionDB(
    'https://nine-newsprint-c9d.notion.site/248a1ac98aa04b7695a2aaa9eb1e0af3?v=868764bf9803459caaff16184a2777da'
  );
  cards.forEach((card) => {
    _.merge(card, extra);
    findBalls(card);
    findSummary(card, cards);
  });

  sort(cards);
  return { items: cards };
}

function findBalls(card) {
  if (card.variant !== 'play') return;
  for (let p = 0; p < 4; p++) {
    const key1 = `h-${p}`;
    card[key1] = card.Hits[p];
    const key2 = `c-${p}`;
    card[key2] = card.Catches[p];
  }
}

function findSummary(card, cards) {
  if (card.variant !== 'summary') return;

  for (let p = 0; p < 4; p++) {
    const key1 = `h-${p}`;
    card[key1] = card[key1] || [0, 0, 0, 0];
    const key2 = `c-${p}`;
    card[key2] = card[key2] || [0, 0, 0, 0];

    for (const other of cards) {
      if (other.variant !== 'play' || other.Name !== card.Name) return;
      card[key1][`${other.Catches[p]}`]++;
      card[key2][`${other.Hits[p]}`]++;
    }

    card[key1] = card[key1].join(', ');
    card[key2] = card[key2].join(', ');
  }
}

function sort(data) {
  data.sort((a, b) => {
    if (a.Name !== b.Name) return a.Name.localeCompare(b.Name);
    return a.variant.localeCompare(b.variant);
  });
}

module.exports = loadVolleyballCards;
