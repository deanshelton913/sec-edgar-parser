# SEC EDGAR parser

This tool was built to parse edgar formatted documents like those found at https://www.sec.gov/Archives/edgar/data/1849440/000084251724000086/0000842517-24-000086.txt into usable JSON.

### Be advised
Edgar does enforce IP based rate limiting -- currently set at ten requests per second. 


## Example

```bash
$ npm install sec-edgar-parser
```

```ts
import { getObjectFromUrl, getObjectFromString } from "sec-edgar-parser";

// Example: from a url
async function getObjectFromUrl(){
    const url = 'https://www.sec.gov/Archives/edgar/data/1456857/000151116418000283/0001511164-18-000283.txt';
    const obj = await getObjectFromUrl(url);
    console.log(JSON.stringify(obj, null, 2));
}

// Example: from a string
const string = `
FILER:

	COMPANY DATA:	
		COMPANY CONFORMED NAME:			MJ Holdings, Inc.
		CENTRAL INDEX KEY:			0001456857
		STANDARD INDUSTRIAL CLASSIFICATION:	SERVICES-BUSINESS SERVICES, NEC [7389]
		IRS NUMBER:				208235905
		STATE OF INCORPORATION:			NV
		FISCAL YEAR END:			1231
`
console.log(JSON.stringify(getObjectFromString(string), null, 2))

```
### Example output
```json
{
  "accessionNumber": "0001511164-18-000283",
  "conformedSubmissionType": "8-K",
  "publicDocumentCount": "19",
  "conformedPeriodOfReport": "20180425",
  "itemInformation": [
    "Regulation FD Disclosure",
    "Financial Statements and Exhibits"
  ],
  "filedAsOfDate": "20180425",
  "dateAsOfChange": "20180425",
  "filer": {
    "companyData": {
      "companyConformedName": "MJ Holdings, Inc.",
      "centralIndexKey": "0001456857",
      "standardIndustrialClassification": "SERVICES-BUSINESS SERVICES, NEC [7389]",
      "irsNumber": "208235905",
      "stateOfIncorporation": "NV",
      "fiscalYearEnd": "1231"
    },
    "filingValues": {
      "formType": "8-K",
      "secAct": "1934 Act",
      "secFileNumber": "000-55900",
      "filmNumber": "18772968"
    },
    "businessAddress": {
      "street1": "4141 NE 2 AVE",
      "street2": "SUITE 204-A",
      "city": "MIAMI",
      "state": "FL",
      "zip": "33137",
      "businessPhone": "305-455-1800"
    },
    "mailAddress": {
      "street1": "4141 NE 2 AVE",
      "street2": "SUITE 204-A",
      "city": "MIAMI",
      "state": "FL",
      "zip": "33137"
    },
    "formerCompany": {
      "formerConformedName": "Securitas EDGAR Filings, Inc.",
      "dateOfNameChange": "20090223"
    }
  }
}
```

## License
This project is licensed under the ISC License - see the [License](https://en.wikipedia.org/wiki/ISC_license) for details.