sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zcurrencies/test/integration/FirstJourney',
		'zcurrencies/test/integration/pages/CurrenciesList',
		'zcurrencies/test/integration/pages/CurrenciesObjectPage'
    ],
    function(JourneyRunner, opaJourney, CurrenciesList, CurrenciesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zcurrencies') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheCurrenciesList: CurrenciesList,
					onTheCurrenciesObjectPage: CurrenciesObjectPage
                }
            },
            opaJourney.run
        );
    }
);