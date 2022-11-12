import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { finished } from 'stream/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// type - userPhoto, goodsPhoto
export const savePhoto = async (file, type) => {
    const { createReadStream, filename, mimetype, encoding } = await file

    const stream = createReadStream()
    const pathname = path.join(__dirname, `/public/images/${type}/${filename}`)

    const out = fs.createWriteStream(pathname)
    stream.pipe(out)
    await finished(out)

    return `http://192.168.0.42:4000/images/${type}/${filename}`
}
