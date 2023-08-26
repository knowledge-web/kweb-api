const fs = require('fs')
const path = require('path')
const { extractMeta } = require('./extractMeta')

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
console.log(`${nodes.length} not forgotten`)

nodes.forEach(node => {
  const content = getContent(node.Id)
  const meta = extractMeta({ md: content }) // this is the crude extaractor

  // Test stuff here...

  // if (!meta.born) return
  // const { date, location } = extractLocationDate(meta.born)
  // console.log(meta.born)
  // console.log(date, '---', location)
})