/** *****************************************************/
//                      4. UTILS
/** *****************************************************/
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

function stringToHexSoft(string) {
    return stringToHex(string) + "33";
}

function log(text, operation) {
    if (showLog) {
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

function logEvents(eventName, methodName, logEvents) {
    if (methodName && methodName === "gscounters.sendReport") {
        return;
    }

    if (showEventsLog === true) {
        const title = window.config.menu_description;
        // debugger;
        // var backgroundColor = window.config.menu_bg_color_hover;
        var backgroundColor = "#0089ff33";
        // backgroundColor = "transparent";
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