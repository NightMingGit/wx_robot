import express from 'express'
import ViteExpress from 'vite-express'
import logger from '@server/logger'
import '@server/models/index'
// import '@server/models/redis'
import '@server/job/index'
import { triggerEvent } from '@server/events/event'
import type { msg } from '@server/type/type'
import { sendBody } from '@server/api/system'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.post('/robot', (req, res) => {
  triggerEvent(req.body as msg).then().catch((err) => {
    logger.error(err)
  })
  sendBody(req.body).then(() => {}).catch(() => {
    // logger.error(err)
  })
  res.send({
    status: '0',
    message: 'success',
  })
})

ViteExpress.listen(app, 3005, () => {
  logger.info('Server is listening on port 3005...')
})
