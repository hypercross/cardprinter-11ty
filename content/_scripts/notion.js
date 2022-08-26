const { Client } = require('@notionhq/client');

async function loadNotionDB(link) {
  const client = new Client({
    baseUrl: 'https://notion.helios-tnak.workers.dev',
  });

  const database_id = new URL(link).pathname.slice(1);
  const { results } = await client.databases.query({ database_id });
  const items = [];

  results.forEach((item) => {
    if (!('properties' in item)) return;

    const entry = {};
    items.push(entry);

    for (const key in item.properties) {
      const prop = item.properties[key];

      const val =
        prop.type === 'number'
          ? prop.number
          : prop.type === 'rich_text'
          ? rich2markdown(prop.rich_text)
          : prop.type === 'title'
          ? rich2markdown(prop.title)
          : prop.type === 'files'
          ? !prop.files[0]
            ? null
            : prop.files[0].type === 'file'
            ? prop.files[0].file.url
            : prop.files[0].type === 'external'
            ? prop.files[0].external.url
            : null
          : prop.type === 'select'
          ? prop.select?.name
          : prop.type === 'url'
          ? prop.url
          : prop.type === 'checkbox'
          ? prop.checkbox
          : prop.type === 'multi_select'
          ? prop.multi_select.map((item) => item.name)
          : null;

      entry[key] = val;
    }
  });

  return items;
}

function rich2markdown(rich) {
  return rich
    .map((r) => decorate(r.plain_text, r.annotations))
    .join('')
    .replace(/\n/g, '\n\n');
}

function decorate(txt, deco) {
  if (deco.bold) txt = `**${txt}**`;
  else if (deco.italic) txt = `*${txt}*`;
  if (deco.code) txt = '`' + txt + '`';
  return txt;
}

module.exports = {
  loadNotionDB,
};
