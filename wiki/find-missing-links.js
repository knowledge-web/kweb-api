// 
// How to run:
// rm links.tsv && node find-missing-links.js
// 

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { extractMeta } = require('../api/extractMeta')
const { Thoughts, Links } = require('../api/brain')

const brainDir = process.env.BRAIN_DIR || '../../Brain/B02'
const brainJsonDir = process.env.BRAIN_JSON_DIR ? process.env.BRAIN_JSON_DIR : path.join(brainDir, '../db') // ex '../Brain/db'


async function searchWikipedia (searchQuery) {
  if (!searchQuery) return null
  try {
    const params = {
      action: 'query',
      list: 'search',
      srsearch: searchQuery,
      utf8: 1,
      format: 'json',
      origin: '*'
    };

    const { data } = await axios.get('https://en.wikipedia.org/w/api.php', { params });
    const results = data.query.search;
    if (results.length > 0) {
      const pageTitle = results[0].title;
      return `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;
    }

    return null
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

function getContent (id) {
  if (!/^[-0-9a-f]{36}$/.test(id)) return ''
  let dir = path.join(brainDir, id)
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return ''
  const file = path.join(dir, 'Notes.md')
  if (!fs.existsSync(file)) return ''
  return fs.readFileSync(file, 'utf8')
}

const filename = path.join(brainJsonDir, 'thoughts.json')
const raw = fs.readFileSync(filename)
let nodes = JSON.parse(raw)

nodes = nodes.filter(t => t.ForgottenDateTime === null) // exclude removed
nodes = nodes.filter(n => n.Kind === Thoughts.Kind.Normal) // only include normal thoughts

console.log(`${nodes.length} not forgotten, "Normal" nodes`)

// exclude ../wiki-links/ignore.tsv cross reference with nodes.Name
// NOTE perhaps instead exclude nodes with tag "journey" or "meta"
const ignore = fs.readFileSync('ignore.tsv', 'utf8')
const ignoreNames = ignore.split('\n').map(line => line.split('\t')[0])
nodes = nodes.filter(n => !ignoreNames.includes(n.Name))
console.log(`${nodes.length} not forgotten, "Normal" nodes, not in ignore.tsv`)

function extractWikiLink(md, linkName) {
  // Regular expression pattern to match Markdown links with the given name
  // This pattern restricts URLs to common characters to avoid newlines and other extraneous text.
  const pattern = new RegExp(`\\[${linkName}\\]\\((https?://[\\w\\-\\.]*wikipedia\\.org[\\w\\-\\.:/?=&%#]*)\\)`, 'i');
  const match = md.match(pattern)
  if (match && match[1]) return match[1]  // Return the URL of the named link
  return ''
}

const output = 'links.tsv'
const wikiLinks = {} // { id, name, link }
nodes.forEach(async (node) => {
  const content = getContent(node.Id)
  const meta = extractMeta({ md: content }, node) // this is the crude extaractor
  if (meta.wikipedia) {
    fs.appendFileSync(output, `${node.Id}\t${node.Name}\t${meta.wikipedia}\tmd\n`) // store these also
    return
  }
  
  meta.name = meta.name || ''
  // search wikipedia API for meta.name primarily, node.Name secundarily
  let link = await searchWikipedia(meta.name)
  if (!link) link = await searchWikipedia(node.Name)
  if (link) {
    wikiLinks[node.Id] = { id: node.Id, name: node.Name, link: '' }
    // add to tsv file
    console.log(`Link: ${link}`)
    fs.appendFileSync(output, `${node.Id}\t${node.Name}\t${link}\n`)
  } else {
    // fs.appendFileSync('still-missing.tsv', `${node.Id}\t${node.Name}\n`)
  }
})
