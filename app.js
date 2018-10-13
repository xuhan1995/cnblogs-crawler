import express from 'express'
import chalk from 'chalk'
import handler from './middleware/handler'

const app = express()

app.all('*', (req, res, next) => {
  res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
  next()
})

app.use(handler)

app.listen(8080, () => {
  console.log(
    chalk.green('成功监听端口：8080')
  )
})