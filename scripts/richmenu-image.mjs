import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const directory = path.dirname(fileURLToPath(import.meta.url))
await sharp(path.join(directory, 'assets/richmenu-th.png'))
  .resize(2500, 1686, { fit: 'fill' })
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(path.join(directory, 'richmenu.jpg'))
