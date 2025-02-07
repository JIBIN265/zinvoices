using InvCatalogService as service from '../../srv/cat-service';
using from '../../db/schema';

annotate service.Product with @(
    odata.draft.enabled,
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Product}',
                Value : Product,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ProductType}',
                Value : ProductType,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>GrossWeight}',
                Value : GrossWeight,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>WeightUnit}',
                Value : WeightUnit,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>NetWeight}',
                Value : NetWeight,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ProductGroup}',
                Value : ProductGroup,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Baseunit}',
                Value : BaseUnit,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ItemCategoryGroup}',
                Value : ItemCategoryGroup,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>IndustrySector}',
                Value : IndustrySector,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>PlantDetails}',
            ID : 'i18nPlantDetails',
            Target : 'to_ProductItem/@UI.LineItem#i18nPlantDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>SalesDeliveryDetails}',
            ID : 'SalesDeliveryDetails',
            Target : 'to_SalesDelivery/@UI.LineItem#SalesDeliveryDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>SalesTaxDetails}',
            ID : 'i18nSalesTaxDetails',
            Target : 'to_ProductSalesTax/@UI.LineItem#i18nSalesTaxDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>ProcurementDetails}',
            ID : 'i18nProcurementDetails',
            Target : '@UI.FieldGroup#i18nProcurementDetails',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : '{i18n>DocumentId}',
            Value : documentId,
        },
        {
            $Type : 'UI.DataField',
            Value : statusFlag,
            Label : '{i18n>Flag}',
        },
        {
            $Type : 'UI.DataField',
            Value : status,
            Label : '{i18n>Status}',
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Product}',
            Value : Product,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>ProductType}',
            Value : ProductType,
        },
        {
            $Type : 'UI.DataField',
            Value : ProductGroup,
            Label : '{i18n>ProductGroup}',
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>GrossWeight}',
            Value : GrossWeight,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>WeightUnit}',
            Value : WeightUnit,
        },
        {
            $Type : 'UI.DataField',
            Value : NetWeight,
            Label : '{i18n>NetWeight}',
        },
        {
            $Type : 'UI.DataField',
            Value : BaseUnit,
            Label : '{i18n>BaseUnit}',
        },
        {
            $Type : 'UI.DataField',
            Value : IndustrySector,
            Label : '{i18n>IndustrySector}',
        },
        {
            $Type : 'UI.DataField',
            Value : ItemCategoryGroup,
            Label : '{i18n>ItemCategoryGroup}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'InvCatalogService.copyProduct',
            Label : '{i18n>copy}',
        },
    ],
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : Product,
        },
        TypeName : '',
        TypeNamePlural : '',
        Description : {
            $Type : 'UI.DataField',
            Value : Product,
        },
    },
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>AdminData}',
            ID : 'i18nAdminData',
            Target : '@UI.FieldGroup#i18nAdminData',
        },
    ],
    UI.FieldGroup #i18nAdminData : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : documentId,
                Label : '{i18n>DocumentId}',
            },
            {
                $Type : 'UI.DataField',
                Value : Product,
                Label : '{i18n>Product}',
            },
            {
                $Type : 'UI.DataField',
                Value : ProductType,
                Label : '{i18n>ProductType}',
            },
            {
                $Type : 'UI.DataField',
                Value : ProductGroup,
                Label : '{i18n>ProductGroup}',
            },
        ],
    },
    UI.FieldGroup #i18nSalesDeliveryDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
    UI.FieldGroup #i18nProcurementDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : to_ProductProcurement.PurchaseOrderQuantityUnit,
                Label : '{i18n>PurchaseOrderQuantityUnit}',
            },
            {
                $Type : 'UI.DataField',
                Value : to_ProductProcurement.VarblPurOrdUnitStatus,
                Label : '{i18n>UnitStatus}',
            },
            {
                $Type : 'UI.DataField',
                Value : to_ProductProcurement.PurchasingAcknProfile,
                Label : '{i18n>AcknowledgmentProfile}',
            },
        ],
    },
);

annotate service.ProductItem with @(
    UI.LineItem #i18nPlantDetails : [
        {
            $Type : 'UI.DataField',
            Value : Plant,
            Label : '{i18n>Plant}',
        },
        {
            $Type : 'UI.DataField',
            Value : AvailabilityCheckType,
            Label : '{i18n>AvailabilityCheckType}',
        },
        {
            $Type : 'UI.DataField',
            Value : PeriodType,
            Label : '{i18n>PeriodType}',
        },
        {
            $Type : 'UI.DataField',
            Value : ProfitCenter,
            Label : '{i18n>ProfitCenter}',
        },
        {
            $Type : 'UI.DataField',
            Value : MaintenanceStatusName,
            Label : '{i18n>MaintenanceStatusName}',
        },
        {
            $Type : 'UI.DataField',
            Value : FiscalYearCurrentPeriod,
            Label : '{i18n>FiscalYearCurrentPeriod}',
        },
        {
            $Type : 'UI.DataField',
            Value : FiscalMonthCurrentPeriod,
            Label : '{i18n>FiscalMonthCurrentPeriod}',
        },
        {
            $Type : 'UI.DataField',
            Value : BaseUnit,
            Label : '{i18n>BaseUnit}',
        },
    ]
);

annotate service.Product.to_SalesDelivery with @(
    UI.LineItem #SalesDeliveryDetails : [
        {
            $Type : 'UI.DataField',
            Value : ProductSalesOrg,
            Label : 'Product Sales Org',
        },
        {
            $Type : 'UI.DataField',
            Value : ProductDistributionChnl,
            Label : '{i18n>ProductDistributionChanel}',
        },
        {
            $Type : 'UI.DataField',
            Value : MinimumOrderQuantity,
            Label : '{i18n>MinimumOrderQuantity}',
        },
        {
            $Type : 'UI.DataField',
            Value : SupplyingPlant,
            Label : '{i18n>SupplyingPlant}',
        },
        {
            $Type : 'UI.DataField',
            Value : PriceSpecificationProductGroup,
            Label : '{i18n>PriceSpecificationProductGroup}',
        },
        {
            $Type : 'UI.DataField',
            Value : AccountDetnProductGroup,
            Label : '{i18n>AccountProductGroup}',
        },
        {
            $Type : 'UI.DataField',
            Value : DeliveryNoteProcMinDelivQty,
            Label : '{i18n>ProcurementMinimumQty}',
        },
        {
            $Type : 'UI.DataField',
            Value : ItemCategoryGroup,
            Label : '{i18n>ItemCategoryGroup}',
        },
        {
            $Type : 'UI.DataField',
            Value : BaseUnit,
            Label : '{i18n>BaseUnit}',
        },
    ]
);

annotate service.Product.to_ProductSalesTax with @(
    UI.LineItem #i18nSalesTaxDetails : [
        {
            $Type : 'UI.DataField',
            Value : Country,
            Label : '{i18n>Country1}',
        },
        {
            $Type : 'UI.DataField',
            Value : TaxCategory,
            Label : '{i18n>TaxCategory}',
        },
        {
            $Type : 'UI.DataField',
            Value : TaxClassification,
            Label : '{i18n>TaxClassification}',
        },
    ]
);

