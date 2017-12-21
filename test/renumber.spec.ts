import { renumber } from '../src/index';

import { expect } from 'chai';

describe('renumber', () => {
	it('should return an empty list on no files', () => {
		expect(renumber([])).to.be.an('array').that.is.empty;
	});
	it('should disregard files without a number prefix', () => {
		expect(renumber(['a', 'b'])).to.be.an('array').that.is.empty;
	});
	it('should renumber', () => {
		expect(renumber(['1-x', '2-a', '3-@'])).to.deep.equal([{
			oldFile: '3-@',
			newFile: '030-@'
		}, {
			oldFile: '2-a',
			newFile: '020-a'
		}, {
			oldFile: '1-x',
			newFile: '010-x'
		}]);
	});
	it('should skip files that are not renamed', () => {
		expect(renumber(['1-x', '020-a'])).to.eql([{
			oldFile: '1-x',
			newFile: '010-x'
		}]);
	})
});