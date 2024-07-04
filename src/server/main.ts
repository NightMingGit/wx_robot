import express from 'express'
import ViteExpress from 'vite-express'

const app = express()

app.get('/hello', (_, res) => {
  res.send('Hello Vite + Vue + TypeScript!')
})

ViteExpress.listen(app, 3000, () =>
// eslint-disable-next-line no-console
  console.log('Server is listening on port 3000...'))
