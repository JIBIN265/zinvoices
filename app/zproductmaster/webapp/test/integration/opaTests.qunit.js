sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zproductmaster/test/integration/FirstJourney',
		'zproductmaster/test/integration/pages/ProductList',
		'zproductmaster/test/integration/pages/ProductObjectPage',
		'zproductmaster/test/integration/pages/ProductItemObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductList, ProductObjectPage, ProductItemObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zproductmaster') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheProductList: ProductList,
					onTheProductObjectPage: ProductObjectPage,
					onTheProductItemObjectPage: ProductItemObjectPage
                }
            },
            opaJourney.run
        );
    }
);