const fs = require('fs')

// load wikilinks from links.tsv find wikidata ids and store in data.tsv

const lines = fs.readFileSync('links.tsv', 'utf8').split('\n').filter((line) => line)
lines.map((line) => {
  const link = line.split('\t')[2]
  // TODO
})