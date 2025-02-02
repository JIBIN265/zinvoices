sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zmaterial/test/integration/FirstJourney',
		'zmaterial/test/integration/pages/MaterialList',
		'zmaterial/test/integration/pages/MaterialObjectPage',
		'zmaterial/test/integration/pages/MaterialItemObjectPage'
    ],
    function(JourneyRunner, opaJourney, MaterialList, MaterialObjectPage, MaterialItemObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zmaterial') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMaterialList: MaterialList,
					onTheMaterialObjectPage: MaterialObjectPage,
					onTheMaterialItemObjectPage: MaterialItemObjectPage
                }
            },
            opaJourney.run
        );
    }
);