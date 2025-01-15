# SEC EDGAR Parser

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

If you have ever wished that the SEC archive documents were in a more usable format, this tool is for you.

This small library was built to parse those edgar formatted documents like those found at [the SEC archive website](https://www.sec.gov/Archives/edgar/data/1849440/000084251724000086/0000842517-24-000086.txt) into a usable JS object.

### Be advised
1. The SEC archive does enforce IP based rate limiting (currently set at ten requests per second) so when you request these docs, remember to account for this delay. 
2. All leaf values in the resulting JS object are represented as STRINGs to help preserve the document intent. For example, some numeric or date values might contain leading zeros (ex: `000123123`) in the event these leading zeroes are references to other documents, their values are unaltered.
3. This might not handle 100% of SEC document formats laid out in the [PDS Dissemination Specification](https://www.sec.gov/files/edgar/pds_dissemination_spec.pdf). If you find a document that is not being parsed correctly, please open an issue and I will try to fix it.


## Example

```bash
$ npm install sec-edgar-parser
```

## Example `getObjectFromUrl`
This function calls the SEC, and immediately parses the document into an object.
```ts
import { getObjectFromUrl, getObjectFromString } from "sec-edgar-parser";

const url = 'https://www.sec.gov/Archives/edgar/data/1614199/000110465924058302/0001104659-24-058302.txt';
const obj = await getObjectFromUrl(url, 'myEmailAddress@gmail.com');
console.log(JSON.stringify(obj, null, 2));
```

## Example `main.ts`
Add as many urls as you want to the `urls` array in `src/main.ts`.

Remember to include your email address as a command line argument.

```bash
ts-node ./src/main.ts myEmailAddress@gmail.com
```
Example output:

```bash
Calling: https://www.sec.gov/Archives/edgar/data/1614199/000110465924058302/0001104659-24-058302.txt
output: /tmp/SEC-output-0001104659-24-058302.json
```

## Example `getObjectFromString`
This function processes SEC filing documents from a string. 
```ts
// Example: from a string
const string = `
<SEC-DOCUMENT>0001104659-24-058302.txt : 20240507
<SEC-HEADER>0001104659-24-058302.hdr.sgml : 20240507
<ACCEPTANCE-DATETIME>20240507212710
ACCESSION NUMBER:		0001104659-24-058302
CONFORMED SUBMISSION TYPE:	4
PUBLIC DOCUMENT COUNT:		1

  <... Doc omitted for brevity ...>

REPORTING-OWNER:	

	OWNER DATA:	
		COMPANY CONFORMED NAME:			Pianalto Sandra
		CENTRAL INDEX KEY:			0001614199
		ORGANIZATION NAME:           	

	FILING VALUES:
		FORM TYPE:		4
		SEC ACT:		1934 Act
		SEC FILE NUMBER:	000-54863
		FILM NUMBER:		24923992

	MAIL ADDRESS:	
		STREET 1:		1000 EATON BOULEVARD
		CITY:			CLEVELAND
		STATE:			OH
		ZIP:			44122
        
  <... Doc omitted for brevity ...>

</TEXT>
</DOCUMENT>
</SEC-DOCUMENT>
`
console.log(JSON.stringify(getObjectFromString(string), null, 2))

```
### Example output
```json
{
  "acceptanceDatetime": "20240507212710",
  "accessionNumber": "0001104659-24-058302",
  "conformedSubmissionType": "4",
  "publicDocumentCount": "1",
  "conformedPeriodOfReport": "20240503",
  "filedAsOfDate": "20240507",
  "dateAsOfChange": "20240507",
  "reportingOwner": [
    {
      "ownerData": {
        "companyConformedName": "Pianalto Sandra",
        "centralIndexKey": "0001614199",
        "organizationName": null
      },
      "filingValues": {
        "formType": "4",
        "secAct": "1934 Act",
        "secFileNumber": "000-54863",
        "filmNumber": "24923992"
      },
      "mailAddress": {
        "street1": "1000 EATON BOULEVARD",
        "city": "CLEVELAND",
        "state": "OH",
        "zip": "44122"
      }
    }
  ],
  "issuer": [
    {
      "companyData": {
        "companyConformedName": "Eaton Corp plc",
        "centralIndexKey": "0001551182",
        "standardIndustrialClassification": "MISC INDUSTRIAL & COMMERCIAL MACHINERY & EQUIPMENT [3590]",
        "organizationName": "06 Technology",
        "irsNumber": "981059235",
        "fiscalYearEnd": "1231"
      },
      "businessAddress": {
        "street1": "30 PEMBROKE ROAD",
        "street2": "EATON HOUSE",
        "city": "DUBLIN",
        "state": "L2",
        "zip": "DUBLIN 4",
        "businessPhone": "353 1637 2900"
      },
      "mailAddress": {
        "street1": "30 PEMBROKE ROAD",
        "street2": "EATON HOUSE",
        "city": "DUBLIN",
        "state": "L2",
        "zip": "DUBLIN 4"
      },
      "formerCompany": [
        {
          "formerConformedName": "Eaton Corp Ltd",
          "dateOfNameChange": "20120530"
        }
      ]
    }
  ]
}
```

## License
This project is licensed under the ISC License - see the [License](https://en.wikipedia.org/wiki/ISC_license) for details.