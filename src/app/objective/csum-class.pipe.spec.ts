import { CsumClassPipe } from './csum-class.pipe';

describe('CsumClassPipe', () => {
  it('create an instance', () => {
    const pipe = new CsumClassPipe();
    expect(pipe).toBeTruthy();
  });

  it('should identify OK cumulative sums', () => {
    const pipe = new CsumClassPipe();
    expect(pipe.transform(10, 100, 10)).toEqual('resource-csum-ok');
  });

  it('should identify marginal cumulative sums', () => {
    const pipe = new CsumClassPipe();
    expect(pipe.transform(10, 9, 8)).toEqual('resource-csum-marginal');
  });

  it('should identify excess cumulative sums', () => {
    const pipe = new CsumClassPipe();
    expect(pipe.transform(100, 10, 1)).toEqual('resource-csum-excess');
  });
});
