/**
 * ----------------
 *  # Demo Engine JS File
 * ----------------
 *
 * This file includes some util and HTML functions to make the site fully functional, and to show/hide elements
 * depending if the user is logged or not.
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
var LOGS = true;
var showLog = LOGS;
var showEventsLog = false;
var currentUser = null;

/** *****************************************************/
//                 1. DEMO CORE FUNCTIONS
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
 * Loads the site UI using the configuration file coming as parameter
 * @param  {object} out the config from the file
 */
function loadConfigFromFile(out) {
    // Store config in window global (:-s)
    if (logConfigFile === true) {
        console.table(out);
    }

    // Get proper language
    const storedLanguage = getLanguage();
    if (storedLanguage !== null) {
        out.lang = storedLanguage;
    }
    window.config = out;
    log("1. Load Configuration from file ", "GET ACCOUNT INFO");

    // Checking if we have api key in local storage
    const apiKeyFromLocalStorage = localStorage.getItem("reload-with-apikey");
    var apiKey = out.apiKey;

    // Loading api key from file
    if (apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== '') {
        apiKey = apiKeyFromLocalStorage;
    }
    loadGigyaForApiKey(apiKey);

}

/**
 * Set all UI conponents using the configuration object and the state of the user
 * @param {object} config Configuration object
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


/** ***********************************************************/
//  5. PROGRESSIVE PROFILING AND ADVANCED DATA FUNCTIONS
/** ***********************************************************/
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
        hideModal("purchase");
        showOrHighlightLoginScreen();
    }
}

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

function increasePreviousLogins(user) {
    if (user.status !== "FAIL") {
        // Increment number of logins count.
        const previousLogins = (user.data.previousLogins || 0) + 1;
        const recieveOfferAlerts = user.data.recieveOfferAlerts ?
            user.data.recieveOfferAlerts :
            false;

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

function checkIfShowConsentsPopup(event, previousLogins, recieveOfferAlerts) {
    if (event.status !== "FAIL" && currentUser && currentUser.preferences) {
        const hasPendingAlerts =
            (currentUser.preferences.offer_products_1 &&
                currentUser.preferences.offer_products_1.isConsentGranted !== true) ||
            (currentUser.preferences.offer_services_1 &&
                currentUser.preferences.offer_services_1.isConsentGranted !== true) ||
            (currentUser.preferences.offer_products_2 &&
                currentUser.preferences.offer_products_2.isConsentGranted !== true) ||
            (currentUser.preferences.offer_services_2 &&
                currentUser.preferences.offer_services_2.isConsentGranted !== true);
        if (
            hasPendingAlerts &&
            previousLogins % 3 === 0 &&
            (recieveOfferAlerts === true || recieveOfferAlerts === "true")
        ) {
            /* Launch Screenset */
            gigya.accounts.showScreenSet({
                screenSet: "Default-ProfileUpdate",
                startScreen: "gigya-update-consents-screen",
                lang: window.config.lang,
                // containerID,
                // onAfterSubmit: gotoHome,
            });
        } else {}
    }
}
/** *****************************************************/
//               7. DELETION FUNCTIONS
/** *****************************************************/

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

function showChangeApiKeyModal() {
    showModal("change-api-key", initChangeApiKeyModal);
}

function changeAPIKey() {
    //
    log("X. - Changing API KEy.... ", "RELOAD ALL PAGE");

    // Show the loading button
    const changeAPIKeyButton = query(".change-api-key-modal .modal-card-foot .change-api-key-button");
    changeAPIKeyButton.classList.add("is-loading");

    // Take the api key
    const apiKey = query(".change-api-key-modal .api-key-input").value;

    // Store api key in local storage and reload the page (it will load the new api key)
    localStorage.setItem("reload-with-apikey", apiKey);

    // Reload page
    window.location.href = window.location.href;


}

function loadGigyaForApiKey(apiKey) {

    // Adding new Gigya script from parameters
    log("2. Load Gigya File with apiKey " + apiKey, "LOAD GIGYA FILE");

    var newScript = document.createElement('script');
    newScript.setAttribute('src', 'https://cdns.gigya.com/js/gigya.js?apikey=' + apiKey);
    document.body.appendChild(newScript);

    // Check if loaded properly, if don't, delete the localstorage param and reload the page again
    setTimeout(checkIfGigyaLoaded, 1000);
}

function clearCustomApiKey() {

    // Show the loading button
    const resetAPIKeyButton = query(".change-api-key-modal .reset-api-key-button");
    if (resetAPIKeyButton) {
        resetAPIKeyButton.classList.add("is-loading");
    }

    localStorage.removeItem("reload-with-apikey");
    window.location.href = window.location.href;
}

function initChangeApiKeyModal() {

    log('Initializing change api key modal....');
    // Set the values for the modals
    const configApiKeyInput = query(".change-api-key-modal .config-api-key-input");
    const configApiKeyInputTag = query(".change-api-key-modal .config-api-key-input-tag");
    const configApiKeyInputTagDisabled = query(".change-api-key-modal .config-api-key-input-tag-disabled");
    const apiKeyInput = query(".change-api-key-modal .api-key-input");
    const apiKeyInputTag = query(".change-api-key-modal .api-key-input-tag");
    const apiKeyInputTagDisabled = query(".change-api-key-modal .api-key-input-tag-disabled");
    const defaultApiKeyField = query(".change-api-key-modal .default-api-key-field");
    const apiKeyValidityNotification = query(".change-api-key-modal .api-key-validity-notification");

    const changeApiKeyButton = query(".change-api-key-modal .change-api-key-button");
    const resetApiKeyButton = query(".change-api-key-modal .reset-api-key-button");
    const apiKeyErrorLabel = query(".change-api-key-modal .api-key-error-label");

    const apiKeyFromLocalStorage = localStorage.getItem("reload-with-apikey");
    apiKeyInput.value = apiKeyFromLocalStorage;
    configApiKeyInput.innerText = config.apiKey;

    // Hide the previous errors
    apiKeyErrorLabel.classList.add('is-hidden');


    // Modify the UI accordingly
    if (apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== '') {

        // Dynamic Loaded

        apiKeyInput.classList.add("has-text-success-dark");
        apiKeyInput.classList.add("active");
        apiKeyInputTag.classList.remove("is-hidden");
        configApiKeyInput.classList.add("is-disabled");
        configApiKeyInputTagDisabled.classList.remove("is-hidden");
        resetApiKeyButton.classList.remove("is-hidden");
        defaultApiKeyField.classList.remove("is-hidden");
    } else {

        // FROM FILE !!

        // Disable change button until having a good api key
        changeApiKeyButton.classList.add("is-disabled");

        // Show file api key
        defaultApiKeyField.classList.remove("is-hidden");

        // Show Is Active tab for this default api key
        configApiKeyInputTag.classList.remove('is-hidden');

        // Show Tags and validity message
        apiKeyInputTagDisabled.classList.remove("is-hidden");
        apiKeyValidityNotification.classList.remove("is-hidden");
    }

    // Adding the change events to the button
    apiKeyInput.addEventListener("change", updateChangeApiKeyElementsStatus);
}

function updateChangeApiKeyElementsStatus(event) {

    // Get the value from the form...
    const apiKeyFromForm = event.target.value;
    console.log('Value Inserted: %s', apiKeyFromForm);

    // Getting the button element
    const changeApiKeyButton = query(".change-api-key-modal .change-api-key-button");
    const apiKeyInputControl = query(".change-api-key-modal .api-key-input").parentElement;
    const apiKeyErrorLabel = query(".change-api-key-modal .api-key-error-label");

    // Restart initial components
    apiKeyInputControl.classList.remove("has-success");
    apiKeyInputControl.classList.remove("has-error");
    apiKeyErrorLabel.classList.add("is-hidden");

    // Compare with existing api keys and check if we must validate the incoming api key
    const apiKeyFromLocalStorage = localStorage.getItem("reload-with-apikey");
    if (apiKeyFromForm && apiKeyFromForm !== '' && apiKeyFromForm !== apiKeyFromLocalStorage && apiKeyFromForm !== config.apiKey) {

        log("Checking API Key validity against backend...", "BACKEND CALL");
        const isValidApiKey = validateAPIKey(apiKeyFromForm);
        log("VALID API Key ?" + isValidApiKey + "...", "BACKEND CALL RESPONSE");

        // Checking validity status and modify the change api key button accordingly.
        if (isValidApiKey === "OK") {

            // Enable the button and show the proper class for the input text
            changeApiKeyButton.classList.remove("is-disabled");
            apiKeyInputControl.classList.add("has-success");
            apiKeyInputControl.classList.remove("has-error");

            // Updating error label
            apiKeyErrorLabel.classList.add("is-hidden");
            apiKeyErrorLabel.querySelector('.error-reason').innerText = "";

        } else {
            // Disable the send button and show the proper class for the input text
            changeApiKeyButton.classList.add("is-disabled");
            apiKeyInputControl.classList.remove("has-success");
            apiKeyInputControl.classList.add("has-error");

            // Updating error label
            apiKeyErrorLabel.classList.remove("is-hidden");
            apiKeyErrorLabel.querySelector('.error-reason').innerText = isValidApiKey;
        }

    }


    if (apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== '') {
        console.error('Invalid Api Key %c%s %c ... resetting to original state with api key %c%s', 'font-weight: bold;', apiKeyFromLocalStorage, 'font-weight: normal', 'font-weight: bold; color: #257942', config.apiKey);
        clearCustomApiKey();
    }
}

// Check if loaded properly, if don't, delete the localstorage param and reload the page again
function checkIfGigyaLoaded() {
    if (typeof gigya === 'undefined' || gigya.isReady === false) {

        // Clear wrong api key
        const apiKeyFromLocalStorage = localStorage.getItem("reload-with-apikey");
        if (apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== '') {
            console.error('Invalid Api Key %c%s %c ... resetting to original state with api key %c%s', 'font-weight: bold;', apiKeyFromLocalStorage, 'font-weight: normal', 'font-weight: bold; color: #257942', config.apiKey);
            clearCustomApiKey();
        }

    }
}

function validateAPIKey(apiKey) {

    var validApiKeyResponse = "";
    //
    log("X. - Validating api key " + apiKey + "... ", "BACKEND CALL");

    // TODO Include this as part of the call!
    const id_token = '';

    // We make a SYNCHRONOUS url call (only few millis)
    const baseDomainsForApiKey = gigya.partnerSettings.baseDomains;
    const validateAPIKeyUrl = `https://juan.gigya-cs.com/api/cdc-starter-kit/validate-apikey.php?apikey=${apiKey}&baseDomains=${baseDomainsForApiKey}&id_token=${id_token}`;
    var request = new XMLHttpRequest();
    request.open("GET", validateAPIKeyUrl, false); // `false` makes the request synchronous

    try {
        request.send(null);
    } catch (error) {
        // console.log('isInvalid URL');
    }

    if (request.status === 200) {
        validApiKeyResponse = request.responseText;
        // console.log(validApiKeyResponse);
        log("Is this a valid api key ? : " + validApiKeyResponse);

    } else {

        // If for whatever reason is broken, we send true (no backend validation)
        validApiKeyResponse = "OK";
    }
    return validApiKeyResponse;
}