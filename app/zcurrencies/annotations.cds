using InvCatalogService as service from '../../srv/cat-service';

annotate service.Currencies with @odata.draft.enabled;

annotate service.Currencies with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: name,
            },
            {
                $Type: 'UI.DataField',
                Value: descr,
            },
            {
                $Type: 'UI.DataField',
                Value: code,
            },
            {
                $Type: 'UI.DataField',
                Value: symbol,
            },
            {
                $Type: 'UI.DataField',
                Value: minorUnit,
            },
            {
                $Type: 'UI.DataField',
                Label: 'numcode',
                Value: numcode,
            },
            {
                $Type: 'UI.DataField',
                Label: 'exponent',
                Value: exponent,
            },
            {
                $Type: 'UI.DataField',
                Label: 'minor',
                Value: minor,
            },
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Value: code,
        },
        {
            $Type: 'UI.DataField',
            Value: name,
        },
        {
            $Type: 'UI.DataField',
            Value: descr,
        },
        {
            $Type: 'UI.DataField',
            Value: symbol,
        },
        {
            $Type: 'UI.DataField',
            Value: minorUnit,
        },
    ],
);
