sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zinvoicesmain/test/integration/FirstJourney',
		'zinvoicesmain/test/integration/pages/InvoiceList',
		'zinvoicesmain/test/integration/pages/InvoiceObjectPage',
		'zinvoicesmain/test/integration/pages/InvoiceItemObjectPage'
    ],
    function(JourneyRunner, opaJourney, InvoiceList, InvoiceObjectPage, InvoiceItemObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zinvoicesmain') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheInvoiceList: InvoiceList,
					onTheInvoiceObjectPage: InvoiceObjectPage,
					onTheInvoiceItemObjectPage: InvoiceItemObjectPage
                }
            },
            opaJourney.run
        );
    }
);