import { renumberDir } from '../src/index';

import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as tmp from 'tmp';
import { promisify } from 'util';

describe('renumberDir', async () => {
  let tmpPath: string;

  beforeEach(async () => {
    tmpPath = (await promisify(tmp.dir)({}));
  });

  afterEach(done => {
    rimraf(tmpPath, done);
  });

  it('should handle an empty directory', async () => {
    await renumberDir(tmpPath);
  });

  it('should rename the file', async () => {
    await createFile(tmpPath, '1-a');
    await renumberDir(tmpPath);
    dirEquals(tmpPath, ['010-a']);
  });

  it('should rename the directory', async () => {
    await createDir(tmpPath, '1-a');
    await renumberDir(tmpPath);
    dirEquals(tmpPath, ['010-a']);
  });

  it('should skip hidden directories', async () => {
    await createDir(tmpPath, '.1-a');
    await renumberDir(tmpPath);
    dirEquals(tmpPath, ['.1-a']);
  });

  it('should skip hidden files', async () => {
    await createFile(tmpPath, '.1-a');
    await renumberDir(tmpPath);
    dirEquals(tmpPath, ['.1-a']);
  });

  it('should rename the files in a directory', async () => {
    await createDir(tmpPath, '1-a');
    await createFile(path.join(tmpPath, '1-a'), '1-a');
    await renumberDir(tmpPath);
    await dirEquals(tmpPath, ['010-a']);
    await dirEquals(path.join(tmpPath, '010-a'), ['010-a']);
  });

  it('should rename the files in a sub-directory', async () => {
    await createDir(tmpPath, '1-a');
    const path1 = path.join(tmpPath, '1-a');
    await createDir(path1, '1-a');
    const path2 = path.join(path1, '1-a');
    await createFile(path2, '1-a');
    await renumberDir(tmpPath);
    await dirEquals(tmpPath, ['010-a']);
    await dirEquals(path.join(tmpPath, '010-a'), ['010-a']);
    await dirEquals(path.join(tmpPath, '010-a', '010-a'), ['010-a']);
  });

  it('should rename the files in a not-renamed directory', async () => {
    const subPath = path.join(tmpPath, 'a');
    await createDir(tmpPath, 'a');
    await createFile(subPath, '1-a');
    await renumberDir(tmpPath);
    await dirEquals(tmpPath, ['a']);
    await dirEquals(subPath, ['010-a']);
  });

  it('should update references in markdown files', async () => {
    await createFile(tmpPath, '1-a.md', 'some 2-a some');
    await createFile(tmpPath, '2-a');
    await renumberDir(tmpPath);
    await dirEquals(tmpPath, ['010-a.md', '020-a']);
    await fileEquals(tmpPath, '010-a.md', 'some 020-a some');
  });

  it('should update references in markdown files in renamed directory', async () => {
    const oldSubPath = path.join(tmpPath, '1-a');
    await createDir(tmpPath, '1-a');
    await createFile(oldSubPath, '1-a.md', 'some 1-a/2-a some');
    await createFile(oldSubPath, '2-a');
    await renumberDir(tmpPath);
    const newSubPath = path.join(tmpPath, '010-a');
    await dirEquals(newSubPath, ['010-a.md', '020-a']);
    await fileEquals(newSubPath, '010-a.md', 'some 010-a/020-a some');
  });

  it('should NOT update references in non-markdown files', async () => {
    await createFile(tmpPath, '1-a', 'some 2-a.Md some');
    await createFile(tmpPath, '2-a.Md', 'some 1-a some');
    await renumberDir(tmpPath);
    await dirEquals(tmpPath, ['010-a', '020-a.Md']);
    await fileEquals(tmpPath, '010-a', 'some 2-a.Md some');
    await fileEquals(tmpPath, '020-a.Md', 'some 010-a some');
  });
});

async function createFile(dir: string, name: string, contents: string = '') {
  await promisify(fs.writeFile)(path.join(dir, name), contents);
}

async function createDir(dir: string, name: string) {
  await promisify(fs.mkdir)(path.join(dir, name));
}

async function dirEquals(dir: string, expected: string[]) {
  const files = await promisify(fs.readdir)(dir);
  expect(files).to.deep.equal(expected);
}

async function fileEquals(dir: string, file: string, expected: string) {
  const actual = await promisify(fs.readFile)(path.join(dir, file), 'utf-8');
  expect(actual).to.equal(expected);
}
