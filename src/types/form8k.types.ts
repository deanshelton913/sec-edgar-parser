export interface Form8KFiling {
  acceptanceDatetime: string;
  accessionNumber: string;
  conformedSubmissionType: string;
  publicDocumentCount: string;
  conformedPeriodOfReport: string;
  itemInformation: string[];
  filedAsOfDate: string;
  dateAsOfChange: string;
  filer: Array<{
    companyData: {
      companyConformedName: string;
      centralIndexKey: string;
      standardIndustrialClassification: string;
      irsNumber: string;
      stateOfIncorporation: string;
      fiscalYearEnd: string;
    };
    filingValues: {
      formType: string;
      secAct: string;
      secFileNumber: string;
      filmNumber: string;
    };
    businessAddress: {
      street1: string;
      street2?: string;
      city: string;
      state: string;
      zip: string;
      businessPhone: string;
    };
    mailAddress: {
      street1: string;
      street2?: string;
      city: string;
      state: string;
      zip: string;
    };
    formerCompany?: Array<{
      formerConformedName: string;
      dateOfNameChange: string;
    }>;
  }>;
}

export const Form8KItemTextMap = {
  "Entry into a Material Definitive Agreement": "1.01",
  "Termination of a Material Definitive Agreement": "1.02",
  "Bankruptcy or Receivership": "1.03",
  "Mine Safety - Reporting of Shutdowns and Patterns of Violations": "1.04",
  "Completion of Acquisition or Disposition of Assets": "2.01",
  "Results of Operations and Financial Condition": "2.02",
  "Creation of a Direct Financial Obligation": "2.03",
  "Triggering Events That Accelerate or Increase a Direct Financial Obligation":
    "2.04",
  "Costs Associated with Exit or Disposal Activities": "2.05",
  "Material Impairments": "2.06",
  "Notice of Delisting or Transfer": "3.01",
  "Unregistered Sales of Equity Securities": "3.02",
  "Material Modifications to Rights of Security Holders": "3.03",
  "Changes in Registrant's Certifying Accountant": "4.01",
  "Non-Reliance on Previously Issued Financial Statements": "4.02",
  "Changes in Control of Registrant": "5.01",
  "Departure/Election of Directors or Principal Officers": "5.02",
  "Amendments to Articles of Incorporation or Bylaws": "5.03",
  "Temporary Suspension of Trading Under Registrant's Employee Benefit Plans":
    "5.04",
  "Amendments to the Registrant's Code of Ethics": "5.05",
  "Change in Shell Company Status": "5.06",
  "Submission of Matters to a Vote of Security Holders": "5.07",
  "Shareholder Director Nominations": "5.08",
  "ABS Informational and Computational Material": "6.01",
  "Change of Servicer or Trustee": "6.02",
  "Change in Credit Enhancement or Other External Support": "6.03",
  "Failure to Make a Required Distribution": "6.04",
  "Securities Act Updating Disclosure": "6.05",
  "Regulation FD Disclosure": "7.01",
  "Other Events": "8.01",
  "Financial Statements and Exhibits": "9.01",
} as const;
