import path from 'node:path';
import fs from 'node:fs';
import * as parser from './parser';
const docOne = fs.readFileSync(path.join(__dirname,'test-fixtures','one.txt'),'utf-8');
const docTwo = fs.readFileSync(path.join(__dirname,'test-fixtures','two.txt'),'utf-8');
describe('sum module', () => {
  test('Properly parses document one', async () => {
    const doc = await parser.trimDocument(docOne);
    const res = await parser.parseSecHeaderString(doc)
    expect(res.filer.companyData.companyConformedName).toEqual('MJ Holdings, Inc.')
    expect(res.filer.filingValues.formType).toEqual('8-K')
  });
  test('Properly parses document two', async () => {
    const doc = await parser.trimDocument(docTwo);
    const res = await parser.parseSecHeaderString(doc)
    expect(typeof res.issuer).toBe('object')
  });
});