sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zproductmaster',
            componentId: 'ProductItemObjectPage',
            contextPath: '/Product/to_ProductItem'
        },
        CustomPageDefinitions
    );
});