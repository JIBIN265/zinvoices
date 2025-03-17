using InvCatalogService as service from '../../srv/cat-service';

// annotate service.Invoice.attachments{
//     mimeType
// }


annotate service.Invoice with @(
    odata.draft.enabled,
    ![@UI.Criticality]                          : statusColor.criticality,
    UI.FieldGroup #GeneratedGroup               : {
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
            {
                $Type: 'UI.DataField',
                Value: AccountingDocumentType,
                Label: '{i18n>AccountingDocumentType}',
            },
            {
                $Type: 'UI.DataField',
                Value: InvoicingParty,
                Label: '{i18n>InvoicingParty}',
            },
            {
                $Type: 'UI.DataField',
                Value: DocumentHeaderText,
                Label: '{i18n>DocumentHeaderText}',
            },
            {
                $Type: 'UI.DataField',
                Value: PaymentTerms,
                Label: '{i18n>PaymentTerms}',
            },
        ],
    },
    UI.Facets                                   : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : '{i18n>GeneralInformation}',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>ItemDetails}',
            ID    : 'ItemDetails',
            Target: 'to_InvoiceItem/@UI.LineItem#ItemDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>InvoiceLogs}',
            ID : 'i18nInvoiceLog',
            Target : 'to_InvoiceLogs/@UI.SelectionPresentationVariant#i18nInvoiceLog',
        },
    ],
    UI.LineItem                                 : [
        {
            $Type                : 'UI.DataField',
            Label                : '{i18n>DocumentId}',
            Value                : documentId,
            
            ![@HTML5.CssDefaults]: {width: '150px', },
        },
        {
            $Type                    : 'UI.DataField',
            Label                    : '{i18n>Status}',
            Value                    : statusColor.value,
            Criticality              : statusColor.criticality, //Supported values 0,1,2,3,5
            CriticalityRepresentation: #WithIcon,
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label: '{i18n>DetailedStatus}',
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
            $Type : 'UI.DataFieldForAction',
            Action: 'InvCatalogService.copyInvoice',
            Label : '{i18n>copy}',
        },
        {
            $Type : 'UI.DataField',
            Value : mode,
        },
    ],
    UI.HeaderFacets                             : [{
        $Type : 'UI.ReferenceFacet',
        Label : '{i18n>AdminData}',
        ID    : 'i18nAdmionData',
        Target: '@UI.FieldGroup#i18nAdmionData',
    }, ],
    UI.FieldGroup #i18nAdmionData               : {
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
    UI.HeaderInfo                               : {
        Title         : {
            $Type: 'UI.DataField',
            Value: documentId,
        },
        TypeName      : '',
        TypeNamePlural: '',
    },
    UI.SelectionPresentationVariant #tableView  : {
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
    UI.Chart #chartView                         : {
        $Type          : 'UI.ChartDefinitionType',
        ChartType      : #Column,
        Dimensions     : [
            mode,
            statusFlag
        ],
        DynamicMeasures: ['@Analytics.AggregatedProperty#documentId_sum', ],
        Title          : '{i18n>DocumentsBySupplierInvoice}',
    },
    UI.SelectionPresentationVariant #chartView  : {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.Chart#chartView', ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [],
        },
        Text               : '{i18n>ChartView}',
    },
    UI.SelectionPresentationVariant #table      : {
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
        Text               : '{i18n>AllInvoices1}',
    },
    UI.SelectionFields                          : [
        documentId,
        newInvoice,
        companyCode,
        fiscalYear,
        mode,
        statusFlag
    ],
    UI.LineItem #tableView                      : [
        {
            $Type                : 'UI.DataField',
            Value                : documentId,
            Label                : '{i18n>DocumentId}',
            ![@HTML5.CssDefaults]: {width: '150px', },
        },
        {
            $Type                    : 'UI.DataField',
            Value                    : statusColor.criticality,
            Label                    : '{i18n>Status}',
            Criticality              : statusColor.criticality,
            CriticalityRepresentation: #WithIcon,
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label: '{i18n>DetailedStatus}',
        },
        {
            $Type: 'UI.DataField',
            Value: newInvoice,
        },
        {
            $Type: 'UI.DataField',
            Value: fiscalYear,
        },
        {
            $Type: 'UI.DataField',
            Value: companyCode,
        },
        {
            $Type: 'UI.DataField',
            Value: documentDate,
            Label: '{i18n>DocumentDate}',
        },
        {
            $Type: 'UI.DataField',
            Value: postingDate,
            Label: '{i18n>PostingDate}',
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
        },
        {
            $Type: 'UI.DataField',
            Value: createdBy,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'InvCatalogService.copyInvoice',
            Label : '{i18n>copy}',
        },
        {
            $Type : 'UI.DataField',
            Value : mode,
        },
    ],
    UI.SelectionPresentationVariant #tableView1 : {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem#tableView', ],
            SortOrder     : [{
                $Type     : 'Common.SortOrderType',
                Property  : documentId,
                Descending: true,
            }, ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [{
                $Type       : 'UI.SelectOptionType',
                PropertyName: mode,
                Ranges      : [{
                    Sign  : #I,
                    Option: #EQ,
                    Low   : 'pdf',
                }, ],
            }, ],
        },
        Text               : '{i18n>PdfExtracted}',
    },
    UI.LineItem #tableView1                     : [],
    UI.LineItem #tableView2                     : [
        {
            $Type                : 'UI.DataField',
            Value                : documentId,
            Label                : '{i18n>DocumentId}',
            ![@HTML5.CssDefaults]: {width: '150px', },
        },
        {
            $Type                    : 'UI.DataField',
            Value                    : statusColor.criticality,
            Label                    : '{i18n>Status}',
            Criticality              : statusColor.criticality,
            CriticalityRepresentation: #WithIcon,
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label: '{i18n>DetailedStatus}',
        },
        {
            $Type: 'UI.DataField',
            Value: newInvoice,
        },
        {
            $Type: 'UI.DataField',
            Value: fiscalYear,
        },
        {
            $Type: 'UI.DataField',
            Value: companyCode,
        },
        {
            $Type: 'UI.DataField',
            Value: documentDate,
            Label: '{i18n>DocumentDate}',
        },
        {
            $Type: 'UI.DataField',
            Value: postingDate,
            Label: '{i18n>PostingDate}',
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
        },
        {
            $Type: 'UI.DataField',
            Value: createdBy,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'InvCatalogService.copyInvoice',
            Label : '{i18n>copy}',
        },
        {
            $Type : 'UI.DataField',
            Value : mode,
        },
    ],
    UI.SelectionPresentationVariant #tableView2 : {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem#tableView2', ],
            SortOrder     : [{
                $Type     : 'Common.SortOrderType',
                Property  : documentId,
                Descending: true,
            }, ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [{
                $Type       : 'UI.SelectOptionType',
                PropertyName: mode,
                Ranges      : [{
                    Sign  : #I,
                    Option: #EQ,
                    Low   : 'email',
                }, ],
            }, ],
        },
        Text               : '{i18n>EmailAutomated}',
    },
    UI.LineItem #tableView3                     : [
        {
            $Type                : 'UI.DataField',
            Value                : documentId,
            Label                : '{i18n>DocumentId}',
            ![@HTML5.CssDefaults]: {width: '150px', },
        },
        {
            $Type                    : 'UI.DataField',
            Value                    : statusColor.criticality,
            Label                    : '{i18n>Status}',
            Criticality              : statusColor.criticality,
            CriticalityRepresentation: #WithIcon,
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label: '{i18n>DetailedStatus}',
        },
        {
            $Type: 'UI.DataField',
            Value: newInvoice,
        },
        {
            $Type: 'UI.DataField',
            Value: fiscalYear,
        },
        {
            $Type: 'UI.DataField',
            Value: companyCode,
        },
        {
            $Type: 'UI.DataField',
            Value: documentDate,
            Label: '{i18n>DocumentDate}',
        },
        {
            $Type: 'UI.DataField',
            Value: postingDate,
            Label: '{i18n>PostingDate}',
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
        },
        {
            $Type: 'UI.DataField',
            Value: createdBy,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'InvCatalogService.copyInvoice',
            Label : '{i18n>copy}',
        },
        {
            $Type : 'UI.DataField',
            Value : mode,
        },
    ],
    UI.SelectionPresentationVariant #tableView3 : {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem#tableView3', ],
            SortOrder     : [{
                $Type     : 'Common.SortOrderType',
                Property  : documentId,
                Descending: true,
            }, ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [{
                $Type       : 'UI.SelectOptionType',
                PropertyName: statusFlag,
                Ranges      : [{
                    Sign  : #I,
                    Option: #EQ,
                    Low   : 'S',
                }, ],
            }, ],
        },
        Text               : '{i18n>PostedInvoices}',
    },
    UI.LineItem #tableView4                     : [
        {
            $Type                : 'UI.DataField',
            Value                : documentId,
            Label                : '{i18n>DocumentId}',
            ![@HTML5.CssDefaults]: {width: '150px', },
        },
        {
            $Type                    : 'UI.DataField',
            Value                    : statusColor.criticality,
            Label                    : '{i18n>Status}',
            Criticality              : statusColor.criticality,
            CriticalityRepresentation: #WithIcon,
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label: '{i18n>DetailedStatus}',
        },
        {
            $Type: 'UI.DataField',
            Value: newInvoice,
        },
        {
            $Type: 'UI.DataField',
            Value: fiscalYear,
        },
        {
            $Type: 'UI.DataField',
            Value: companyCode,
        },
        {
            $Type: 'UI.DataField',
            Value: documentDate,
            Label: '{i18n>DocumentDate}',
        },
        {
            $Type: 'UI.DataField',
            Value: postingDate,
            Label: '{i18n>PostingDate}',
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
        },
        {
            $Type: 'UI.DataField',
            Value: createdBy,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'InvCatalogService.copyInvoice',
            Label : '{i18n>copy}',
        },
        {
            $Type : 'UI.DataField',
            Value : mode,
        },
    ],
    UI.SelectionPresentationVariant #tableView4 : {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem#tableView4', ],
            SortOrder     : [{
                $Type     : 'Common.SortOrderType',
                Property  : documentId,
                Descending: true,
            }, ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [{
                $Type       : 'UI.SelectOptionType',
                PropertyName: statusFlag,
                Ranges      : [{
                    Sign  : #I,
                    Option: #EQ,
                    Low   : 'E',
                }, ],
            }, ],
        },
        Text               : '{i18n>ErroneousInvoices}',
    },
    Analytics.AggregatedProperty #documentId_sum: {
        $Type               : 'Analytics.AggregatedPropertyType',
        Name                : 'documentId_sum',
        AggregatableProperty: documentId,
        AggregationMethod   : 'sum',
        ![@Common.Label]    : '{i18n>DocumentId}',
    },
);

annotate service.InvoiceItem with @(UI.LineItem #ItemDetails: [
    {
        $Type: 'UI.DataField',
        Value: purchaseOrder,
        Label: '{i18n>PurchaseOrder}',
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseOrderItem,
        Label: 'PO Item',
    },
    {
        $Type: 'UI.DataField',
        Value: poQuantityUnit,
        Label: '{i18n>UnitOfMeasure}',
    },
    {
        $Type: 'UI.DataField',
        Value: quantityPOUnit,
        Label: '{i18n>Quantity}',
    },
    {
        $Type: 'UI.DataField',
        Value: sup_InvoiceItem,
        Label: '{i18n>InvoiceItem}',
    },
    {
        $Type: 'UI.DataField',
        Value: supInvItemAmount,
        Label: 'Invoice Item Amount',
    },
    {
        $Type: 'UI.DataField',
        Value: taxCode,
        Label: '{i18n>TaxCode}',
    },
    {
        $Type: 'UI.DataField',
        Value: Plant,
        Label: '{i18n>Plant}',
    },
    {
        $Type: 'UI.DataField',
        Value: ProductType,
        Label: '{i18n>ProductType}',
    },
    {
        $Type: 'UI.DataField',
        Value: TaxJurisdiction,
        Label: '{i18n>TaxJurisdiction}',
    },
    {
        $Type: 'UI.DataField',
        Value: referenceDocument,
        Label: '{i18n>ReferenceDocument}',
    },
    {
        $Type: 'UI.DataField',
        Value: refDocFiscalYear,
        Label: '{i18n>RefDocFiscalYear}',
    },
    {
        $Type: 'UI.DataField',
        Value: refDocItem,
        Label: '{i18n>RefDocItem}',
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
        'search'
    ],
    Rollup                : #None,
    PropertyRestrictions  : true,
    GroupableProperties   : [
        documentId,
        newInvoice,
        companyCode,
        fiscalYear,
        mode,
        statusFlag
    ],
    AggregatableProperties: [{Property: documentId, }],
};

annotate service.Invoice with {
    supInvParty      @validation.message: 'Supplier Invoice Party is Mandatory'  @(Common.Label: '{i18n>SupplierInvoiceParty}',
                                                                                                                                // Common.FieldControl: #Mandatory
                                                                                                 );
    documentId       @Common.Label      : '{i18n>DocumentId1}';
    newInvoice       @Common.Label      : '{i18n>InvoiceNumber}';
    companyCode      @validation.message: 'Company Code is Mandatory'            @(Common.Label: '{i18n>CompanyCode}',
                                                                                                                       // Common.FieldControl: #Mandatory
                                                                                                 );
    fiscalYear       @validation.message: 'Fiscal Year is Mandatory'             @(Common.Label: '{i18n>FiscalYear}',
                                                                                                                      // Common.FieldControl: #Mandatory

                                                                                                 );
    // documentDate      @Common.FieldControl: #Mandatory                             @validation.message: 'Document Date is Mandatory';
    // postingDate       @Common.FieldControl: #Mandatory                             @validation.message: 'Posting Date is Mandatory';
    documentCurrency @( // @Common.FieldControl: #Mandatory                             @(
        validation.message             : 'Document Currency is Mandatory',
        Label                          : '{i18n>Currency}',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Currencies',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: documentCurrency_code,
                    ValueListProperty: 'code',
                },
                {
                    $Type            : 'Common.ValueListParameterOut',
                    ValueListProperty: 'descr',
                    LocalDataProperty: documentCurrency.descr,
                },
            ],
        },
    );
// invGrossAmount    @Common.FieldControl: #Mandatory                             @validation.message: 'Invoice Gross Amount is Mandatory';
};

annotate service.Currencies with {
    code @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextFirst,
    }
};
annotate service.Invoice with {
    mode @Common.Label : '{i18n>ExtractionMethod}'
};

annotate service.Invoice with {
    statusFlag @Common.Label : '{i18n>Status}'
};

annotate service.InvoiceLogs with @(
    UI.LineItem #i18nInvoiceLog : [
        {
            $Type : 'UI.DataField',
            Value : stepNo,
            Label : '{i18n>StepNo}',
        },
        {
            $Type : 'UI.DataField',
            Value : logMessage,
            Label : '{i18n>LogMessage}',
            ![@HTML5.CssDefaults]: {width: '1000px', },
        },
    ],
    UI.SelectionPresentationVariant #i18nInvoiceLog : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem#i18nInvoiceLog',
            ],
            SortOrder : [
                {
                    $Type : 'Common.SortOrderType',
                    Property : stepNo,
                    Descending : false,
                },
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
    },
);

