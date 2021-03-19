/** *****************************************************/
//                   MAIN FUNCTION
/** *****************************************************/
/**
 * This function will be triggered once Gigya is fully loaded and ready to be used.
 * In the function **onGigyaServiceReady**, we load the configuration file, starting
 * the rest of the process after that moment.
 *
 * Once page is loaded, we check if the user is logged or not,
 * and show different sections depending on that state.
 *
 * See more in: https://developers.gigya.com/display/GD/onGigyaServiceReady+Template
 */
function onGigyaServiceReady() {

    /* Check if the user was previously logged in */
    if (typeof gigya === 'undefined') {
        alert('Gigya is not loaded on this page :(');
    } else {

        // Check if the library is properly loaded or not.
        checkIfGigyaLoaded();

        // Check if user is logged in or not
        gigya.accounts.getAccountInfo({ include: 'emails, profile, data, preferences', callback: initPage });

    }
}

document.addEventListener("DOMContentLoaded", function() {

    /* Load Configuration from setup/site.json and starts the site UI */
    initDemoSite();

});