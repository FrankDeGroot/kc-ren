import { renumberDir } from '../src/index';

import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as tmp from 'tmp';

describe('renumberDir', () => {
	it('should handle an empty directory', () => {
		inTmpDir(renumberDir);
	});
	it('should rename the file', () => {
		inTmpDir(dir => {
			createFile(dir, '1-a');
			renumberDir(dir);
			const files = fs.readdirSync(dir);
			expect(files).to.deep.equal(['010-a']);
		});
	});
});

function inTmpDir(doTest: (string) => void) {
	const tmpDir = tmp.dirSync();
	try {
		doTest(tmpDir.name);
	} finally {
		rimraf(tmpDir.name, () => {
			tmpDir.removeCallback();
		});
	}
}

function createFile(dir: string, name: string) {
	fs.writeFileSync(path.join(dir, name), '');
}