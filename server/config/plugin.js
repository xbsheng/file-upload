'use strict'

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  // 开启请求参数校验
  validate: {
    enable: true,
    package: 'egg-validate',
  },
}
