import path from 'node:path';
import fs from 'node:fs';
import * as parser from './parser';
const docOne = fs.readFileSync(path.join(__dirname,'test-fixtures','one.txt'),'utf-8');
const docTwo = fs.readFileSync(path.join(__dirname,'test-fixtures','two.txt'),'utf-8');
describe('SEC EDGAR Parser', () => {
  test('Properly parses document one', async () => {
    const res = await parser.getJsonFromString(docOne)
    expect(res.filer.companyData.companyConformedName).toEqual('MJ Holdings, Inc.')
    expect(res.filer.filingValues.formType).toEqual('8-K')
  });
  test('Properly parses document two', async () => {
    const res = await parser.getJsonFromString(docTwo)
    expect(typeof res.issuer).toBe('object')
    expect(res.reportingOwner.ownerData.organizationName).toBe(null)
  });
});