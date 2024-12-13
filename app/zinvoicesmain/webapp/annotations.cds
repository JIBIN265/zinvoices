using InvCatalogService as service from '../../../srv/cat-service';

annotate service.Invoice with @(
    odata.draft.enabled,
    ![@UI.Criticality]                                    : statusColor.criticality,
    UI.FieldGroup #GeneratedGroup                         : {
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
                Value: documentCurrency_code,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>GrossAmount}',
                Value: invGrossAmount,
            },
        ],
    },
    UI.Facets                                             : [
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
    UI.LineItem                                           : [
        {
            $Type                : 'UI.DataField',
            Label                : '{i18n>DocumentId1}',
            Value                : documentId,
            ![@HTML5.CssDefaults]: {width: '7%', },
        },
        {
            $Type                    : 'UI.DataField',
            Label                    : '{i18n>Status1}',
            Value                    : statusColor.value,
            Criticality              : statusColor.criticality, //Supported values 0,1,2,3,5
            CriticalityRepresentation: #WithIcon,
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
            Value: documentCurrency_code,
            Label: '{i18n>Currency}',
        },
        {
            $Type: 'UI.DataField',
            Value: invGrossAmount,
            Label: '{i18n>GrossAmount}',
        },
        {
            $Type: 'UI.DataField',
            Value: supInvParty,
            Label: '{i18n>SupplierInvoiceParty}',
        },
        {
            $Type: 'UI.DataField',
            Value: createdBy,
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
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'InvCatalogService.copyInvoice',
            Label : '{i18n>copy}',
        },
    ],
    UI.HeaderFacets                                       : [{
        $Type : 'UI.ReferenceFacet',
        Label : '{i18n>AdminData}',
        ID    : 'i18nAdmionData',
        Target: '@UI.FieldGroup#i18nAdmionData',
    }, ],
    UI.FieldGroup #i18nAdmionData                         : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: companyCode,
                Label: '{i18n>CompanyCode}',
            },
            {
                $Type: 'UI.DataField',
                Value: fiscalYear,
                Label: '{i18n>FiscalYear}',
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
            {
                $Type: 'UI.DataField',
                Value: status,
                Label: '{i18n>Status}',
            },
        ],
    },
    UI.HeaderInfo                                         : {
        Title         : {
            $Type: 'UI.DataField',
            Value: documentId,
        },
        TypeName      : '',
        TypeNamePlural: '',
    },
    UI.SelectionPresentationVariant #tableView            : {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem', ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [],
        },
        Text               : 'Table View',
    },
    Analytics.AggregatedProperty #documentId_countdistinct: {
        $Type               : 'Analytics.AggregatedPropertyType',
        Name                : 'documentId_countdistinct',
        AggregatableProperty: documentId,
        AggregationMethod   : 'countdistinct',
        ![@Common.Label]    : '{i18n>DocumentIdCountDistinct}',
    },
    UI.Chart #chartView                                   : {
        $Type          : 'UI.ChartDefinitionType',
        ChartType      : #Column,
        Dimensions     : [
            supInvParty,
            createdBy,
        ],
        DynamicMeasures: ['@Analytics.AggregatedProperty#documentId_countdistinct', ],
        Title          : '{i18n>DocumentsBySupplierInvoice}',
    },
    UI.SelectionPresentationVariant #chartView            : {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.Chart#chartView', ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [],
        },
        Text               : 'Chart View',
    },
    UI.SelectionPresentationVariant #table                : {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem', ],
            SortOrder     : [{
                $Type     : 'Common.SortOrderType',
                Property  : documentId,
                Descending: true,
            }, ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [],
        },
    },
    UI.SelectionFields                                    : [
        documentId,
        newInvoice,
        companyCode,
        fiscalYear,
    ],
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
        Value: fiscalYear,
        Label: '{i18n>FiscalYear}',
    },
    {
        $Type: 'UI.DataField',
        Value: documentCurrency_code,
        Label: '{i18n>DocumentCurrency}',
    },
    {
        $Type: 'UI.DataField',
        Value: supInvItemAmount,
        Label: '{i18n>InvoiceItemAmount}',
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseOrderItem,
        Label: '{i18n>PoItem}',
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


annotate service.Invoice with @Aggregation.ApplySupported: {
    Transformations       : [
        'aggregate',
        'topcount',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'expand',
        'search'
    ],
    Rollup                : #None,
    PropertyRestrictions  : true,
    GroupableProperties   : [
        companyCode,
        supInvParty,
        postingDate,
        createdBy,
    ],
    AggregatableProperties: [{Property: documentId, }],
};

annotate service.Invoice with {
    supInvParty       @validation.message : 'Supplier Invoice Party is Mandatory'  @(
        Common.Label       : '{i18n>SupplierInvoiceParty}',
        Common.FieldControl: #Mandatory
    );
    documentId        @Common.Label       : '{i18n>DocumentId1}';
    newInvoice        @Common.Label       : '{i18n>InvoiceNumber}';
    companyCode       @validation.message : 'Company Code is Mandatory'            @(
        Common.Label       : '{i18n>CompanyCode}',
        Common.FieldControl: #Mandatory

    );
    fiscalYear        @validation.message : 'Fiscal Year is Mandatory'             @(
        Common.Label       : '{i18n>FiscalYear}',
        Common.FieldControl: #Mandatory

    );
    documentDate      @Common.FieldControl: #Mandatory                             @validation.message: 'Document Date is Mandatory';
    postingDate       @Common.FieldControl: #Mandatory                             @validation.message: 'Posting Date is Mandatory';
    documentCurrency  @Common.FieldControl: #Mandatory                             @(
        validation.message: 'Document Currency is Mandatory',
        Common.ValueListWithFixedValues : false,
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Currencies',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : documentCurrency_code,
                    ValueListProperty : 'code',
                },
            ],
            Label : '{i18n>Currency}',
        },
    );
    invGrossAmount    @Common.FieldControl: #Mandatory                             @validation.message: 'Invoice Gross Amount is Mandatory';
};
annotate service.Currencies with {
    code @Common.Text : {
        $value : descr,
        ![@UI.TextArrangement] : #TextFirst,
    }
};

