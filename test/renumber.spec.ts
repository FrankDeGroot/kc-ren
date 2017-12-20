import { renumber } from '../src/index';

import { expect } from 'chai';

describe('renumber', () => {
	it('should return an empty list on no files', () => {
		expect(renumber([])).to.be.an('array').that.is.empty;
	});
});