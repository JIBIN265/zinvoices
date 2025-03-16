using zsupplier as persistence from '../db/schema';
using {sap.common as common} from '../db/common';
using {CE_PURCHASEORDER_0001 as po} from './external/CE_PURCHASEORDER_0001';
using {API_MATERIAL_DOCUMENT_SRV as gr} from './external/API_MATERIAL_DOCUMENT_SRV';
using {API_PRODUCT_SRV as pr} from './external/API_PRODUCT_SRV';
using {Attachments} from '@cap-js/sdm';

service InvCatalogService @(requires: 'authenticated-user') {

    entity PurchaseOrder            as
        projection on po.PurchaseOrder {
            *,
            _PurchaseOrderItem : redirected to PurchaseOrderItem,
            _PurchaseOrderPartner,
            _SupplierAddress
        };

    entity PurchaseOrderItem        as
        projection on po.PurchaseOrderItem {
            *
        };

    entity Invoice                  as projection on persistence.InvoiceEntity
        actions {
            @(Common.SideEffects.TargetEntities: ['/InvCatalogService.EntityContainer/Invoice'])
            action copyInvoice(in : $self) returns Invoice;
        };

    extend persistence.InvoiceEntity with {
        @description: 'Attachments Composition'
        attachments : Composition of many Attachments;
    };

    entity InvoiceItem              as projection on persistence.InvoiceEntity.to_InvoiceItem;


    entity Material                 as projection on persistence.MaterialEntity
        actions {
            @(Common.SideEffects.TargetEntities: ['/InvCatalogService.EntityContainer/Material'])
            action copyMaterial(in : $self) returns Material;
        };

    entity MaterialItem             as projection on persistence.MaterialEntity.to_MaterialItem;

    extend persistence.MaterialEntity with {
        @description: 'Attachments Composition'
        attachments : Composition of many Attachments;
    };

    entity Product                  as projection on persistence.ProductEntity
        actions {
            @(Common.SideEffects.TargetEntities: ['/InvCatalogService.EntityContainer/Product'])
            action copyProduct(in : $self) returns Product;
        };

    entity ProductItem              as projection on persistence.ProductEntity.to_ProductItem;

    extend persistence.ProductEntity with {
        @description: 'Attachments Composition'
        attachments : Composition of many Attachments;
    };

    entity A_Product                as
        projection on pr.A_Product {
            *
        };

    entity A_MaterialDocumentHeader as
        projection on gr.A_MaterialDocumentHeader {
            *
        };

    entity Currencies               as projection on common.Currencies;
    entity StatusValues             as projection on persistence.StatusValues;

    action postInvoice(documentNumber : String,
                       netAmount : String,
                       taxId : String,
                       taxName : String,
                       purchaseOrderNumber : String,
                       grossAmount : String,
                       currencyCode : String,
                       receiverContact : String,
                       documentDate : String,
                       taxAmount : String,
                       taxRate : String,
                       receiverName : String,
                       receiverAddress : String,
                       paymentTerms : String,
                       senderAddress : String,
                       senderName : String,
                       senderMail : String,
                       dmsFolder : String,
                       to_Item : many {
        description : String;
        netAmount : String;
        quantity : String;
        unitPrice : String;
        materialNumber : String;
        unitOfMeasure : String;
    }) returns {
        documentId : String(10);
        invoiceNo : String(10);
        FiscalYear : String(4);
        grossAmount : String;
        message : String;
        indicator : String(1);
        url : String;

    };
}
