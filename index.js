const express = require('express')
const fs = require('fs')
const resolve = require('path').resolve

const api = require('./api')
const port = process.env.PORT || 7575

const app = express()

const uiDir = resolve(process.env.UI_DIR || '../kweb-ui')
console.log(`looking for UI in "${uiDir}"`)
// if folder exists
if (require('fs').existsSync(uiDir)) {
  app.use('/', express.static(uiDir))
} else {
  console.log('UI folder not found, skipping UI.')
}

app.use('/api/v0', api)

app.get('/robots.txt', (req, res) => {
  if (process.env.ROBOTS_OK) return res.sendStatus(404)
  res.send('User-agent: *\nDisallow: /')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
