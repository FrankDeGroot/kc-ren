import { renumberDir } from '../src/index';

import { expect } from 'chai';
import tmp = require('tmp');

describe('renumberDir', () => {
	it('should handle an empty directory', () => {
		inTmpDir(renumberDir);
	});
});

function inTmpDir(doTest: (string) => void) {
		const tmpDir = tmp.dirSync();
		try {
			doTest(tmpDir.name);
		} finally {
			tmpDir.removeCallback();
		}
}