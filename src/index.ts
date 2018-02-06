import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

export interface Rename {
  oldName: string;
  newName: string;
}

export async function renumberDir(path: string) {
  const renames: Rename[] = [];
  await renumberSubdir(renames, path, '');
  await updateRefs(renames, path);
}

async function renumberSubdir(renames: Rename[], basePath: string, subPath: string) {
  const files = (await readDir(path.join(basePath, subPath))).filter(file => !/^\./.test(file));
  for (const entry of renumber(files)) {
    renames.push({
      oldName: path.join(subPath, entry.oldName),
      newName: path.join(subPath, entry.newName)
    });
    const parentPath = path.join(basePath, subPath);
    const newPath = path.join(parentPath, entry.newName);
    if (entry.oldName !== entry.newName) {
      await rename(
        path.join(parentPath, entry.oldName),
        newPath);
    }
    if ((await stat(newPath)).isDirectory()) {
      await renumberSubdir(renames, basePath, entry.newName);
    }
  }
}

async function updateRefs(renames: Rename[], basePath: string) {
  for (const rename of renames) {
    const file = path.join(basePath, rename.newName);
    if ((await stat(file)).isFile()) {
      let content = await readFile(file, 'utf-8');
      for (const entry of renames) {
        content = content.replace(entry.oldName, entry.newName);
      }
      await writeFile(file, content, 'utf-8');
    }
  }
}

export function renumber(names: string[]): Rename[] {
  const count = names.length.toString().length;
  const renames = [];
  let index = 1;
  for (const entry of names) {
    const match = /([^-]+)-(.*)/.exec(entry);
    const newFile = match ? '0' + (index++).toString().padStart(count, '0') + '0' + '-' + match[2] : entry;
    renames.push({ oldName: entry, newName: newFile });
  }
  return renames.reverse();
}
