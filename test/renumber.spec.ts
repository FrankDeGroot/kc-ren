import { renumber } from '../src/index';

import { expect } from 'chai';

describe('renumber', () => {
	it('should return an empty list on no files', () => {
		expect(renumber([])).to.be.an('array').that.is.empty;
	});
	it('should disregard files without a number prefix', () => {
		expect(renumber(['a', 'b'])).to.be.an('array').that.is.empty;
	})
});