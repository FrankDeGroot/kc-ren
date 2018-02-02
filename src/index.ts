import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

export interface Rename {
  oldFile: string;
  newFile: string;
}

export async function renumberDir(dir: string) {
  const allRenames: Rename[] = [];
  await renumberSubdir(allRenames, dir, dir);
  await updateRefs(allRenames, dir);
}

async function renumberSubdir(allRenames: Rename[], baseDir: string, dir: string) {
  const files = (await readDir(dir)).filter(file => !/^\./.test(file));
  const fileRenames = renumber(files);
  for (const fileRename of fileRenames) {
    const oldFile = path.join(dir, fileRename.oldFile);
    const newFile = path.join(dir, fileRename.newFile);
    allRenames.push({
      oldFile: oldFile.substring(baseDir.length),
      newFile: newFile.substring(baseDir.length)
    });
    if (oldFile !== newFile) {
      await rename(oldFile, newFile);
    }
    if ((await stat(newFile)).isDirectory()) {
      await renumberSubdir(allRenames, baseDir, newFile);
    }
  }
}

async function updateRefs(allRenames: Rename[], baseDir: string) {
  for (const rename of allRenames) {
    const file = path.join(baseDir, rename.newFile);
    if ((await stat(file)).isFile()) {
      let content = await readFile(file, 'utf-8');
      for (const replace of allRenames) {
        content = content.replace(replace.oldFile, replace.newFile);
      }
      await writeFile(file, content, 'utf-8');
    }
  }
}

export function renumber(files: string[]): Rename[] {
  const count = files.length.toString().length;
  const renFiles = [];
  let index = 1;
  for (const file of files) {
    const match = /([^-]+)-(.*)/.exec(file);
    const newFile = match ? '0' + (index++).toString().padStart(count, '0') + '0' + '-' + match[2] : file;
    renFiles.push({ oldFile: file, newFile: newFile });
  }
  return renFiles.reverse();
}
