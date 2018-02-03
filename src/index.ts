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

interface RenamePath {
  oldPath(): string;
  newPath(): string;
  oldRef(): string;
  newRef(): string;
}

class RenameBaseDir implements RenamePath {
  constructor(
    readonly root: string
  ) { }
  oldPath() {
    return this.root;
  }
  newPath() {
    return this.root;
  }
  oldRef() {
    return '';
  }
  newRef() {
    return '';
  }
}

class RenameSubDir implements RenamePath {
  constructor(
    readonly parent: RenamePath,
    readonly rename: Rename
  ) { }
  oldPath() {
    // Parent dir is renamed before children are renamed.
    return path.join(this.parent.newPath(), this.rename.oldName);
  }
  newPath() {
    return path.join(this.parent.newPath(), this.rename.newName);
  }
  oldRef() {
    // Parent ref is replaced before children refs are replaced.
    return path.join(this.parent.newRef(), this.rename.oldName);
  }
  newRef() {
    return path.join(this.parent.newRef(), this.rename.newName);
  }
}

export async function renumberDir(dir: string) {
  const allRenames: RenamePath[] = [];
  await renumberSubdir(allRenames, new RenameBaseDir(dir));
  await updateRefs(allRenames);
}

async function renumberSubdir(allRenames: RenamePath[], dir: RenamePath) {
  const files = (await readDir(dir.newPath())).filter(file => !/^\./.test(file));
  const fileRenames = renumber(files);
  for (const fileRename of fileRenames) {
    const renamePath = new RenameSubDir(dir, fileRename);
    const oldFile = renamePath.oldPath();
    const newFile = renamePath.newPath();
    allRenames.push(renamePath);
    if (oldFile !== newFile) {
      await rename(oldFile, newFile);
    }
    if ((await stat(newFile)).isDirectory()) {
      await renumberSubdir(allRenames, renamePath);
    }
  }
}

async function updateRefs(allRenames: RenamePath[]) {
  for (const rename of allRenames) {
    const file = rename.newPath();
    if ((await stat(file)).isFile()) {
      let content = await readFile(file, 'utf-8');
      for (const replace of allRenames) {
        content = content.replace(replace.oldRef(), replace.newRef());
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
    renFiles.push({ oldName: file, newName: newFile });
  }
  return renFiles.reverse();
}
