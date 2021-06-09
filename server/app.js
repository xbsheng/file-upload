module.exports = app => {
  app.on('request', ctx => {
    console.log('request===============================================')
  })
  app.zxc = '[zxc]'
}
