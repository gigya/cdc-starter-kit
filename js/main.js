/** *****************************************************/
//                   MAIN FUNCTION
/** *****************************************************/
/**
 * This function will be triggered once Gigya is fully loaded and ready to be used.
 * See more in: https://developers.gigya.com/display/GD/onGigyaServiceReady+Template
 */
function onGigyaServiceReady() {

    /* Check if the user was previously logged in */
    if (typeof gigya === 'undefined') {
        alert('Gigya is not loaded on this page :(');
    } else {

        /* Load Configuration */
        loadConfigurationFromFile();
    }
}
