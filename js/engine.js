/**
 * ----------------
 *  # Engine JS File
 * ----------------
 *
 * This file includes some util and HTML functions to make the site fully functional, and to show/hide elements
 * depending if the user is logged or not. It contains as well the main variables to control the statuses or the
 * user / apikeys loaded in the page. Finally, there are methods to simulate purchases, to reload api keys
 * dynamically or delete totally the logged user. Some of these functions are based in backend calls, that they
 * are authorized using JWT communication between the frontend and the backend.
 * 
 * The file is divided in the next sections:
 *
 *  - 0. window.document Shorthands
 *  - 1. Logs Configuration
 *  - 2. User Global variable
 *  - 3. Demo Core Functions
 *  - 4. Progressive profiling and advanced data functions
 *  - 5. Deletion functions
 *  - 6. Dynamic API Key functions
 *
 * 
 * @link   https://github.com/gigya/cdc-starter-kit/blob/master/js/engine.js
 * @file   This file defines the main functions to make the demo site work.
 * @author juan.andres.moreno@sap.com
 * @since  1.0.0
 */

// -- 0. window.document Shorthands
const query = document.querySelector.bind(document);
const queryAll = document.querySelectorAll.bind(document);
const logConfigFile = false; // Shows/hides config file into the console

// -- 1. Logs Configuration
var LOGS = false;
var showLog = LOGS;
let showEventsLog = LOGS;

// -- 2. Sample Content
var showSampleContent = true;


// -- 2. User Global variable
var currentUser = null;

/** *****************************************************/
//                 3. DEMO CORE FUNCTIONS
/** *****************************************************/
/**
 * Loads the configuration file into the window object to be used later on to customize the UI
 */
function initDemoSite() {
    // log('0. Init Demo site');
    // Read configuration file and load it
    fetch('./config/site.json')
        .then((res) => { return res.json(); })
        .then((out) => {

            // Init webpage
            loadConfigFromFile(out);

        }).catch((err) => { return console.error(err); });
}

/**
 * Loads the site UI using the configuration file coming as parameter, loading Gigya file at the end.
 * If there are parameters in the query string, these are taken and overrides the ones in the file.
 * @param  {object} out the config from the file
 */
function loadConfigFromFile(out) {

    // 0. Store config in window global (:-s)
    if (logConfigFile === true) {
        console.table(out);
    }

    // 1. Get proper language
    const storedLanguage = getLanguage();
    if (storedLanguage !== null) {
        out.lang = storedLanguage;
    }

    log("2. Check URL Params  ");
    // After having the initial configuration, we check if we have params that will override these properties.
    // Properties accepted by the app are:
    //
    //      -  apiKey
    //      - screensetPrefix
    //      - showLog
    //      - showEventsLog
    //      - showSampleContent

    // 2. Check if we have the dynamic ApiKey in the url. If yes, substitute in the url
    const apiKeyFromQueryString = getFromQueryString("apiKey");
    var isValidApiKey = false;
    if (apiKeyFromQueryString && apiKeyFromQueryString !== null) {

        isValidApiKey = validateAPIKey(apiKeyFromQueryString) === "OK";
        log("VALID API Key ?" + isValidApiKey + "...", "BACKEND CALL RESPONSE");

        // Checking validity status and modify the change api key button accordingly.
        if (isValidApiKey === true) {

            // Enable the button and show the proper class for the input text
            out.apiKeyFromQueryString = apiKeyFromQueryString;

        } else {
            console.error("Invalid API Key. Loading default one...");
            // Updating error label to reflect the error
            setTimeout(disableChangeApiKeyButton, 1000);
        }
    }

    // 3. Check if we have the dynamic Screenset in the url
    const screensetPrefixFromQueryString = getFromQueryString("screensetPrefix");
    if (screensetPrefixFromQueryString && screensetPrefixFromQueryString !== null) {
        out.raas_prefix = screensetPrefixFromQueryString;
    }

    // 4. Check if we have the flag to show content into the page
    const showSampleContentFromQueryString = getFromQueryString('showSampleContent');
    if (showSampleContentFromQueryString && showSampleContentFromQueryString !== null) {
        showSampleContent = showSampleContentFromQueryString === "true";
    }

    // 5. Check if we have the flag to show the logs into the page. If yes, override the default value
    const showLogsFromQueryString = getFromQueryString('showLog');
    if (showLogsFromQueryString && showLogsFromQueryString !== null) {
        showLog = showLogsFromQueryString === "true";
    }

    // 6. Check if we have the flag to show the logs into the page. If yes, override the default value
    const showEventLogsFromQueryString = getFromQueryString("showEventsLog");
    if (showEventLogsFromQueryString && showEventLogsFromQueryString !== null) {
        showEventsLog = showEventLogsFromQueryString === "true";
    }

    // API KEY + GIGYA LOAD SECTION
    // Checking if we have api key in local storage
    const apiKeyFromLocalStorage = getFromLocalStorage("reload-with-apikey");

    // Loading (initially) api key from file
    var apiKey = out.apiKey;

    // Check if we have api key in the url
    if (apiKeyFromQueryString && apiKeyFromQueryString !== null && apiKeyFromQueryString !== "" && isValidApiKey === true) {
        // We take the url of the query string and remove the dynamic one
        // setInLocalStorage("reload-with-apikey", apiKeyFromQueryString);
        apiKey = apiKeyFromQueryString;
        // out.apiKey = apiKeyFromQueryString;
    } else {

        if (apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== "") {
            apiKey = apiKeyFromLocalStorage;
        }
    }

    // 7. Store the exit of the file as a global object to be used along the site
    window.config = out;
    // debugger;
    log("3. Load Gigya for api key: " + apiKey, "LOAD GIGYA FILE");
    loadGigyaForApiKey(apiKey);
}

/**
 * Set all UI conponents using the configuration object and the state of the user
 * @param {object} user User object
 */
function initPage(user) {
    // First, we render the navbar from file, and once loaded, we start with all the rest of the renders
    log("2. Render UI.");

    // Show the loading modal
    showModal("loading");

    // Store user as global variable to be user later (not ideal :S)
    currentUser = user;

    const path = "./html/skeleton/navbar.html";
    fetch(path)
        .then((res) => {
            return res.text();
        })
        .then((out) => {
            // With the html of the nabvar loaded, we start rendering all elements

            // 1. Render Navbar
            renderNavbar(out);

            // 2. Render Main site data (Title, description, image, ...)
            renderMainSiteData(config);

            // 3. Set Active language flag
            setActiveLanguageFlag(config);

            // 4. CSS from the config file
            includeConfigCss(config);

            /* If not logged, show login form */

            // Show the loading modal
            hideModal("loading");

            if (!user || !user.UID) {
                log("3. You are not logged in.");

                /* In function of the page, show or show login page, or redirect to home */
                gotoUnloggedPage();
            } else {
                /* If logged, show user HTML */
                showLoggedHTML(user);

                /* In function of the page, show or sample content, or edit profile */
                const url = window.location.href;
                if (url.indexOf("edit-profile") <= 0) {
                    user.data.memberType =
                        user.data.wallet.purchasedProducts && user.data.wallet.purchasedProducts < 5 ?
                        "Standard" :
                        "Golden";
                    user.data.since = user.created.substr(0, 10);
                    user.data.memberTypeIcon = user.data.memberType.toLowerCase();
                } else {
                    editProfileWithRaaS("edit_profile_placeholder");
                }
            }
        })
        .catch((err) => {
            return console.error(err);
        });
}

/**
 * Logouts the user from the page, showing the logout modal, and the unlogged elements again
 */
function logoutFromSite() {
    // Clean user state
    currentUser = null;

    // Show Logging out modal, and after that, showing again logged out page
    showModal("logging-out", function() {
        // Remove content from div (if we need to come back again)
        cleanSampleContent();

        // Call the logout function with the callback function
        logoutWithRaaS(gotoUnloggedPage);
    });

}

/** ***********************************************************/
//  4. PROGRESSIVE PROFILING AND ADVANCED DATA FUNCTIONS
/** ***********************************************************/
/**
 * This method takes the associated product and substract the credit from the page,
 * adding a new purchase to the user. Finally, performs a setAccountInfo against Gigya
 * o update this information (the fields should be created previously into the schema).
 * 
 * @param {object} element The HTML button that triggered the purchase action
 */
function purchaseProduct(element) {
    // Get the data from the element
    const isLogged = currentUser && currentUser.status !== "FAIL";

    if (isLogged) {
        // Show the loading button
        const purchaseModalButton = query(
            ".purchase-modal .purchase-button"
        );
        purchaseModalButton.classList.add("is-loading");

        const purchasedProducts = Number(currentUser.data.wallet.purchasedProducts + 1);
        const price = Number(
            element.parentElement.parentElement
            .querySelector("#quickview-price")
            .innerText.trim()
            .substr(1)
        );
        const credits = Number(currentUser.data.wallet.credits - price);
        const uid = currentUser.UID;

        // Checking from frontend. BAD    
        if (credits && purchasedProducts) {
            gigya.accounts.setAccountInfo({
                data: { "wallet": { purchasedProducts, credits } },
                callback: function(event) {
                    log("Product bought", "SET ACCOUNT INFO");
                    purchaseModalButton.classList.remove("is-loading");
                    hideModal("purchase");
                    // We update the session currentUser and then send it to
                    currentUser.data.wallet.purchasedProducts = purchasedProducts;
                    currentUser.data.wallet.credits = credits;
                    initPage(currentUser);
                },
            });
        }

        // THIS IS THE GOOD WAY!!! BACKEND
        // const id_token = 'whatever'; // generate a token with getJWT
        // const purchaseUrl = `https://juan.gigya-cs.com/api/cdc-starter-kit/purchase-element.php?UID=${uid}&price=${price}&id_token=${id_token}`;
        // fetch(purchaseUrl)
        //     .then((res) => { return res.json(); })
        //     .then((out) => {
        //         console.log('product purchased out :>> %o', out);

        //     }).catch((err) => { return console.error(err); });
    } else {

        // Hide the modal and go to the login section of the page
        hideModal("purchase");
        showOrHighlightLoginScreen();
    }
}

/**
 * This function render the number of previous logins of the user if defined in the data
 * section of the schema for this API Key.
 */
function renderPreviousLoginsIfDefined(previousLogins) {
    // log('Previous logins (if enabled for this api key) : ' + previousLogins);
    const previousLoginsButton = query(".button-previous-logins");
    if (previousLogins) {
        if (previousLoginsButton) {
            previousLoginsButton.parentElement.classList.remove("is-hidden");
            previousLoginsButton.setAttribute(
                "aria-label",
                "Previous Logins: " + previousLogins
            );
        }
        const previousLoginsSpan = query(".span-previous-logins");
        previousLoginsSpan.innerText = previousLogins;

        // return gigya.dataCenter;
    } else {
        previousLoginsButton.parentElement.classList.add("is-hidden");
    }
}

/**
 * Increase the number of previous logins of the user if defined in the data. After that,
 * checks if it must show the popup of the consents for the user.
 */
function increasePreviousLogins(user) {
    if (user.status !== "FAIL") {
        // Increment number of logins count.
        const previousLogins = (user.data.previousLogins || 0) + 1;
        const recieveOfferAlerts = user.data.recieveOfferAlerts ? user.data.recieveOfferAlerts : false;

        //
        log("X. - Increase Previous logins...", "SET ACCOUNT INFO");

        gigya.accounts.setAccountInfo({
            data: {
                // This integer field must have been previously added to the site's schema via the UI Builder or accounts.setSchema API
                previousLogins,
            },
            callback: (event2) => {
                // Check if we must show or not the progressive profile screenset
                checkIfShowConsentsPopup(event2, previousLogins, recieveOfferAlerts);

                // Re-render the counter after this increase
                renderPreviousLoginsIfDefined(previousLogins);
            },
        });
    }
}

/** *****************************************************/
//               5. DELETION FUNCTIONS
/** *****************************************************/

/**
 * Function that takes the UID of the user and deletes it using a backend call.
 * TODO: Include JWT Token to authorize the operation
 */
function deleteCurrentAccount() {
    //
    log("X. - Deleting account.... ", "GET ACCOUNT INFO");

    // Show the loading button
    const deleteButton = query(".deletion-modal .modal-card-foot .delete-button");
    deleteButton.classList.add("is-loading");

    gigya.accounts.getAccountInfo({
        callback: function(user) {
            if (user.status !== "FAIL") {
                log("user to delete: " + user.profile.email, "DELETE ACCOUNT");
                const uid = user.UID;

                // TODO: Include this as part of the call
                const id_token = "whatever";

                const deleteUrl = `https://juan.gigya-cs.com/api/cdc-starter-kit/delete-user.php?UID=${uid}&id_token=${id_token}`;
                fetch(deleteUrl)
                    .then((res) => {
                        return res.json();
                    })
                    .then((out) => {
                        log("User Delete OK : " + JSON.stringify(out));
                        logoutFromSite();
                    })
                    .catch((err) => {
                        return console.error(err);
                    });
            }
        },
    });
}