import { readdir, rename, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { renumber } from './renumber'

export async function renumberTree(path: string) {
  await renumberDirectory(path)
}

async function renumberDirectory(path: string) {
  for (const entry of renumber(await readdir(path))) {
    const newPath = join(path, entry.newName)
    if (entry.oldName !== entry.newName) {
      await rename(
        join(path, entry.oldName),
        newPath)
    }
    const newStat = await stat(newPath)
    if (newStat.isDirectory()) {
      await renumberDirectory(join(path, entry.newName))
    }
  }
}