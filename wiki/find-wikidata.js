//
// Usage: node find-wikidata.js > data.tsv
//

const axios = require('axios')
const fs = require('fs')

async function getWikiDataID(wikipediaURL) {
  const wikipediaTitle = wikipediaURL.split('/').pop();
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&format=json&titles=${wikipediaTitle}`;

  try {
    const response = await axios.get(apiUrl);
    const pages = response.data.query.pages;
    const pageID = Object.keys(pages)[0];
    const wikiDataID = pages[pageID].pageprops.wikibase_item;
    return wikiDataID;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// load wikilinks from links.tsv find wikidata ids and store in data.tsv
const lines = fs.readFileSync('links.tsv', 'utf8').split('\n').filter((line) => line)
lines.map(async (line) => {
  const link = line.split('\t')[2]
  const wikiDataID = await getWikiDataID(link)
  console.log(`${link}\t${wikiDataID}`)
})

// XXX the above returned a lot fo null values, ran tose again...h

// const lines = fs.readFileSync('missing-data.tsv', 'utf8').split('\n').filter((line) => line)
// lines.map(async (line) => {
//   const link = line.split('\t')[0]
//   const wikiDataID = await getWikiDataID(link)
//   console.log(`${link}\t${wikiDataID}`)
// })
