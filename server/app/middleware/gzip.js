const isJSON = require('koa-is-json')
const zlib = require('zlib')

module.exports = options => async (ctx, next) => {
  await next()
  let body = ctx.body
  if (!body) return
  if (options && ctx.length < options.threshold) return
  if (isJSON(body)) body = JSON.stringify(body)
  const stream = zlib.createGzip()
  stream.end(body)
  ctx.body = stream
  ctx.set('Content-Encoding', 'gzip')
}
