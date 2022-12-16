import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { finished } from 'stream/promises'
import { v4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// type - userPhoto, goodsPhoto
export const savePhoto = async (file, type) => {
    const { createReadStream, filename, mimetype, encoding } = await file
    const name = v4()

    const end = filename.split('.').at(-1)
    const fname = name + '.' + end

    const stream = createReadStream()
    const pathname = path.join(__dirname, `/public/images/${type}/${fname}`)

    const out = fs.createWriteStream(pathname)
    stream.pipe(out)
    await finished(out)

    return fname
}
