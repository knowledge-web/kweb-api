const express = require('express')
const api = require('./api')
const port = process.env.PORT || 7575

const app = express()

app.use('/', express.static('./ui'))

app.use('/api/v0', api)

app.get('/robots.txt', (req, res) => {
  if (process.env.ROBOTS_OK) return res.sendStatus(404)
  res.send('User-agent: *\nDisallow: /')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
