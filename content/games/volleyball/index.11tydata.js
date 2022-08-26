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
  for (let i = 0; i < 12; i++) {
    const d = `${1 + Math.floor(i / 4)}`;
    const p = i % 4;

    const key1 = `h-${p}-${d}`;
    card[key1] = card.Hits[p] === d ? 1 : 0;
    const key2 = `c-${p}-${d}`;
    card[key2] = card.Catches[p] === d ? 1 : 0;
  }
}

function findSummary(card, cards) {
  if (card.variant !== 'summary') return;

  for (const other of cards) {
    if (other.variant !== 'play' || other.Name !== card.Name) return;

    for (let i = 0; i < 12; i++) {
      const d = `${1 + Math.floor(i / 4)}`;
      const p = i % 4;

      let key = `h-${p}-${d}`;
      card[key] = card[key] || 0;
      if (other.Hits[p] === d) {
        card[key]++;
      }

      key = `c-${p}-${d}`;
      card[key] = card[key] || 0;
      if (other.Catches[p] === d) {
        card[key]++;
      }
    }
  }
}

function sort(data) {
  data.sort((a, b) => {
    if (a.Name !== b.Name) return a.Name.localeCompare(b.Name);
    return a.variant.localeCompare(b.variant);
  });
}

module.exports = loadVolleyballCards;
