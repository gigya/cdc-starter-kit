/**
 * ----------------
 *  # UI JS File
 * ----------------
 *
 * This file contains some specific logic to be able to switch between api keys in realtime.
 * __This file is not needed for a regular gigya implementation__, although it's interesting
 * to understand how to load dinamically Gigya api keys into a site.
 *
 * @link   https://github.com/gigya/cdc-starter-kit/blob/master/js/dynamic-apikey.js
 * @file   This file defines all UI functions to be used in the website.
 * @author juan.andres.moreno@sap.com
 * @since  1.1.0
 */

/** *****************************************************/
//            6. DYNAMIC API Key FUNCTIONS
/** *****************************************************/

/**
 * Changes the API key of the site, writing into the local storage the value of this new API Key and reloading the page.
 */
function changeAPIKey() {
    //
    log("X. - Changing API KEy.... ", "RELOAD ALL PAGE");

    // Show the loading button
    const changeAPIKeyButton = query(
        ".change-api-key-modal .modal-card-foot .change-api-key-button"
    );
    changeAPIKeyButton.classList.add("is-loading");

    // Take the api key
    const apiKey = query(".change-api-key-modal .api-key-input").value;

    // Store api key in local storage and reload the page (it will load the new api key)
    setInLocalStorage("reload-with-apikey", apiKey);

    // Reload page
    window.location.href = window.location.href;
}

/**
 * Loads dynamically into the body of the page the Gigya WebSDK Js file for the incoming API Key.
 * @param {string} apiKey Gigya API Key
 */
function loadGigyaForApiKey(apiKey) {
    // Adding new Gigya script from parameters
    log("2. Load Gigya File with apiKey " + apiKey, "LOAD GIGYA FILE");

    var newScript = document.createElement("script");
    newScript.setAttribute(
        "src",
        "https://cdns.gigya.com/js/gigya.js?apikey=" + apiKey
    );
    document.body.appendChild(newScript);

    // Check if loaded properly, if don't, delete the localstorage param and reload the page again
    setTimeout(checkIfGigyaLoaded, 1500);
}

/**
 * Clears custom api key from local storage and reloads the page with the default one
 */
function clearCustomApiKey() {
    // Show the loading button
    const resetAPIKeyButton = query(
        ".change-api-key-modal .reset-api-key-button"
    );
    if (resetAPIKeyButton) {
        resetAPIKeyButton.classList.add("is-loading");
    }

    localStorage.removeItem("reload-with-apikey");
    window.location.href = window.location.href;
}

/**
 * Check if loaded properly, if don't, delete the localstorage param and reload the page again
 */
function checkIfGigyaLoaded() {
    if (typeof gigya === "undefined" || gigya.isReady === false) {
        // Clear wrong api key
        const apiKeyFromLocalStorage = getFromLocalStorage("reload-with-apikey");
        if (
            apiKeyFromLocalStorage &&
            apiKeyFromLocalStorage !== null &&
            apiKeyFromLocalStorage !== ""
        ) {
            console.error(
                "Invalid Api Key %c%s %c ... resetting to original state with api key %c%s",
                "font-weight: bold;",
                apiKeyFromLocalStorage,
                "font-weight: normal",
                "font-weight: bold; color: #257942",
                config.apiKey
            );
            clearCustomApiKey();
        }
    }
}

/**
 * Validates (Via backend) the incoming API Key. If the backend call is broken, it degrades to a valid API Key, that it will fail later when it's tried to be loaded.
 * @param {string} apiKey the API Key to validate
 * @returns {boolean} Validity of the API Key
 */
function validateAPIKey(apiKey) {
    var validApiKeyResponse = "";
    //
    log("X. - Validating api key " + apiKey + "... ", "BACKEND CALL");

    // TODO Include this as part of the call!
    const id_token = "";

    // We make a SYNCHRONOUS url call (only few millis)
    const baseDomainsForApiKey =
        typeof gigya !== "undefined" ? gigya.partnerSettings.baseDomains : null;
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

/**
 * Disables the button to show the API key popup because of an error
 */
function disableChangeApiKeyButton() {
    const labelForApiKey = query('.navbar .button-apikey');
    if (labelForApiKey) {
        labelForApiKey.classList.add("api-key-error");
        labelForApiKey.style.pointerEvents = "none";
        labelForApiKey.setAttribute("aria-label", "Please, fix the API Key in the url");
    }
}
/** *****************************************************/