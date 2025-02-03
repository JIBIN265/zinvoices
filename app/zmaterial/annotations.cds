using InvCatalogService as service from '../../srv/cat-service';

annotate service.Material with @(
    odata.draft.enabled,
    UI.FieldGroup #GeneratedGroup         : {
        $Type: 'UI.FieldGroupType',
        Data : [
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
                Label: '{i18n>MaterialDocumentHeaderText}',
                Value: MaterialDocumentHeaderText,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>ReferenceDocument}',
                Value: ReferenceDocument,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>VersionForPrintingSlip}',
                Value: VersionForPrintingSlip,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>GoodsMovementCode}',
                Value: GoodsMovementCode,
            },
        ],
    },
    UI.Facets                             : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : '{i18n>GeneralInformation}',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>MaterialItemDetails}',
            ID    : 'MaterialItemDetails',
            Target: 'to_MaterialItem/@UI.LineItem#MaterialItemDetails',
        },
    ],
    UI.LineItem                           : [
        {
            $Type: 'UI.DataField',
            Label: '{i18n>DocumentId1}',
            Value: documentId,
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label: '{i18n>Status}',
        },
        {
            $Type: 'UI.DataField',
            Value: MaterialDocumentYear,
            Label: '{i18n>Materialdocumentyear}',
        },
        {
            $Type: 'UI.DataField',
            Value: MaterialDocument,
            Label: '{i18n>MaterialDocument}',
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>ReferenceDocument}',
            Value: ReferenceDocument,
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
            Label: '{i18n>MaterialDocumentHeaderText}',
            Value: MaterialDocumentHeaderText,
        },
        {
            $Type: 'UI.DataField',
            Value: InventoryTransactionType,
            Label: '{i18n>InventoryTransactionType}',
        },
    ],
    UI.FieldGroup #i18nMaterialItemDetails: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.Material,
                Label: 'Material',
            },
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.Plant,
                Label: 'Plant',
            },
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.StorageLocation,
                Label: 'StorageLocation',
            },
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.GoodsMovementType,
                Label: 'GoodsMovementType',
            },
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.Supplier,
                Label: 'Supplier',
            },
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.purchaseOrder,
                Label: 'purchaseOrder',
            },
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.purchaseOrderItem,
                Label: 'purchaseOrderItem',
            },
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.GoodsMovementRefDocType,
                Label: 'GoodsMovementRefDocType',
            },
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.EntryUnit,
                Label: 'EntryUnit',
            },
            {
                $Type: 'UI.DataField',
                Value: to_MaterialItem.QuantityInEntryUnit,
                Label: 'QuantityInEntryUnit',
            },
        ],
    },
    UI.HeaderFacets                       : [{
        $Type : 'UI.ReferenceFacet',
        Label : '{i18n>AdminData}',
        ID    : 'i18nAdminData',
        Target: '@UI.FieldGroup#i18nAdminData',
    }, ],
    UI.FieldGroup #i18nAdminData          : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: createdAt,
            },
            {
                $Type: 'UI.DataField',
                Value: createdBy,
            },
            {
                $Type: 'UI.DataField',
                Value: documentId,
                Label: '{i18n>DocumentId1}',
            },
            {
                $Type: 'UI.DataField',
                Value: MaterialDocument,
                Label: '{i18n>MaterialDocument}',
            },
            {
                $Type: 'UI.DataField',
                Value: MaterialDocumentYear,
                Label: '{i18n>MaterialDocumentYear}',
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
        Description : {
            $Type : 'UI.DataField',
            Value : documentId,
        },
    },
);

annotate service.MaterialItem with @(UI.LineItem #MaterialItemDetails: [
    {
        $Type: 'UI.DataField',
        Value: Material,
        Label: '{i18n>Material}',
    },
    {
        $Type: 'UI.DataField',
        Value: Plant,
        Label: '{i18n>Plant}',
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseOrder,
        Label: '{i18n>PurchaseOrder}',
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseOrderItem,
        Label: '{i18n>PurchaseOrderItem}',
    },
    {
        $Type: 'UI.DataField',
        Value: Supplier,
        Label: '{i18n>Supplier}',
    },
    {
        $Type: 'UI.DataField',
        Value: StorageLocation,
        Label: '{i18n>StorageLocation}',
    },
    {
        $Type: 'UI.DataField',
        Value: EntryUnit,
        Label: '{i18n>EntryUnit}',
    },
    {
        $Type: 'UI.DataField',
        Value: GoodsMovementRefDocType,
        Label: '{i18n>GoodsMovementRefDoc}',
    },
    {
        $Type: 'UI.DataField',
        Value: GoodsMovementType,
        Label: '{i18n>GoodsMovementType}',
    },
    {
        $Type: 'UI.DataField',
        Value: QuantityInEntryUnit,
        Label: '{i18n>QuantityInEntryUnit}',
    },
]);
