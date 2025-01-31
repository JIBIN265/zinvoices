using InvCatalogService as service from '../../srv/cat-service';
annotate service.StatusValues with @odata.draft.enabled;
annotate service.StatusValues with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'code',
                Value : code,
            },
            {
                $Type : 'UI.DataField',
                Label : 'value',
                Value : value,
            },
            {
                $Type : 'UI.DataField',
                Label : 'criticality',
                Value : criticality,
            },
            {
                $Type : 'UI.DataField',
                Label : 'deletePossible',
                Value : deletePossible,
            },
            {
                $Type : 'UI.DataField',
                Label : 'insertPossible',
                Value : insertPossible,
            },
            {
                $Type : 'UI.DataField',
                Label : 'updatePossible',
                Value : updatePossible,
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
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'code',
            Value : code,
        },
        {
            $Type : 'UI.DataField',
            Label : 'value',
            Value : value,
        },
        {
            $Type : 'UI.DataField',
            Label : 'criticality',
            Value : criticality,
        },
        {
            $Type : 'UI.DataField',
            Label : 'deletePossible',
            Value : deletePossible,
        },
        {
            $Type : 'UI.DataField',
            Label : 'insertPossible',
            Value : insertPossible,
        },
    ],
);

