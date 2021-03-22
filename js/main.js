/**
 * ----------------
 *  # Main JS File
 * ----------------
 *
 * This file includes the two main initialization functions for the application. First one it's loaded
 * once the DOM is fully ready and initializes the site, loading the configuration from the *site.conf*
 * file and loading the Gigya library at the end of the process.
 * 
 * Once Gigya It's loaded, the *onGigyaServiceReady* function checks if there is a valid session, and
 * show the correspondent elements into the page.
 *
 *
 * @link   https://github.com/gigya/cdc-starter-kit/blob/master/js/main.js
 * @file   This file defines the main functions to make the demo site work.
 * @author juan.andres.moreno@sap.com
 * @since  1.0.0
 */

/**
 * Initial function (once all the content is loaded). It loads the configuration
 * from setup/site.json and starts the site UI
 */
document.addEventListener("DOMContentLoaded", function() {
    // Initialize the site (and loads Gigya file)
    initDemoSite();
});

/**
 * This function will be triggered once Gigya is fully loaded and ready to be used.
 * In the function **onGigyaServiceReady**, we look for a valid user session, checking
 * if the user is logged or not and show different sections depending on that state.
 *
 * See more in: https://developers.gigya.com/display/GD/onGigyaServiceReady+Template
 */
function onGigyaServiceReady() {
    // Check if the user was previously logged in
    if (typeof gigya === "undefined") {
        alert("Gigya is not loaded on this page :(");
    } else {
        // Check if the library is properly loaded or not (stops the flow if it's bad loaded)
        checkIfGigyaLoaded();

        // Get Information about the user, and start the load of the page elements
        gigya.accounts.getAccountInfo({
            include: "profile, data, preferences",
            callback: initPage,
        });
    }
}
/** *****************************************************/