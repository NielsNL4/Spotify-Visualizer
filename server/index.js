require('dotenv').config()

const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const fallback = require('express-history-api-fallback')
const compression = require('compression')

const apps = express()
const root = path.resolve(__dirname, '../dist')
const port = process.env.PORT || 8001

if (process.env.NODE_ENV === 'development') {
  apps.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  apps.get('/', (req, res) => {
    res.redirect('http://localhost:8080')
  })
}

apps.use(cookieParser())
apps.use(compression())

if (process.env.NODE_ENV === 'production') {
  apps.use(express.static(root))
}

apps.use('/auth', require('./routes/auth'))
apps.use('/callback', require('./routes/callback'))
apps.use('/login', require('./routes/login'))
apps.use('/refresh', require('./routes/refresh'))

apps.use(fallback('index.html', { root }))

apps.listen(port, () => console.log('Listening on port ' + port))
