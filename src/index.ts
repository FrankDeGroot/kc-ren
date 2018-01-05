import * as fs from 'fs';
import * as path from 'path';

export interface Rename {
  oldFile: string;
  newFile: string;
}

export function renumberDir(dir: string) {
  const files = fs.readdirSync(dir).filter(file => !/^\./.test(file));
  const renames = renumber(files);
  for (let rename of renames) {
    const oldFile = path.join(dir, rename.oldFile);
    const newFile = path.join(dir, rename.newFile);
    if (oldFile !== newFile) {
      fs.renameSync(oldFile, newFile);
    }
    if (fs.statSync(newFile).isDirectory()) {
      renumberDir(newFile);
    }
  }
}

export function renumber(files: string[]): Rename[] {
  const count = files.length.toString().length;
  const renFiles = [];
  let index = 1;
  for (let file of files) {
    const match = /([^-]+)-(.*)/.exec(file);
    const newFile = match ? '0' + (index++).toString().padStart(count, '0') + '0' + '-' + match[2] : file;
    renFiles.push({ oldFile: file, newFile: newFile });
  }
  return renFiles.reverse();
}
