'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  router.get('/', controller.home.index)
  router.get('/testGzip', controller.home.testGzip)
  router.post('/uploadChunk', controller.fileUpload.uploadChunk)
  router.post('/mergeChunks', controller.fileUpload.mergeChunks)
  router.post('/checkExistsFile', controller.fileUpload.checkExistsFile)
}
