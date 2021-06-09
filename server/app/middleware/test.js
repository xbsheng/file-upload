'use strict'
// options === app.config.test
module.exports = options => async (ctx, next) => {
  console.log(options)
  console.log(ctx.get('user-agent'))
  await next()
}
