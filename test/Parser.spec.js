import { expect } from 'chai';
import Parser from '../src/Parser';


describe('Parser', () => {
  it('should return a Promise', async done => {
    expect(Parser.getShows({ query: 'big bang' })).to.be.a('promise');
    done();
  });

  it('should have expected properties', async done => {
    const results = await Parser.getShows({ query: 'big bang' });

    expect(results).to.be.an('array');
    expect(results).to.have.length.above(10);

    const [result] = results;
    expect(result).to.be.an('object');
    expect(result).to.have.deep.property('id').that.is.a('string');
    expect(result).to.have.deep.property('slug').that.is.a('string');
    expect(result).to.have.deep.property('status').that.is.a('string');
    expect(result).to.have.deep.property('title').that.is.a('string');
    expect(result).to.have.deep.property('url').that.is.a('string');

    done();
  });
});
