const fs = require('fs')
const path = require('path')
const { extractMeta } = require('./extractMeta')
const { Thoughts, Links } = require('./brain')

const brainDir = process.env.BRAIN_DIR || '../../Brain/B02'
const brainJsonDir = process.env.BRAIN_JSON_DIR ? process.env.BRAIN_JSON_DIR : path.join(brainDir, '../db') // ex '../Brain/db'

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
const ignore = fs.readFileSync('../wiki-links/ignore.tsv', 'utf8')
const ignoreNames = ignore.split('\n').map(line => line.split('\t')[0])
nodes = nodes.filter(n => !ignoreNames.includes(n.Name))
console.log(`${nodes.length} not forgotten, "Normal" nodes, not in ../wiki-links/ignore.tsv`)

function extractWikiLink(md, linkName) {
  // Regular expression pattern to match Markdown links with the given name
  // This pattern restricts URLs to common characters to avoid newlines and other extraneous text.
  const pattern = new RegExp(`\\[${linkName}\\]\\((https?://[\\w\\-\\.]*wikipedia\\.org[\\w\\-\\.:/?=&%#]*)\\)`, 'i');
  const match = md.match(pattern)
  if (match && match[1]) return match[1]  // Return the URL of the named link
  return ''
}

// const meta = extractMeta({ md: content }) // this is the crude extaractor
nodes.forEach(node => {
  const content = getContent(node.Id)
  let link = extractWikiLink(content, 'Wikipedia') || extractWikiLink(content, node.Name)
  link = link.replaceAll('http://', 'https://')
  // if (link) console.log(link)
})
