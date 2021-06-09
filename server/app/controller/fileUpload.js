const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const sendToWormhole = require('stream-wormhole')
const BaseController = require('./base')

const DOWNLOAD_DIR = path.resolve(__dirname, '../public')

const write = (part, filePath, fileName) => new Promise((resolve, reject) => {
  !fs.existsSync(filePath) && fs.mkdirSync(filePath)
  const ws = fs.createWriteStream(path.resolve(filePath, fileName))
  ws.on('finish', () => {
    resolve()
  })
  ws.on('error', async e => {
    await sendToWormhole(part)
    reject(e)
  })
  part.pipe(ws)
  // TODO:
  // try {
  // part.pipe(ws)
  // }catch (err) {
  //   // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
  //   await sendToWormhole(part);
  //   throw err;
  // }
})
module.exports = class extends BaseController {
  // 切片上传
  async uploadChunk() {
    const { ctx } = this
    // 参数校验
    // try {
    //   ctx.validate({
    //     hash: 'string',
    //     index: 'number',
    //   })
    // } catch ({ errors }) {
    //   this.error('请求参数不正确', errors)
    //   return
    // }

    // fs.existsSync(path.resolve())

    const parts = ctx.multipart()
    const params = {}
    let part
    // parts() 返回 promise 对象
    while ((part = await parts()) != null) {
      console.log('=============================')
      if (part.length) {
        const [ field, value, valueTruncated, fieldnameTruncated ] = part
        params[field] = value
        // 这是 busboy 的字段
        console.log('field: ' + field) // field: name
        console.log('value: ' + value) // value: zxc
        console.log('valueTruncated: ' + valueTruncated) // valueTruncated: false
        console.log('fieldnameTruncated: ' + fieldnameTruncated) // fieldnameTruncated: false
      } else {
        if (!part.filename) {
          // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
          // 需要做出处理，例如给出错误提示消息
          return
        }
        // part 是上传的文件流
        console.log('field: ' + part.fieldname) // field: file
        console.log('filename: ' + part.filename) // filename: 580F96F4CDF8F25AE2CF260C0F070F54.jpg
        console.log('encoding: ' + part.encoding) // encoding: 7bit
        console.log('mime: ' + part.mime) // mime: image/jpeg
        const fileName = params.index
        const filePath = path.resolve(__dirname, '../public', params.hash)
        await write(part, filePath, fileName)
      }
    }
    console.log('=============================end')
    this.message('切片上传成功')
  }

  // 文件合并
  async mergeChunks() {
    const { ctx } = this
    const { hash, size, ext } = ctx.request.body
    const resultFilePath = path.resolve(DOWNLOAD_DIR, `${hash}.${ext}`)
    // if (fs.existsSync(resultFilePath)) {
    //   // 合并的文件已经存在
    //   return this.error('文件已存在')
    // }
    // const pipeStream = (filePath, writeStream) => new Promise((resolve, reject) => {
    //   const rs = fse.createReadStream(filePath)
    //   rs.on('end', () => {
    //     fse.unlinkSync(filePath)
    //     resolve()
    //   })
    //   rs.pipe(writeStream)
    // })
    const ws1 = fse.createWriteStream(path.resolve(DOWNLOAD_DIR, 'test'))
    const rs1 = fse.createReadStream(path.resolve(DOWNLOAD_DIR, '8f8e847adaf029ce0f9eb9abfd5f208c', '0'))
    rs1.pipe(ws1)
    const ws2 = fse.createWriteStream(path.resolve(DOWNLOAD_DIR, 'test'), { start: 1048576 })
    const rs2 = fse.createReadStream(path.resolve(DOWNLOAD_DIR, '8f8e847adaf029ce0f9eb9abfd5f208c', '1048576'))
    rs2.pipe(ws2)
    // ========================================
    const imgws1 = fse.createWriteStream(path.resolve(DOWNLOAD_DIR, 'test.jpg'), { start: 0 })
    const imgrs1 = fse.createReadStream(path.resolve(DOWNLOAD_DIR, '14da8d556c762a0bde472beb5d2527d9', '0'))
    imgrs1.pipe(imgws1)
    const imgws2 = fse.createWriteStream(path.resolve(DOWNLOAD_DIR, 'test.jpg'), { start: 1048576 })
    const imgrs2 = fse.createReadStream(path.resolve(DOWNLOAD_DIR, '14da8d556c762a0bde472beb5d2527d9', '1048576'))
    imgrs2.pipe(imgws2)
    const imgws3 = fse.createWriteStream(path.resolve(DOWNLOAD_DIR, 'test.jpg'), { start: 2097152 })
    const imgrs3 = fse.createReadStream(path.resolve(DOWNLOAD_DIR, '14da8d556c762a0bde472beb5d2527d9', '2097152'))
    imgrs3.pipe(imgws3)

    // ===========================================

    const chunksDir = path.resolve(DOWNLOAD_DIR, hash)
    const chunks = fse.readdirSync(chunksDir).sort((a, b) => a * 1 - b * 1)
    chunks.forEach(no => {
      const ws = fse.createWriteStream(resultFilePath, { start: no * 1 })
      const chunkPath = path.resolve(chunksDir, no)
      const rs = fse.createReadStream(chunkPath)
      rs.on('end', () => {
        console.log(123)
        ws.end()
      })
      rs.pipe(ws)
    })
    // const ps = chunks.map(no => {
    //   return new Promise((resolve, reject) => {
    //     const ws = fse.createWriteStream(resultFilePath, { start: no * 1 })
    //     const chunkPath = path.resolve(chunksDir, no)
    //     const rs = fse.createReadStream(chunkPath)
    //     console.log('====================')
    //     console.log(no, ws, rs)
    //     rs.on('end', () => {
    //       // ws.end()
    //       // fse.unlinkSync(chunkPath)
    //       resolve()
    //     })
    //     rs.pipe(ws)
    //   })
    // })
    // await Promise.all(ps)
    // console.log(chunks)
    this.success('合并文件成功')
  }

  checkExistsFile() {
    const { ctx } = this
    const { hash, ext } = ctx.request.body
    if (fs.existsSync(path.resolve(DOWNLOAD_DIR, `${hash}.${ext}`))) {
      return this.success({ upload: true, merged: true })
    }
    if (fs.existsSync(path.resolve(DOWNLOAD_DIR, hash))) {
      const chunks = fse.readdirSync(path.resolve(DOWNLOAD_DIR, hash))
      return this.success({ upload: true, merged: false, chunks })
    }
    this.success({ upload: false, merged: false })
  }

}
