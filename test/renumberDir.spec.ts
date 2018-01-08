import { renumberDir } from '../src/index';

import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as tmp from 'tmp';

describe('renumberDir', () => {
  let tmpPath: string;

  beforeEach(() => {
    tmpPath = tmp.dirSync().name;
  });

  afterEach(done => {
    rimraf(tmpPath, done);
  });

  it('should handle an empty directory', () => {
    renumberDir(tmpPath);
  });

  it('should rename the file', () => {
    createFile(tmpPath, '1-a');
    renumberDir(tmpPath);
    dirEquals(tmpPath, ['010-a']);
  });

  it('should rename the directory', () => {
    createDir(tmpPath, '1-a');
    renumberDir(tmpPath);
    dirEquals(tmpPath, ['010-a']);
  });

  it('should skip hidden directories', () => {
    createDir(tmpPath, '.1-a');
    renumberDir(tmpPath);
    dirEquals(tmpPath, ['.1-a']);
  });

  it('should skip hidden files', () => {
    createFile(tmpPath, '.1-a');
    renumberDir(tmpPath);
    dirEquals(tmpPath, ['.1-a']);
  });

  it('should rename the files in a directory', () => {
    createDir(tmpPath, '1-a');
    createFile(path.join(tmpPath, '1-a'), '1-a');
    renumberDir(tmpPath);
    dirEquals(tmpPath, ['010-a']);
    dirEquals(path.join(tmpPath, '010-a'), ['010-a']);
  });

  it('should rename the files in an not-renamed directory', () => {
    createDir(tmpPath, 'a');
    const subPath = path.join(tmpPath, 'a');
    createFile(subPath, '1-a');
    renumberDir(tmpPath);
    dirEquals(tmpPath, ['a']);
    dirEquals(subPath, ['010-a']);
  });
});

function createFile(dir: string, name: string) {
  fs.writeFileSync(path.join(dir, name), '');
}

function createDir(dir: string, name: string) {
  fs.mkdirSync(path.join(dir, name));
}

function dirEquals(dir: string, expected: string[]) {
  const files = fs.readdirSync(dir);
  expect(files).to.deep.equal(expected);
}
