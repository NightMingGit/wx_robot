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
  triggerEvent(req.body as msg)
  // 转发给py
  try {
    sendBody(req.body)
  }
  catch (e) {
    console.log('转发py失败')
  }
  res.send({
    status: '0',
    message: 'success',
  })
})

ViteExpress.listen(app, 3005, () => {
  logger.info('Server is listening on port 3005...')
})
