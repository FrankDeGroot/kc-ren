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
  newStat: fs.Stats;
}

export async function renumberDir(path: string) {
  const refUpdates: RefUpdate[] = [];
  await renumberSubdir(refUpdates, path, '');
  await updateRefs(refUpdates);
}

async function renumberSubdir(refUpdates: RefUpdate[], basePath: string, subPath: string) {
  const names = (await readDir(path.join(basePath, subPath))).filter(isVisible);
  for (const entry of renumber(names)) {
    const parentPath = path.join(basePath, subPath);
    const newPath = path.join(parentPath, entry.newName);
    if (entry.oldName !== entry.newName) {
      await rename(
        path.join(parentPath, entry.oldName),
        newPath);
    }
    const newStat = await stat(newPath);
    refUpdates.push({
      oldName: path.join(subPath, entry.oldName),
      newName: path.join(subPath, entry.newName),
      newPath: newPath,
      newStat: newStat
    });
    if (newStat.isDirectory()) {
      await renumberSubdir(refUpdates, basePath, entry.newName);
    }
  }
}

function isVisible(name: string): boolean {
  return !/^\./.test(name);
}

async function updateRefs(refUpdates: RefUpdate[]) {
  for (const refUpdate of refUpdates) {
    const newPath = refUpdate.newPath;
    if (refUpdate.newStat.isFile()) {
      let content = await readFile(newPath, 'utf-8');
      for (const entry of refUpdates) {
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
