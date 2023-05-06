import { unlink } from 'fs/promises'

export const removeFile = async (path) => {
  try {
    await unlink(path)
  } catch (e) {
    console.error(`Error removing file: ${path}`, e.message)
  }
}
