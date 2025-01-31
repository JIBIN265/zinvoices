sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zinvoicestatusvalues/test/integration/FirstJourney',
		'zinvoicestatusvalues/test/integration/pages/StatusValuesList',
		'zinvoicestatusvalues/test/integration/pages/StatusValuesObjectPage'
    ],
    function(JourneyRunner, opaJourney, StatusValuesList, StatusValuesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zinvoicestatusvalues') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheStatusValuesList: StatusValuesList,
					onTheStatusValuesObjectPage: StatusValuesObjectPage
                }
            },
            opaJourney.run
        );
    }
);