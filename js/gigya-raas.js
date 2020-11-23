/**
 * ---------------------
 * # Gigya RaaS JS File
 * ---------------------
 *
 * This file includes all functions that interact with Gigya screensets, as well as the main Gigya initialization
 * function, **onGigyaServiceReady**, where we check if the user is logged or not, and show different sections
 * depending on that state.
 *
 * Find more details about **onGigyaServiceReady** here:
 * [onGigyaServiceReady](https://developers.gigya.com/display/GD/onGigyaServiceReady+Template)
 *
 * The included operations OOTB are:
 *
 *  - register: shows registration screenset (embedded in a div).
 *  - login: shows login screenset (in popup)
 *  - logout: logs out the user from the page.
 *  - update profile: shows profile update screenset (embedded in a div).
 *  - show profile: shows profile overview screenset.
 *  - change password: shows profile overview screenset.
 *  - subscribe (no password implied): shows lite registration screenset
 *
 * Visit the documentation page to get the full list of operations that you can perform using screensets:
 * [Default Screensets](https://developers.gigya.com/display/GD/Default+Screen-sets)
 *
 * Attached to these screensets, we have some event functions, that they modify/include new logic, or perform some UX
 * in certain moments. In this file there are X of them included:
 *
 *  - onAfterScreenLoad: triggered after the screen is rendered in page
 *  - onBeforeSubmit: triggered before the data it's submitted
 *  - onSubmit: triggered when a form is submitted
 *
 * For a full list of these events, please visit the documentation page:
 * [Screenset Events](https://developers.gigya.com/display/GD/Default+Screen-sets)
 *
 * Finally, there are two functions for Gigya global events (onLogin & onLogout), that they are called after performing
 * those two operations and readapt the UI accordingly.
 *
 *  - onLogin: triggered after getting a valid session from Gigya
 *  - onLogout: triggered after completed a succesful logout in Gigya.
 *
 * For a full explanation for these events, please visit the documentation page:
 * [Global Events](https://developers.gigya.com/display/GD/Events#Events-GlobalApplicationEventsGlobalApplicationEvents)
 *
 *
 * @link   https://github.com/juanatsap/gigya-starter-kit/blob/master/js/gigya-raas.js
 * @file   This file defines the main functions to make the demo site work.
 * @author juan.andres.moreno@sap.com
 * @since  1.0.0
 */

/** *****************************************************/
//                   MAIN FUNCTION
/** *****************************************************/
/**
 * This function will be triggered once Gigya is fully loaded and ready to be used.
 * See more in: https://developers.gigya.com/display/GD/onGigyaServiceReady+Template
 */
function onGigyaServiceReady() {

    /* Adding the global onlogin event */
    gigya.socialize.addEventHandlers({
        onLogin
    });

    /* Check if the user was previously logged in */
    if (typeof gigya === 'undefined') {
        alert('Gigya is not loaded on this page :(');
    } else {
        gigya.accounts.getAccountInfo({ include:'emails, profile', callback: redirectIfLogged });
    }
}

/** *****************************************************/
//             GIGYA SCREENSET FUNCTIONS
/** *****************************************************/
/**
 * This function shows the registration form inside 'not_logged_placeholder' div.
 * @param  {string} containerID The container ID for the register page
 */
function registerWithRaaS(containerID) {

    /* Launch Screenset */
    gigya.accounts.showScreenSet({
        screenSet:'Default-RegistrationLogin',
        startScreen:'gigya-register-screen',
        containerID, // <-- if we omit this property the screen it's shown in a pop-up

        // Some sample events..
        onBeforeSubmit,
        onSubmit,
        onAfterScreenLoad

    });
}

/**
 *
 * This function shows the login form in a popup.
 * @param  {string} containerID The container ID for the login page
 */
function loginWithRaaS(containerID) {

    console.log('Logging in...');

    /* Actions associated to events */
    gigya.accounts.addEventHandlers({
        onLogin: onLogin,
    });

    /* Launch Screenset */
    gigya.accounts.showScreenSet({
        screenSet:'Default-RegistrationLogin',
        startScreen:'gigya-login-screen',
        containerID
    });
}

/**
 * This function shows the edit profile form inside 'edit_profile_placeholder' div.
 * @param  {string} containerID The container ID for the edit profile page
 */
function editProfileWithRaaS(containerID) {

    console.log('Editing profile...');

    /* Launch Screenset */
    gigya.accounts.showScreenSet({
        screenSet:'Default-ProfileUpdate',
        startScreen:'gigya-update-profile-screen',
        containerID,
        onAfterSubmit
    });
}

/**
 * This function shows the lite registration form in a popup.
 * @param  {string} containerID The container ID for the lite registration page
*/
function liteRegisterWithRaaS(containerID) {

    /* Launch Screenset */
    gigya.accounts.showScreenSet({
        screenSet:'Default-LiteRegistration',
        startScreen: 'gigya-subscribe-with-email-screen',
        containerID
    });
}

/**
 * This function shows the profile form in a popup for logged in users.
 * @param  {string} containerID The container ID for the register page
 */
function changePasswordWithRaaS(containerID) {
    // Launch Screenset
    gigya.accounts.showScreenSet({
        screenSet:'Default-ProfileUpdate',
        startScreen:'gigya-change-password-screen',
        containerID
    });
}

/**
 * * This function hides the screenset contained in 'containerID' param.
 * @param {string} containerID the id of the HMTL element containing the form
 */
function hideScreenset(containerID) {
    gigya.accounts.hideScreenSet({ containerID });
}

/**
 * This function logs out a user from the website, and triggers an event (onLogout), to perform some operations
 * after the operation is finished.
 */
function logoutWithRaaS() {

    console.log('Logging out...');

    /* Actions associated to events */
    gigya.accounts.addEventHandlers({
        onLogout: onLogout
    });

    /* After the logout, we show the register screen again (as in the beginning) */
    gigya.accounts.logout({ callback:function() {

        // Show login instead of register
        // query('.message.not-logged').classList.add('hidden');
        loginWithRaaS('not_logged_placeholder');
        // registerWithRaaS('not_logged_placeholder');
    } });
}

/** **************************************************/
//       GIGYA SCREENSET EVENT FUNCTIONS
/** **************************************************/
/**
* A reference to a function that will be called before a new screen is rendered.
* @param  {object} event Form Event object
*/
function onAfterScreenLoad(event) {
}

/**
 * Event handler function that will be called before a form is submitted.
 * @param  {object} event Form Event object
 * @returns {boolean} Flag that controls if submission must continue or not
 */
function onBeforeSubmit(event) {
    return true;
}

/**
 * Event handler function that will be called when a form is submitted.
 * @param  {object} event Form Event object
 */
function onSubmit(event) {
    // gigya.accounts.getAccountInfo({include:'emails, profile',callback: redirectIfLogged});
    //
    // // Check if the change was the email, if yes, send a verification email with the unverified email
    // if (window.currentUser.profile.email !== event.profile.email) {
    //
    //     gigya.accounts.initRegistration({callback: function (e) {
    //         var verificationParams = {
    //             regToken: e.regToken,
    //             email: event.profile.email,
    //             callback: function (e) {console.log(e);}
    //         };
    //         gigya.accounts.resendVerificationCode(verificationParams);
    //     }});
    // }
}




function onAfterSubmit(event) {
    gotoHome();
}


/** **************************************************/
//       GIGYA GLOBAL EVENT FUNCTIONS
/** **************************************************/
/**
 * This event is fired whenever a user successfully logs in to Gigya.
 * @param  {object} response Gigya response with the results of the login operation
 */
function onLogin(response) {

    // Save token ID
    window.tokenID = response;
    // debugger;
    if (response.profile !== null) {
        gigya.accounts.getAccountInfo({ include:'emails, profile', callback: redirectIfLogged });
    }
}

/**
 * This event is fired whenever a user successfully logs out to Gigya.
 * @param  {object} response Gigya response with the results of the logout operation
 */
function onLogout(response) {

    if (response.eventName === 'logout') {
        console.log('User has logged out');
        showUnloggedHTML();
    } else {
        alert('Error :' + response.errorMessage);
    }
}

/** **************************************************/
