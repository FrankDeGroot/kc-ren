import { renumber } from '../src/index';

import { expect, use } from 'chai';
import chaiThings = require('chai-things');

use(chaiThings);

describe('renumber', () => {
  it('should return an empty list on no files', () => {
    expect(renumber([])).to.be.an('array').that.is.empty;
  });

  it('should disregard files without a number prefix', () => {
    expect(renumber(['a', 'b'])).to.deep.equal([{
      oldName: 'b',
      newName: 'b'
    }, {
      oldName: 'a',
      newName: 'a'
    }]);
  });

  it('should renumber', () => {
    expect(renumber(['1-x', '2-a', '3-@'])).to.deep.equal([{
      oldName: '3-@',
      newName: '030-@'
    }, {
      oldName: '2-a',
      newName: '020-a'
    }, {
      oldName: '1-x',
      newName: '010-x'
    }]);
  });

  it('should include files that are not renamed', () => {
    expect(renumber(['1-x', '020-a'])).to.deep.equal([{
      oldName: '020-a',
      newName: '020-a'
    }, {
      oldName: '1-x',
      newName: '010-x'
    }]);
  });

  it('should prepend 0s with 10 files or more', () => {
    let files: string[] = [];
    for (let i = 1; i <= 10; i++) {
      files.push(i.toString() + '-something');
    }
    expect(renumber(files)).to.include.something.that.deep.equals({ oldName: '1-something', newName: '0010-something' });
  });
});