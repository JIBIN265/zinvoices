using {
  sap,
  cuid,
  Currency,
  managed,
} from '@sap/cds/common';

namespace zsupplier;

entity InvoiceEntity : cuid, managed, {
  documentId             : Integer;
  fiscalYear             : String(4);
  companyCode            : String(4);
  documentDate           : Date;
  postingDate            : Date;
  supInvParty            : String(10);
  documentCurrency       : Association to one sap.common.Currencies;
  invGrossAmount         : Decimal(13, 3);
  DocumentHeaderText     : String(50);
  PaymentTerms           : String(4);
  AccountingDocumentType : String(4);
  InvoicingParty         : String(10);
  status                 : String(200);
  statusFlag             : String(1);
  mode                   : String(10);
  dmsFolder              : String(50);
  statusColor            : Association to one StatusValues
                             on statusColor.code = statusFlag;
  newInvoice             : String(10);
  to_InvoiceItem         : Composition of many InvoiceItemEntity;
}

aspect InvoiceItemEntity : cuid, managed {
  supplierInvoice   : String(10);
  fiscalYear        : String(4);
  sup_InvoiceItem   : String(5);
  purchaseOrder     : String(10);
  purchaseOrderItem : String(5);
  referenceDocument : String(10);
  refDocFiscalYear  : String(4);
  refDocItem        : String(5);
  taxCode           : String(3);
  documentCurrency  : Currency;
  supInvItemAmount  : Decimal(13, 3);
  poQuantityUnit    : String(3);
  quantityPOUnit    : Decimal(13, 3);
  Plant             : String(4);
  TaxJurisdiction   : String(4);
  ProductType       : String(4);
}

entity StatusValues {
  key code           : String(1);
      value          : String(10);
      criticality    : Integer;
      deletePossible : Boolean;
      insertPossible : Boolean;
      updatePossible : Boolean;
}


entity MaterialEntity : cuid, managed, {
  documentId                 : Integer;
  documentDate               : Date;
  postingDate                : Date;
  MaterialDocumentHeaderText : String(50);
  ReferenceDocument          : String(10);
  VersionForPrintingSlip     : String(1);
  GoodsMovementCode          : String(2);
  status                     : String(200);
  statusFlag                 : String(1);
  MaterialDocument           : String(10);
  MaterialDocumentYear       : String(4);
  InventoryTransactionType   : String(2);
  statusColor                : Association to one StatusValues
                                 on statusColor.code = statusFlag;
  to_MaterialItem            : Composition of many MaterialItemEntity;
}

aspect MaterialItemEntity : cuid, managed {
  Material                : String(10);
  Plant                   : String(4);
  StorageLocation         : String(4);
  purchaseOrder           : String(10);
  purchaseOrderItem       : String(5);
  GoodsMovementType       : String(3);
  Supplier                : String(10);
  GoodsMovementRefDocType : String(1);
  EntryUnit               : String(2);
  QuantityInEntryUnit     : String(6);
}


entity ProductEntity : cuid, managed {
  documentId            : Integer;
  Product               : String(4);
  ProductType           : String(4);
  GrossWeight           : Decimal(13, 3);
  WeightUnit            : String(2);
  NetWeight             : Decimal(13, 3);
  ProductGroup          : String(4);
  BaseUnit              : String(2);
  ItemCategoryGroup     : String(4);
  IndustrySector        : String(2);
  status                : String(200);
  statusFlag            : String(1);
  statusColor           : Association to one StatusValues
                            on statusColor.code = statusFlag;
  to_ProductItem        : Composition of many ProductItemEntity;
  to_SalesDelivery      : Composition of many ProductSalesDeliveryEntity;
  to_ProductSalesTax    : Composition of many ProductSalesTaxEntity;
  to_ProductProcurement : Composition of one ProductProcurementEntity;
}

aspect ProductItemEntity : cuid, managed {
  Product                  : String(4);
  Plant                    : String(4);
  AvailabilityCheckType    : String(2);
  PeriodType               : String(2);
  ProfitCenter             : String(5);
  MaintenanceStatusName    : String(2);
  FiscalYearCurrentPeriod  : String(4);
  FiscalMonthCurrentPeriod : String(2);
  BaseUnit                 : String(2);
}

aspect ProductSalesDeliveryEntity : cuid, managed {
  Product                        : String(4);
  ProductSalesOrg                : String(4);
  ProductDistributionChnl        : String(2);
  MinimumOrderQuantity           : Decimal(13, 3);
  SupplyingPlant                 : String(4);
  PriceSpecificationProductGroup : String(4);
  AccountDetnProductGroup        : String(4);
  DeliveryNoteProcMinDelivQty    : Decimal(13, 3);
  ItemCategoryGroup              : String(4);
  BaseUnit                       : String(2);
}

aspect ProductSalesTaxEntity : cuid, managed {
  Product           : String(4);
  Country           : String(2);
  TaxCategory       : String(4);
  TaxClassification : String(1);
}

aspect ProductProcurementEntity : cuid, managed {
  Product                   : String(4);
  PurchaseOrderQuantityUnit : String(4);
  VarblPurOrdUnitStatus     : String(1);
  PurchasingAcknProfile     : String(4);
}
