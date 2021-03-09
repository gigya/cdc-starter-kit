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
var showLog = false;
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

    // Check if user is logged in or not
    gigya.accounts.getAccountInfo({ include: 'emails, profile, data, preferences', callback: initPage });
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
                        user.data.purchasedProducts && user.data.purchasedProducts < 5 ?
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
            ".purchase-modal .modal-card-foot .purchase-button"
        );
        purchaseModalButton.classList.add("is-loading");

        const purchasedProducts = Number(currentUser.data.purchasedProducts + 1);
        const price = Number(
            element.parentElement.parentElement
            .querySelector(".product-actions .right a")
            .innerText.trim()
            .substr(1)
        );
        const credits = Number(currentUser.data.credits - price);
        const uid = currentUser.UID;

        gigya.accounts.setAccountInfo({
            data: { purchasedProducts, credits },
            callback: function(event) {
                log("Product bought", "SET ACCOUNT INFO");
                purchaseModalButton.classList.remove("is-loading");
                hideModal("purchase");
                // We update the session currentUser and then send it to
                currentUser.data.purchasedProducts = purchasedProducts;
                currentUser.data.credits = credits;
                initPage(currentUser);
            },
        });

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

                // 
                // console.log('object :>> ', object);
                // debugger;
                // setTimeout(function() { initPage(currentUser); }, 500);

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