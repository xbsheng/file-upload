'use strict'

const Controller = require('egg').Controller

class HomeController extends Controller {
  async index() {
    const { ctx, app } = this
    // 在继承于 Controller, Service 基类的实例中，可以通过 this.app 访问到 Application 对象
    ctx.body = {
      message: 'hi, egg',
      appZxc: app.zxc, // app.zxc 在app.js文件中挂载
      ctxAppZxc: ctx.app.zxc, // app.zxc === ctx.app.zxc
      helper: ctx.helper.testHelper(), // app/extend/helper.js
      config: this.config.keys,
    }
  }
  async testGzip() {
    // threshold: 1024 大于1024压缩
    const { ctx } = this
    ctx.body = this.config
  }
}

module.exports = HomeController
