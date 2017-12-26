import { renumberDir } from '../src/index';

import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as tmp from 'tmp';

describe('renumberDir', () => {
	let tmpDir: tmp.SynchrounousResult;
	let tmpDirName: string;

	beforeEach(() => {
		tmpDir = tmp.dirSync();
		tmpDirName = tmpDir.name; 
	});

	afterEach(() => {
		rimraf(tmpDirName + '/*', () => {
			tmpDir.removeCallback();
		});
	});

	it('should handle an empty directory', () => {
		renumberDir(tmpDirName);
	});

	it('should rename the file', () => {
		createFile(tmpDirName, '1-a');
		renumberDir(tmpDirName);
		const files = fs.readdirSync(tmpDirName);
		expect(files).to.deep.equal(['010-a']);
	});

	it('should rename the directory', () => {
		createDir(tmpDirName, '1-a');
		renumberDir(tmpDirName);
		const files = fs.readdirSync(tmpDirName);
		expect(files).to.deep.equal(['010-a']);
	});

	it('should rename the files in a directory', () => {
		createDir(tmpDirName, '1-a');
		createFile(tmpDirName + '/1-a', '1-a');
		renumberDir(tmpDirName);
		const dirs = fs.readdirSync(tmpDirName);
		expect(dirs).to.deep.equal(['010-a']);
		const files = fs.readdirSync(tmpDirName + '/010-a');
		expect(files).to.deep.equal(['010-a']);
	});
});

function createFile(dir: string, name: string) {
	fs.writeFileSync(path.join(dir, name), '');
}

function createDir(dir: string, name: string) {
	fs.mkdirSync(path.join(dir, name));
}