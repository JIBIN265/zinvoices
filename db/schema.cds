using {
  sap,
  cuid,
  Currency,
  managed,
} from '@sap/cds/common';
using {Attachments} from '@cap-js/sdm';

namespace zsupplier;

entity InvoiceEntity : cuid, managed, {
  @description: 'Product Group Association'
  documentId       : Integer;
  fiscalYear       : String(4);
  companyCode      : String(4);
  documentDate     : Date;
  postingDate      : Date;
  supInvParty      : String(10);
  documentCurrency : Association to one sap.common.Currencies;
  invGrossAmount   : Decimal(13, 3);
  status           : String(200);
  statusFlag       : String(1);
  mode             : String(10);
  statusColor      : Association to one StatusValues
                       on statusColor.code = statusFlag;
  newInvoice       : String(10);
  to_InvoiceItem   : Composition of many InvoiceItemEntity;

  @description: 'Attachments Composition'
  attachments      : Composition of many Attachments;
}

aspect InvoiceItemEntity : cuid, managed {

  @description: 'Product Restriction ID'
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
}

entity StatusValues {
  key code           : String(1);
      value          : String(10);
      criticality    : Integer;
      deletePossible : Boolean;
      insertPossible : Boolean;
      updatePossible : Boolean;
}
