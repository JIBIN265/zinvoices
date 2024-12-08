using InvCatalogService as service from '../../../srv/cat-service';

annotate service.Invoice with @(
    odata.draft.enabled,
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: '{i18n>FiscalYear}',
                Value: fiscalYear,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>CompanyCode}',
                Value: companyCode,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>DocumentDate}',
                Value: documentDate,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>PostingDate}',
                Value: postingDate,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>SupplierInvoiceParty}',
                Value: supInvParty,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Currency}',
                Value: documentCurrency,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>GrossAmount}',
                Value: invGrossAmount,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Status}',
                Value: status,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Comments}',
                Value: comments,
            },
        ],
    },
    UI.Facets                    : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>ItemDetails}',
            ID    : 'ItemDetails',
            Target: 'to_InvoiceItem/@UI.LineItem#ItemDetails',
        },
    ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: '{i18n>DocumentId}',
            Value: documentId,
        },
        {
            $Type: 'UI.DataField',
            Value: newInvoice,
            Label: '{i18n>InvoiceNumber}',
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>FiscalYear}',
            Value: fiscalYear,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>CompanyCode}',
            Value: companyCode,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>DocumentDate}',
            Value: documentDate,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>PostingDate}',
            Value: postingDate,
        },
        {
            $Type: 'UI.DataField',
            Value: documentCurrency,
            Label: '{i18n>Currency}',
        },
        {
            $Type: 'UI.DataField',
            Value: invGrossAmount,
            Label: '{i18n>GrossAmount}',
        },
        {
            $Type : 'UI.DataField',
            Value : supInvParty,
            Label : '{i18n>SupplierInvoiceParty}',
        },
        {
            $Type : 'UI.DataField',
            Value : createdBy,
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label: '{i18n>Status}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'InvCatalogService.threewaymatch',
            Label : '{i18n>threeWayMatch}',
        },
    ],
    UI.HeaderFacets              : [{
        $Type : 'UI.ReferenceFacet',
        Label : '{i18n>AdminData}',
        ID    : 'i18nAdmionData',
        Target: '@UI.FieldGroup#i18nAdmionData',
    }, ],
    UI.FieldGroup #i18nAdmionData: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : companyCode,
                Label : '{i18n>CompanyCode}',
            },
            {
                $Type : 'UI.DataField',
                Value : fiscalYear,
                Label : '{i18n>FiscalYear}',
            },
            {
                $Type: 'UI.DataField',
                Value: createdBy,
            },
            {
                $Type: 'UI.DataField',
                Value: newInvoice,
                Label: '{i18n>InvoiceNumber}',
            },
        ],
    },
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : documentId,
        },
        TypeName : '',
        TypeNamePlural : '',
    },
);

annotate service.InvoiceItem with @(UI.LineItem #ItemDetails: [
    {
        $Type: 'UI.DataField',
        Value: sup_InvoiceItem,
        Label: '{i18n>InvoiceItem}',
    },
    {
        $Type: 'UI.DataField',
        Value: supplierInvoice,
        Label: '{i18n>SupplierInvoice}',
    },
    {
        $Type: 'UI.DataField',
        Value: supInvItemAmount,
        Label: '{i18n>InvoiceItemAmount}',
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseOrderItem,
        Label: '{i18n>PO Item}',
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseOrder,
        Label: '{i18n>PurchaseOrder}',
    },
    {
        $Type: 'UI.DataField',
        Value: poQuantityUnit,
        Label: '{i18n>Unit}',
    },
    {
        $Type: 'UI.DataField',
        Value: quantityPOUnit,
        Label: '{i18n>Quantity}',
    },
    {
        $Type: 'UI.DataField',
        Value: refDocItem,
        Label: '{i18n>RefdocumentItem}',
    },
    {
        $Type: 'UI.DataField',
        Value: referenceDocument,
        Label: '{i18n>ReferenceDocument}',
    },
    {
        $Type: 'UI.DataField',
        Value: refDocFiscalYear,
        Label: '{i18n>RefdocFiscalYear}',
    },
    {
        $Type: 'UI.DataField',
        Value: taxCode,
        Label: '{i18n>TaxCode}',
    },
]);
