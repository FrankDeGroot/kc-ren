import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { renumberTree } from './renumberTree'

import { readdir, mkdir, mkdtemp, rmdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('renumberDir', async () => {
  let tmpPath: string

  beforeEach(async () => {
    tmpPath = await mkdtemp(join(tmpdir(), 'kc-ren-'))
  })

  afterEach(async () => {
    await rmdir(tmpPath, { recursive: true })
  })

  test('should handle an empty directory', async () => {
    await renumberTree(tmpPath)
  })

  test('should rename the file', async () => {
    await createFile(tmpPath, '1-a')
    await renumberTree(tmpPath)
    directoryEquals(tmpPath, ['10-a'])
  })

  test('should rename the directory', async () => {
    await createDirectory(tmpPath, '1-a')
    await renumberTree(tmpPath)
    directoryEquals(tmpPath, ['10-a'])
  })

  test('should rename the files in a directory', async () => {
    await createDirectory(tmpPath, '1-a')
    await createFile(join(tmpPath, '1-a'), '1-a')
    await renumberTree(tmpPath)
    await directoryEquals(tmpPath, ['10-a'])
    await directoryEquals(join(tmpPath, '10-a'), ['10-a'])
  })

  test('should rename the files in a sub-directory', async () => {
    await createDirectory(tmpPath, '1-a')
    const path1 = join(tmpPath, '1-a')
    await createDirectory(path1, '1-a')
    const path2 = join(path1, '1-a')
    await createFile(path2, '1-a')
    await renumberTree(tmpPath)
    await directoryEquals(tmpPath, ['10-a'])
    await directoryEquals(join(tmpPath, '10-a'), ['10-a'])
    await directoryEquals(join(tmpPath, '10-a', '10-a'), ['10-a'])
  })

  test('should rename the files in a not-renamed directory', async () => {
    const subPath = join(tmpPath, 'a')
    await createDirectory(tmpPath, 'a')
    await createFile(subPath, '1-a')
    await renumberTree(tmpPath)
    await directoryEquals(tmpPath, ['a'])
    await directoryEquals(subPath, ['10-a'])
  })
})

async function createFile(dir: string, name: string, contents: string = '') {
  await writeFile(join(dir, name), contents)
}

async function createDirectory(dir: string, name: string) {
  await mkdir(join(dir, name))
}

async function directoryEquals(dir: string, expected: string[]) {
  expect(await readdir(dir)).toEqual(expected)
}
