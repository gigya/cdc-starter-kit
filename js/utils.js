/**
 * ----------------
 *  # Utils JS File
 * ----------------
 *
 * This file includes some util and standard JS functions to help with the implementation of the site.
 *
 * - String / Date Helper Functions: Functions to deal with strings and thier conversions
 * - Gigya Helper Functions: Gigya related functions, basically to read info from the loaded file
 * - Log Functions:  Functions to log formatted messages for Gigya events and the main site actions.
 * - Search Functions:  Functions to search and get paramteres from query string.
 *
 *
 * @link   https://github.com/gigya/cdc-starter-kit/blob/master/js/utils.js
 * @file   This file defines some utility functions to be used in all the rest of the JS files.
 * @author juan.andres.moreno@sap.com
 * @since  1.0.0
 */


/** *****************************************************/
/*          1. STRING/DATE HELPER FUNCTIONS             */
/** *****************************************************/

/**
 * Return a Hex Hash to be used later as a color from the incoming string
 * @param {string} string 
 * @returns {string} the hex hash for that string
 */
function stringToHex(string) {
    var hash = 0;
    if (string.length === 0) return hash;
    for (var i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    var color = "#";
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 255;
        color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
}
/**
 * Return a Hex Hash to be used later as a color from the incoming string, but softer a 33%
 * @param {string} string 
 * @returns {string} the hex hash for that string
 */
function stringToHexSoft(string) {
    return stringToHex(string) + "33";
}
/**
 * Capitalizes a string
 * @param  {string} s The incoming string
 * @returns {string}   The string capitalized
 */
function capitalize(s) {
    if (typeof s !== "string") {
        return "";
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
}
/**
 * Takes an ISO time and returns a string representing how long ago the date represents.
 * @param  {int} time Unix Time
 * @returns {string} prettifiedDate
 */
function prettyDate(time) {
    var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " "));
    date.setHours(date.getHours() + 1);
    var now = new Date();
    var diff = (now.getTime() - date.getTime()) / 1000;
    dayDiff = Math.floor(diff / 86400);

    if (isNaN(dayDiff) || dayDiff < 0 || dayDiff >= 31) {
        return "";
    }

    const prettifiedDate =
        (dayDiff === 0 &&
            ((diff < 60 && "just now") ||
                (diff < 120 && "1 minute ago") ||
                (diff < 3600 && Math.floor(diff / 60) + " minutes ago") ||
                (diff < 7200 && "1 hour ago") ||
                (diff < 86400 && Math.floor(diff / 3600) + " hours ago"))) ||
        (dayDiff === 1 && "Yesterday") ||
        (dayDiff < 7 && dayDiff + " days ago") ||
        (dayDiff < 31 && Math.ceil(dayDiff / 7) + " weeks ago");
    return prettifiedDate;
}

/** *****************************************************/
/*               2. GIGYA HELPER FUNCTIONS              */
/** *****************************************************/

/**
 * Gets the api key of the site
 * @returns {string} The api key
 */
function getApiKeyFromSite() {
    return gigya.thisScript.APIKey;
}
/**
 * Gets the datacenter of the site
 * @returns {string} The datacenter
 */
function getDatacenterFromSite() {
    return gigya.dataCenter;
}
/**
 * Standarizes the name for some social networks
 * @param  {string} provider The original provider name
 * @returns {string} The standarized name
 */
function sanitizeSocial(provider) {
    // Label identity provi0der
    var identityProviderLabel = query(".provider-label");
    var replaceChars = { ",": ", ", googleplus: "Google", "saml-": "saml-" };
    var identityProviderSanitized = provider.replace(
        /,|googleplus|saml-/g,
        function(match) {
            return replaceChars[match];
        }
    );

    var identityProviderSanitizedAndCapitalized = capitalize(
        identityProviderSanitized
    );
    if (identityProviderSanitized.indexOf("saml-") === 0) {
        return identityProviderSanitized;
    }
    return identityProviderSanitizedAndCapitalized;
}

/** *****************************************************/
/*                    3. LOG FUNCTIONS                 */
/** *****************************************************/
/**
 * 
 * @param {string} text The text to log
 * @param {string} operation the network operation performed. (No network operation if null)
 * @param {boolean} show Show the log or not
 */
function log(text, operation, show) {
    if (showLog === true || show === true) {
        const title = window.config.menu_description;
        var backgroundColor = !operation ? "#00800033" : "#ff000033";
        console.info(
            `%c ${title} %c--> ` + text + "%c%s",
            `font-weight: bold; color: #333;background-color:${backgroundColor};`,
            "font-weight: normal;color:#aaa",
            "font-weight: bold;color:#f14668",
            operation ? " --> " + operation : ""
        );
    }
}
/**
 * 
 * @param {string} eventName The name of the Gigya Event
 * @param {string} methodName The name of the Gigya Method
 * @param {boolean} show Show the log or not
 */
function logEvents(eventName, methodName, show) {
    if (methodName && methodName === "gscounters.sendReport") {
        return;
    }

    // debugger;
    if (showEventsLog === true /*|| show === true*/ ) {
        const title = window.config.menu_description;
        var backgroundColor = "#0089ff33";
        if (methodName) {
            console.info(
                `%c ${title} %c - Event: %c` +
                eventName +
                "%c, Method: %c" +
                methodName,
                `font-weight: bold;color: #333;background-color:${backgroundColor};`,
                "font-weight: normal;color:#aaa",
                `font-weight:bold;color:#428bca;`,
                "font-weight: normal;color:#aaa;",
                "font-weight: bold; color: #f14668"
            );
        } else {
            console.info(
                `%c ${title} %c - Event: %c` + eventName,
                `font-weight: bold; color: #333;background-color:${backgroundColor};`,
                "font-weight: normal;color:#aaa",
                `font-weight:bold; color:#428bca;`
            );
        }
    }
}

/** *****************************************************/


/** *****************************************************/
/*                  4. SEARCH FUNCTIONS                 */
/** *****************************************************/
/**
 * Returns the value of the variable if exists into the query string in the url of the site.
 * @param {string} variable the variable to search
 * @returns {string} the value of the variable if found and null if not found
 */
function getFromQueryString(variable) {

    // Take query string and make object
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(variable)) {

        if (urlParams.get(variable) !== '') {
            return urlParams.get(variable);
        }
    }

}

/**
 *  It returns the url params of hte navigation bar
 * @returns {string} the url params
 */
function getQueryParamsAsString() {
    return window.location.search;
}

/**
 * Gets the variable (if exists) from the local storage
 * @param {string} variable the name of the variable
 * @param {object} value the value of the variable
 */
function getFromLocalStorage(variable) {
    return localStorage.getItem(variable);
}

/**
 * Sets the variable with the value in parameters into the local storage
 * @param {string} variable the name of the variable
 * @param {object} value the value of the variable
 */
function setInLocalStorage(variable, value) {
    localStorage.setItem(variable, value);
}