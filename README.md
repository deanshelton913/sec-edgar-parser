# SEC EDGAR parser
If you have ever wished that the SEC archive documents were in a more usable format, this tool is for you.

This small library was built to parse those edgar formatted documents like those found at [the SEC archive website](https://www.sec.gov/Archives/edgar/data/1849440/000084251724000086/0000842517-24-000086.txt) into a usable JS object.

### Be advised
1. The SEC archive does enforce IP based rate limiting (currently set at ten requests per second) so when you request these docs, remember to account for this delay. 
2. All leaf values in the resulting JS object are represented as STRINGs to help preserve the document intent. For example, some numeric or date values might contain leading zeros (ex: `000123123`) in the event these leading zeroes are references to other documents, their values are unaltered.



## Example

```bash
$ npm install sec-edgar-parser
```

## Example `getObjectFromUrl`
This function calls the SEC, and immediately parses the document into an object.
```ts
import { getObjectFromUrl, getObjectFromString } from "sec-edgar-parser";

const url = 'https://www.sec.gov/Archives/edgar/data/1456857/000151116418000283/0001511164-18-000283.txt';
const obj = await getObjectFromUrl(url);
console.log(JSON.stringify(obj, null, 2));
```

## Example `getObjectFromString`
This function processes SEC filing documents from a string. 
```ts
// Example: from a string
const string = `
<SEC-DOCUMENT>0001511164-18-000283.txt : 20180425
<SEC-HEADER>0001511164-18-000283.hdr.sgml : 20180425
<ACCEPTANCE-DATETIME>20180425093712
ACCESSION NUMBER:		0001511164-18-000283
CONFORMED SUBMISSION TYPE:	8-K

  <... Doc omitted for brevity ...>

FILER:

	COMPANY DATA:	
		COMPANY CONFORMED NAME:			MJ Holdings, Inc.
		CENTRAL INDEX KEY:			0001456857
        
  <... Doc omitted for brevity ...>

end
</TEXT>
</DOCUMENT>
</SEC-DOCUMENT>
`
console.log(JSON.stringify(getObjectFromString(string), null, 2))

```
### Example output
```json
{
  "accessionNumber": "0001839882-24-014056",
  "acceptanceDateTime": "20240501130530",
  "conformedSubmissionType": "FWP",
  "publicDocumentCount": "2",
  "filedAsOfDate": "20240501",
  "dateAsOfChange": "20240501",
  "subjectCompany": {
    "companyData": {
      "companyConformedName": "Morgan Stanley Finance LLC",
      "centralIndexKey": "0001666268",
      "standardIndustrialClassification": "ASSET-BACKED SECURITIES [6189]",
      "organizationName": "Office of Structured Finance",
      "irsNumber": "363145972",
      "stateOfIncorporation": "DE",
      "fiscalYearEnd": "1231"
    },
    "filingValues": {
      "formType": "FWP",
      "secAct": "1934 Act",
      "secFileNumber": "333-275587-01",
      "filmNumber": "24901891"
    },
    "businessAddress": {
      "street1": "1585 BROADWAY",
      "city": "NEW YORK",
      "state": "NY",
      "zip": "10036",
      "businessPhone": "(212) 761-4000"
    },
    "mailAddress": {
      "street1": "1585 BROADWAY",
      "city": "NEW YORK",
      "state": "NY",
      "zip": "10036"
    }
  },
  "filedBy": {
    "companyData": {
      "companyConformedName": "Morgan Stanley Finance LLC",
      "centralIndexKey": "0001666268",
      "standardIndustrialClassification": "ASSET-BACKED SECURITIES [6189]",
      "organizationName": "Office of Structured Finance",
      "irsNumber": "363145972",
      "stateOfIncorporation": "DE",
      "fiscalYearEnd": "1231"
    },
    "filingValues": {
      "formType": "FWP"
    },
    "businessAddress": {
      "street1": "1585 BROADWAY",
      "city": "NEW YORK",
      "state": "NY",
      "zip": "10036",
      "businessPhone": "(212) 761-4000"
    },
    "mailAddress": {
      "street1": "1585 BROADWAY",
      "city": "NEW YORK",
      "state": "NY",
      "zip": "10036"
    }
  }
}
```

## License
This project is licensed under the ISC License - see the [License](https://en.wikipedia.org/wiki/ISC_license) for details.