using InvCatalogService as service from '../../srv/cat-service';

annotate service.Material with @(
    odata.draft.enabled,
    UI.FieldGroup #GeneratedGroup         : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'documentDate',
                Value: documentDate,
            },
            {
                $Type: 'UI.DataField',
                Label: 'postingDate',
                Value: postingDate,
            },
            {
                $Type: 'UI.DataField',
                Label: 'MaterialDocumentHeaderText',
                Value: MaterialDocumentHeaderText,
            },
            {
                $Type: 'UI.DataField',
                Label: 'ReferenceDocument',
                Value: ReferenceDocument,
            },
            {
                $Type: 'UI.DataField',
                Label: 'VersionForPrintingSlip',
                Value: VersionForPrintingSlip,
            },
            {
                $Type: 'UI.DataField',
                Label: 'GoodsMovementCode',
                Value: GoodsMovementCode,
            },
        ],
    },
    UI.Facets                             : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Material Item Details',
            ID    : 'MaterialItemDetails',
            Target: 'to_MaterialItem/@UI.LineItem#MaterialItemDetails',
        },
    ],
    UI.LineItem                           : [
        {
            $Type: 'UI.DataField',
            Label: 'documentId',
            Value: documentId,
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label: 'status',
        },
        {
            $Type: 'UI.DataField',
            Value: MaterialDocumentYear,
            Label: 'MaterialDocumentYear',
        },
        {
            $Type: 'UI.DataField',
            Value: MaterialDocument,
            Label: 'MaterialDocument',
        },
        {
            $Type: 'UI.DataField',
            Label: 'ReferenceDocument',
            Value: ReferenceDocument,
        },
        {
            $Type: 'UI.DataField',
            Label: 'documentDate',
            Value: documentDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'postingDate',
            Value: postingDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'MaterialDocumentHeaderText',
            Value: MaterialDocumentHeaderText,
        },
        {
            $Type: 'UI.DataField',
            Value: InventoryTransactionType,
            Label: 'InventoryTransactionType',
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
                Label: 'documentId',
            },
            {
                $Type: 'UI.DataField',
                Value: MaterialDocument,
                Label: 'MaterialDocument',
            },
            {
                $Type: 'UI.DataField',
                Value: MaterialDocumentYear,
                Label: 'MaterialDocumentYear',
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
        Label: 'Material',
    },
    {
        $Type: 'UI.DataField',
        Value: Plant,
        Label: 'Plant',
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseOrder,
        Label: 'purchaseOrder',
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseOrderItem,
        Label: 'purchaseOrderItem',
    },
    {
        $Type: 'UI.DataField',
        Value: Supplier,
        Label: 'Supplier',
    },
    {
        $Type: 'UI.DataField',
        Value: StorageLocation,
        Label: 'StorageLocation',
    },
    {
        $Type: 'UI.DataField',
        Value: EntryUnit,
        Label: 'EntryUnit',
    },
    {
        $Type: 'UI.DataField',
        Value: GoodsMovementRefDocType,
        Label: 'GoodsMovementRefDocType',
    },
    {
        $Type: 'UI.DataField',
        Value: GoodsMovementType,
        Label: 'GoodsMovementType',
    },
    {
        $Type: 'UI.DataField',
        Value: QuantityInEntryUnit,
        Label: 'QuantityInEntryUnit',
    },
]);
