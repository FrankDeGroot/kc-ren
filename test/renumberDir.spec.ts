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

  it('should rename the files in an not-renamed directory', async () => {
    const subPath = path.join(tmpPath, 'a');
    await createDir(tmpPath, 'a');
    await createFile(subPath, '1-a');
    await renumberDir(tmpPath);
    await dirEquals(tmpPath, ['a']);
    await dirEquals(subPath, ['010-a']);
  });
});

async function createFile(dir: string, name: string) {
  await promisify(fs.writeFile)(path.join(dir, name), '');
}

async function createDir(dir: string, name: string) {
  await promisify(fs.mkdir)(path.join(dir, name));
}

async function dirEquals(dir: string, expected: string[]) {
  const files = await promisify(fs.readdir)(dir);
  expect(files).to.deep.equal(expected);
}
