export enum TransactionCode {
  OpenMarketPurchase = "P",
  OpenMarketSale = "S",
  GrantOrAward = "A",
  SaleBackToCompany = "D",
  PaymentOfExerciseOrTaxLiability = "F",
  DiscretionaryTransaction = "I",
  ExerciseOfDerivativeSecurity = "M",
  ConversionOfDerivativeSecurity = "C",
  ExpirationOfShortDerivative = "E",
  ExpirationOfLongDerivative = "H",
  ExerciseOfOutOfMoneyDerivative = "O",
  ExerciseOfInTheMoneyDerivative = "X",
  GiftOrDonation = "G",
  VoluntaryReport = "V",
  OtherAcquisitionOrDisposition = "J",
  EquitySwapTransaction = "K",
  DispositionPursuantToTender = "U",
}

export enum Form8KItemType {
  MaterialAgreement = "1.01",
  TerminationAgreement = "1.02",
  Bankruptcy = "1.03",
  MineSafety = "1.04",
  CompletionAcquisition = "2.01",
  OperationsResults = "2.02",
  DirectFinancialObligation = "2.03",
  TriggeringEvents = "2.04",
  ExitCosts = "2.05",
  MaterialImpairments = "2.06",
  Delisting = "3.01",
  UnregisteredSales = "3.02",
  MaterialModification = "3.03",
  AccountantChanges = "4.01",
  FinancialRestatement = "4.02",
  ControlChanges = "5.01",
  DirectorChanges = "5.02",
  BylawsAmendment = "5.03",
  TradingSuspension = "5.04",
  EthicsAmendment = "5.05",
  ShellStatus = "5.06",
  ShareholderVote = "5.07",
  DirectorNominations = "5.08",
  ABSInformation = "6.01",
  ServicerChange = "6.02",
  CreditEnhancement = "6.03",
  FailedDistribution = "6.04",
  SecuritiesActUpdate = "6.05",
  RegFD = "7.01",
  OtherEvents = "8.01",
  FinancialExhibits = "9.01",
}

export enum Form13FType {
  HoldingsReport = "13F-HR",
  Notice = "13F-NT",
  HoldingsAmendment = "13F-HR/A",
  NoticeAmendment = "13F-NT/A",
}

export enum InvestmentDiscretion {
  Sole = "SOLE",
  Shared = "SHARED",
  None = "NONE",
}

export enum ShareType {
  Shares = "SH",
  PrincipalAmount = "PRN",
}

export enum OwnershipType {
  Direct = "D",
  Indirect = "I",
}

export enum FileType {
  Text = "TEXT",
  Graphic = "GRAPHIC",
  XML = "XML",
  PDF = "PDF",
  HTML = "HTML",
}
