export const blobToString = blob =>
  new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = reader.result
        .split('')
        .map(v => v.charCodeAt())
        .map(v => v.toString(16).toUpperCase())
        .map(v => v.padStart(2, '0'))
        .join(' ')
      resolve(res)
    }
    reader.readAsBinaryString(blob)
  })

export const isJpg = async file => {
  const start = await blobToString(file.slice(0, 2))
  const end = await blobToString(file.slice(-2))
  return start === 'FF D8' && end === 'FF D9'
}

export const isPng = async file => {
  const res = await blobToString(file.slice(0, 8))
  console.log(res)
  return res === '89 50 4E 47 0D 0A 1A 0A'
}

export const isGif = async file => {
  // GIF89a 和GIF87a
  // 前面6个16进制，'47 49 46 38 39 61' '47 49 46 38 37 61'
  const res = await blobToString(file.slice(0, 6))
  return ['47 49 46 38 39 61', '47 49 46 38 37 61'].includes(res)
}

export const isImage = async file => {
  return (await isGif(file)) || (await isJpg(file)) || (await isPng(file))
}
