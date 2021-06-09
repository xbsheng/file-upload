const { Controller } = require('egg')

class BaseController extends Controller {
  message(message) {
    this.ctx.body = {
      code: 0,
      message,
    }
  }
  success(data) {
    this.ctx.body = {
      code: 0,
      data,
    }
  }
  error(message, error = {}, code = 1) {
    this.ctx.body = {
      code,
      message,
      error,
    }
  }
}

module.exports = BaseController
