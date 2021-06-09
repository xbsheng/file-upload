/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1622963040250_6041'

  // add your middleware config here
  config.middleware = [ 'test', 'gzip' ]
  config.multipart = {
    fileExtensions: [ '.chunk' ], // 增加对 apk 扩展名的文件支持
  }
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    test: {
      name: 'test',
    },
    gzip: {
      threshold: 1024, // 小于 1k 的响应体不压缩
      // enable：控制中间件是否开启。
      // match：设置只有符合某些规则的请求才会经过这个中间件。
      // ignore：设置符合某些规则的请求不经过这个中间件。
    },
  }

  return {
    ...config,
    ...userConfig,
  }
}
