<template>
  <div class="upload">
    <h2>文件上传</h2>
    <div ref="drag" class="drag-container">
      <input type="file" name="file" @change="handleFileChange" />
    </div>
    <a-card title="Default size card" style="margin-top: 20px">
      <a-descriptions :column="1">
        <a-descriptions-item label="name">
          {{ file.name || '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="size">
          {{ file.size || '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="isImage">
          {{ file ? isImage : '--' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
    <a-button type="primary" @click="handleUpload"> 点击上传 </a-button>
    <a-tag color="blue">
      {{ file ? (isImage ? '是图片' : '不是图片') : '文件为空' }}
    </a-tag>
    <!-- <a-button type="primary" @click="handleTest"> test </a-button> -->
  </div>
</template>
<script>
import sparkMd5 from 'spark-md5'
import { isImage } from '@/utils/filetype'
const CHUNK_SIZE = 1024 * 1024
export default {
  data() {
    return {
      file: '',
      isImage: false,
      form: {}
    }
  },
  mounted() {
    console.log(123)
  },
  methods: {
    async handleFileChange(e) {
      const [file] = e.target.files
      console.log(file)
      if (!file) return
      this.file = file
      this.isImage = await isImage(file)
    },
    // 上传
    async handleUpload() {
      if (!this.file) return this.$message.warning('请选择需要上传的文件')
      const [ext] = this.file.name.match(/[^.]\w*$/)
      const hash = await this.getHash(this.file)
      const {
        data: {
          data: { upload, merged, chunks: uploadChunks }
        }
      } = await this.$http.post('/checkExistsFile', { hash, ext })
      if (upload && merged) return this.$message.success('秒传成功')
      let chunks = this.createFileChunks(this.file)
      if (upload && !merged) {
        chunks = chunks.filter(item => !uploadChunks.includes(item.index + ''))
      }
      console.log(chunks)
      await this.uploadChunk(hash, chunks)
      console.log('success')
      console.log(this.file)
      this.mergeChunks(hash, ext)
    },
    // async checkExistsFile(hash, ext) {
    //   const {
    //     data: { upload, merged, chunks },
    //   } = await this.$http.post('/checkExistsFile', { hash, ext })
    //   return
    // },
    // 切片
    createFileChunks(file, size = CHUNK_SIZE) {
      if (!file) return
      const chunks = []
      let index = 0
      const fileSize = file.size
      while (index < fileSize) {
        chunks.push({ index, file: file.slice(index, index + size) })
        index += size
      }
      return chunks
    },
    // 获取文件hash
    getHash(file) {
      return new Promise((resolve, reject) => {
        const offset = 2 * 1024 * 1024
        const size = file.size
        const chunks = [file.slice(0, offset)]
        let index = offset
        while (index < size) {
          if (index + offset >= size) {
            // 最后一个切片
            chunks.push(file.slice(index))
          } else {
            const start = index
            const middle = (index + offset) >> 1
            const end = index + offset
            chunks.push(file.slice(start, start + 2))
            chunks.push(file.slice(middle, middle + 2))
            chunks.push(file.slice(end - 2, end))
          }
          index += offset
        }
        const reader = new FileReader()
        const spark = new sparkMd5.ArrayBuffer()
        reader.readAsArrayBuffer(new Blob(chunks))
        reader.onload = e => {
          spark.append(e.target.result)
          resolve(spark.end())
        }
      })
    },
    uploadChunk(hash, chunks) {
      const ps = chunks.map(item => {
        const { index, file } = item
        const formData = new FormData()
        formData.append('hash', hash)
        formData.append('index', index)
        formData.append('file', new File([file], hash + '.chunk'))
        return this.$http.post('/uploadChunk', formData)
      })
      return Promise.all(ps)
    },
    mergeChunks(hash, ext) {
      const params = { hash, ext }
      this.$http.post('/mergeChunks', params)
    },
    handleTest() {
      const formData = new FormData()
      formData.append('hash', 123456)
      formData.append('index', 1)
      formData.append('file', this.file)
      return this.$http.post('/uploadChunk', formData)
    }
  }
}
</script>
<style lang="less">
.upload {
  padding: 10px;
  .drag-container {
    height: 100px;
    line-height: 100px;
    text-align: center;
    border: 2px dashed #ddd;
    border-radius: 8px;
    input {
      line-height: normal;
    }
  }
}
</style>
