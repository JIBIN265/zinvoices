sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zinvoicestatusvalues',
            componentId: 'StatusValuesList',
            contextPath: '/StatusValues'
        },
        CustomPageDefinitions
    );
});