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

interface RefUpdate extends Rename {
  newPath: string;
}

export async function renumberDir(path: string) {
  const renames: RefUpdate[] = [];
  await renumberSubdir(renames, path, '');
  await updateRefs(renames);
}

async function renumberSubdir(renames: RefUpdate[], basePath: string, subPath: string) {
  const names = (await readDir(path.join(basePath, subPath))).filter(file => !/^\./.test(file));
  for (const entry of renumber(names)) {
    const parentPath = path.join(basePath, subPath);
    const newPath = path.join(parentPath, entry.newName);
    renames.push({
      oldName: path.join(subPath, entry.oldName),
      newName: path.join(subPath, entry.newName),
      newPath: newPath
    });
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

async function updateRefs(renames: RefUpdate[]) {
  for (const rename of renames) {
    const newPath = rename.newPath;
    if ((await stat(newPath)).isFile()) {
      let content = await readFile(newPath, 'utf-8');
      for (const entry of renames) {
        content = content.replace(entry.oldName, entry.newName);
      }
      await writeFile(newPath, content, 'utf-8');
    }
  }
}

export function renumber(names: string[]): Rename[] {
  const count = names.length.toString().length;
  let index = 1;
  return names.map(entry => {
    const match = /([^-]+)-(.*)/.exec(entry);
    const newFile = match ? '0' + (index++).toString().padStart(count, '0') + '0' + '-' + match[2] : entry;
    return { oldName: entry, newName: newFile };
  }).reverse();
}
