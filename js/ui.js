/**
 * ----------------
 *  # UI JS File
 * ----------------
 *
 * This file includes all the functions to interact with the site elements and to manage the UI. Sections are divided by UI functionality:
 * 
 *  - Core UI Functions: Basic functions to make the site work
 *  - Focus / Toggle Functions: Focus and toggles certain elements functions
 *  - Goto Functions: Goes to another page functions
 *  - Modal Functions: Functions to show / hide modal windows
 *  - Language Functions: Language related functions (and flags)
 *  - Sample Content Functions: Functions to control the sample content shown
 *  - Purchase Functions: Functions to simulate a purchase operation
 *  - Change API Key Functions: Functions to manage the popup for the dynamic API Key load
 *  
 * @link   https://github.com/gigya/cdc-starter-kit/blob/master/js/ui.js
 * @file   This file defines all UI functions to be used in the website.
 * @author juan.andres.moreno@sap.com
 * @since  1.0.0
 */

/** *****************************************************/
//                1. CORE UI FUNCTIONS
/** *****************************************************/

/**
 * Render the nabvar
 * @param {object} out The html of the navbar
 */
function renderNavbar(out) {
    // Adding Nabvar
    var outAsElement = htmlToElement(out);
    document.querySelector("#main-navbar .container").innerHTML = outAsElement.innerHTML;

    setTimeout(function() {
        // Adding the colored background to the api key section if dinamically loaded
        const apiKeyFromLocalStorage = getFromLocalStorage("reload-with-apikey");
        const apiKeyFromQueryString = config.apiKeyFromQueryString;

        // Modify the UI accordingly
        const hasApiKeyFromLocalStorage = apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== '';
        const hasApiKeyFromQueryString = apiKeyFromQueryString && apiKeyFromQueryString !== null && apiKeyFromQueryString !== '';
        if (hasApiKeyFromQueryString || hasApiKeyFromLocalStorage) {
            const apiKeyButtonInNavbar = query(".button-apikey");
            apiKeyButtonInNavbar.classList.add("dynamic-apikey");
        }
    }, 300);
}

/**
 * @param {String} html representing a single element
 * @returns {Element}
 */
function htmlToElement(html) {
    var template = document.createElement("template");
    var htmlTrimmed = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = htmlTrimmed;
    return template.content.firstChild;
}

/**
 * Render the title, description, image and datacenter + api key for the site
 * @param {object} config The configuration object
 */
function renderMainSiteData(config) {
    /* CHANGE SITE LOGO / MENU LOGO */
    var srcMainPic = "img/logos/" + config.main_pic;
    var srcMenuPic = "img/logos/" + config.menu_pic;
    const srcMainPicElement = query(".main-pic");
    srcMainPicElement.setAttribute("src", srcMainPic);
    const srcMenuPicElement = query(".menu-pic");
    srcMenuPicElement.setAttribute("src", srcMenuPic);

    /* CHANGE TITLE AND DESCRIPTION */
    const siteTitles = queryAll(".site-title");
    const siteDescriptions = queryAll(".site-description");
    const menuDescription = query(".menu-description");
    const apiKeyButton = query(".button-apikey");
    const apiKeySpan = query(".span-apikey");
    const datacenterButton = query(".button-datacenter");
    const datacenterSpan = query(".span-datacenter");

    for (const siteTitle of siteTitles) {
        siteTitle.innerText = siteTitle.innerText.replace(
            "{{Title}}",
            config.site_title
        );
    }
    for (const siteDescription of siteDescriptions) {
        siteDescription.innerText = siteDescription.innerText.replace(
            "{{Description}}",
            config.site_description
        );
    }
    menuDescription.innerText = config.menu_description;

    apiKeyButton.setAttribute("aria-label", "ApiKey: " + getApiKeyFromSite());
    apiKeySpan.innerText = getApiKeyFromSite().substring(0, 6) + "...";
    datacenterButton.setAttribute(
        "aria-label",
        "Datacenter: " + getDatacenterFromSite()
    );
    datacenterSpan.innerText = getDatacenterFromSite();

    /* CHANGE PAGE PROPERTIES */
    document.title = config.site_title;
    query('link[rel*="icon"]').href = "img/logos/" + config.menu_pic;

    /* SET MAIN LINK */
    query(".navbar-item").href = config.main_url;
}

/**
 * Sets the css to adapt to the configuration of the site (config/site.json)
 * @param {object} config The configuration object
 */
function includeConfigCss(config) {
    /* SET BACKGROUND & BACKGROUND LINK COLOR HOVER FOR NAVBAR */
    var css = "";
    css = `.navbar .navbar-brand .navbar-item:not(.is-icon):hover, .navbar .navbar-menu .navbar-item:not(.is-icon):hover {background: ${config.menu_bg_color_hover} !important; height:auto;}`;
    css += `.navbar .navbar-brand, .navbar .navbar-menu {background: ${config.menu_bg_color} !important;}`;
    css += `.navbar .navbar-brand .menu-description {color: ${config.menu_text_color} !important;}`;
    css += `.mobile-navbar .navbar-burger span {background-color: ${config.menu_text_color} !important;}`;
    css += `.navbar .icon-link ion-icon, .navbar .span-datacenter, .navbar .span-previous-logins,  .navbar .span-apikey,  .navbar .span-providers, .navbar .button-datacenter ion-icon, .navbar .button-apikey ion-icon, .navbar .is-separator {color: ${config.menu_text_color} !important;}`;

    /* SET BACKGROUND & FONT COLORS FOR WEBSITE */
    css += `body {background: ${config.background_color} !important;}`;
    css += `body .title, body .subtitle {color: ${config.text_color} !important;}`;

    var style = document.createElement("style");

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName("head")[0].appendChild(style);
}

/**
 * Injects the user data into the HTML of the page
 *
 * @param  {object} user User info object
 */
function showLoggedHTML(user) {
    // Put some dummy data if this does not exist
    if (!user.data.wallet) {
        user.data.wallet = {
            credits: 250,
            purchasedProducts: 2
        }
    }

    /* Hide Registration Screenset */
    hideScreenset("not_logged_placeholder");
    hideModal("logging-out");

    /* Taking relevant info for user */
    var provider = user.loginProvider;
    var uid = user.UID;
    var email = user.profile.email;
    var username = user.profile.firstName;
    username = typeof username !== "undefined" ? username : "(NO NAME)";

    // Check if it's first login
    var again = user.lastLoginTimestamp - user.createdTimestamp < 10000 ? "" : " again";
    // console.log("again :>> %o", user.lastLoginTimestamp - user.createdTimestamp);

    /* Change the username in the web */
    const siteTitles = queryAll(".site-title");
    const siteDescriptions = queryAll(".site-description");
    const lastLoginUserFriendlyDate = prettyDate(user.lastLogin);

    for (const siteTitle of siteTitles) {
        siteTitle.innerText = siteTitle.innerText.replace(
            "{{Username}}",
            username
        );
    }
    for (const siteTitle of siteTitles) {
        siteTitle.innerText = siteTitle.innerText.replace("{{Again}}", again);
    }

    for (const siteDescription of siteDescriptions) {
        siteDescription.innerText = siteDescription.innerText.replace(
            "{{Last Login}}",
            lastLoginUserFriendlyDate
        );
    }

    /* Switch Menu settings */
    const notLoggedElements = queryAll(".not-logged");
    for (const notLoggedElement of notLoggedElements) {
        notLoggedElement.classList.add("is-hidden");
    }
    const loggedElements = queryAll(".logged");
    for (const loggedElement of loggedElements) {
        loggedElement.classList.remove("is-hidden");
    }

    /* Look for user image */
    const profileUserImage = user.profile.photoURL ? user.profile.photoURL : "";
    if (profileUserImage !== "") {
        const imageTag = query(".user-image img");
        const iconTag = query(".user-image ion-icon");
        imageTag.classList.remove("is-hidden");
        iconTag.classList.add("is-hidden");
        imageTag.setAttribute("src", profileUserImage);
    }

    // Paint Providers
    const providersButton = query(".button-providers");
    const providersButtonIcons = queryAll(".button-providers ion-icon");
    const userInfoButton = query(".button-user-info");
    const userInfoSpan = query(".span-user-info");
    const providersSpan = query(".span-providers");
    var socialProvidersAsArray = user.socialProviders.split(",");
    var socialProvidersAsArraySanitized = [];

    // Get all providers and clean them separately
    for (var i = 0; i < providersButtonIcons.length; i++) {
        const oneProvidersButtonIcon = providersButtonIcons[i];
        providersButton.removeChild(oneProvidersButtonIcon);
    }

    // Get all providers and clean them separately
    for (var j = 0; j < socialProvidersAsArray.length; j++) {
        const oneSocialProvider = socialProvidersAsArray[j];
        const oneSocialProviderSanitized = sanitizeSocial(oneSocialProvider);
        socialProvidersAsArraySanitized.push(oneSocialProviderSanitized);
        const newSocialIconChild = document.createElement("ion-icon");
        var iconName = "logo-" + oneSocialProviderSanitized.toLowerCase();

        // SAML Case
        if (oneSocialProviderSanitized.indexOf("saml-") === 0) {
            iconName = "key";
        }
        iconName = iconName === "logo-site" ? "browsers-outline" : iconName;
        newSocialIconChild.setAttribute("name", iconName);
        newSocialIconChild.classList.add("social-provider-icon");
        newSocialIconChild.classList.add(
            "is-" + oneSocialProviderSanitized.toLowerCase()
        );
        providersButton.appendChild(newSocialIconChild);
    }

    // Show all providers label
    providersButton.setAttribute(
        "aria-label",
        socialProvidersAsArraySanitized.join(", ")
    );

    // Make a call to get the current user (if data.previousLogins is defined)
    if (user.data && user.data.previousLogins) {
        renderPreviousLoginsIfDefined(user.data.previousLogins);
    }

    // Show User Info
    const text =
        "USER INFO:\u000A\u000A· Login Provider: " +
        capitalize(currentUser.loginProvider + "\u000A· UID: " + currentUser.UID + "\u000A· Last Login: " + capitalize(prettyDate(currentUser.lastLogin)) + "\u000A· Registered: " + capitalize(prettyDate(currentUser.registered)));

    userInfoButton.setAttribute("aria-label", text);
    userInfoSpan.innerHTML = "UID: " + currentUser.UID.substring(0, 6) + "...";

    // Load logged sample content
    loadSampleContent(user);
}

/**
 * Hides the logged info for the user and shows the non-logged section
 *
 * @param  {object} user User info object
 */
function showUnloggedHTML() {

    // Hide logging out modal if present
    hideModal("logging-out");

    /* Switch Menu settings */
    const notLoggedElements = queryAll(".not-logged");
    for (const notLoggedElement of notLoggedElements) {
        notLoggedElement.classList.remove("is-hidden");
    }
    const loggedElements = queryAll(".logged");
    for (const loggedElement of loggedElements) {
        loggedElement.classList.add("is-hidden");
    }

    /* Hide previous logged navbar element if shown */
    query(".previous-logins-navbar-item").classList.add("is-hidden");
    query(".user-info-navbar-item").classList.add("is-hidden");

    // Load unlogged sample content
    loadSampleContent(null);
}

/**
 * [showErrorLogo description]
 * @param  {object} element element from DOM
 */
function showErrorLogo(element) {
    element.onerror = null;
    element.src = "img/skeleton/logo-error.png";
}

/** *****************************************************/
//                2. FOCUS / TOGGLE FUNCTIONS
/** *****************************************************/

/**
 * Shows the login screen, or focus the email field if the screen is already present
 */
function showOrHighlightLoginScreen() {
    // Look if the screenset was already shown
    const loginScreenset = query("#not_logged_placeholder .gigya-login-form");

    // If yes, highlight the first field once (UX improvement)
    if (loginScreenset !== null) {
        focusLoginBox();
    } else {
        // Showing login screen
        loginWithRaaS("not_logged_placeholder", focusLoginBox);

        // Continue as usual
    }
}
/**
 * Shows the login screen, or focus the email field if the screen is already present
 */
function showOrHighlightRegisterScreen() {
    // Look if the screenset was already shown
    const registerScreenset = query(
        "#not_logged_placeholder .gigya-register-form"
    );

    // If yes, highlight the first field once (UX improvement)
    if (registerScreenset !== null) {
        focusRegisterBox();
    } else {
        // Showing register screen
        registerWithRaaS("not_logged_placeholder", focusRegisterBox);

        // Continue as usual
    }
}

/**
 * Looks for the login screenset component and focus the cursor in the first element
 */
function focusLoginBox() {
    // Look if the screenset was already shown
    const loginScreenset = query("#not_logged_placeholder .gigya-login-form");

    // If yes, highlight the first field once (UX improvement)
    if (loginScreenset !== null) {
        const input = loginScreenset.querySelector('input[name="username"]');

        if (input) {
            input.focus(); // sets focus to element
        }
    }
}

/**
 * Looks for the register screenset component and focus the cursor in the first element
 */
function focusRegisterBox() {
    // Look if the screenset was already shown
    const registerScreenset = query(
        "#not_logged_placeholder .gigya-register-form"
    );

    // If yes, highlight the first field once (UX improvement)
    if (registerScreenset !== null) {
        const input = registerScreenset.querySelector('input[name="email"]');
        if (input) {
            input.focus(); // sets focus to element
        }
    }
}

/**
 * Focuses the top of the body
 */
function focusBody() {
    // Look if the screenset was already shown
    const navbar = query("body");

    if (navbar) {
        navbar.scrollIntoView(); // sets focus to element
    }
}
/**
 * Shows/Hides the right part of the navbar menu for small screen sizes
 */
function toggleBurgerMenu() {
    var navbarMenu = query(".navbar-menu");
    if (navbarMenu.classList.contains("is-opened")) {
        navbarMenu.classList.remove("is-opened");
    } else {
        navbarMenu.classList.add("is-opened");
    }
}

/**
 * Shows the Change API Key Modal and initializes it.
 */
function showChangeApiKeyModal() {
    showModal("change-api-key", initChangeApiKeyModal);
}

/**
 * This function checks if there are pending offers to check from the user and if it has enabled the capability of seeing this offers popup.
 * If there are pending offers, and the offers capability it's enabled, the user will see that popup each 3 logins until he disables this of
 * accepts all the offers that are still pending.
 * 
 * @param {obect} event response event after onLogin
 * @param {number} previousLogins number of previous logins
 * @param {boolean} recieveOfferAlerts flat to show or not the popop
 */
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
//                3. GOTO FUNCTIONS
/** *****************************************************/

/**
 * Switch the page elements into a non logged state
 */
function gotoUnloggedPage() {
    // Check if we are in edit page. If yes, go to home page. If not, present login window again.
    const editPlaceholder = query("#edit_profile_placeholder");
    if (editPlaceholder) {
        gotoHome();
    } else {
        showUnloggedHTML();
        loginWithRaaS("not_logged_placeholder");
    }
}

/**
 * Goes to the home page (defined in parameter 'main_url' inside config/site.json)
 */
function gotoHome() {
    const queryParamsAsString = getQueryParamsAsString();
    window.location.href = window.config.main_url + queryParamsAsString;
}

/**
 * Goes to the Edit page with the query url params attached if they are available
 */
function gotoEditPage() {
    const queryParamsAsString = getQueryParamsAsString();
    window.location.href = "edit-profile.html" + queryParamsAsString;
}

/** *****************************************************/
//                4. MODAL FUNCTIONS
/** *****************************************************/

/**
 * Shows the modal with the id of the param, and executes a callback once loaded if defined
 * @param {string} modal the modal to show
 * @param {function} callback if defined, the callback to exacute after the modal is loaded
 */
function showModal(modal, callback) {
    log("Showing " + capitalize(modal) + " Modal ...");

    // If modal already exists, use that one instead of loading it
    const modalExists = query(`.${modal}-modal`);

    if (modalExists !== null) {
        // If there is a callback function, execute it now.
        if (callback) {
            setTimeout(callback, 300);
            callback();
        }

        // Finally, show the modal
        query(`.${modal}-modal`).classList.add("is-active");

    } else {
        const path = `./html/modals/${modal}-modal.html`;

        // Load template
        fetch(path)
            .then((res) => {
                return res.text();
            })
            .then((out) => {
                // execute the compiled template and print the output to the console
                var template = Handlebars.compile(out);

                const compiled = template();

                // Include the modal in the HTML
                query("body").insertAdjacentHTML("beforeend", compiled);

                // Finally, show the modal
                query(`.${modal}-modal`).classList.add("is-active");

                // If there is a callback function, execute it now.
                if (callback) {
                    setTimeout(callback, 300);
                    // callback();
                }
            })
            .catch((err) => {
                return console.error(err);
            });
    }
}

/**
 * Hides the modal with the id of teh param
 * @param {string} modal the modal to hide
 */
function hideModal(modal) {
    // log("Hiding " + capitalize(modal) + " Modal ...");

    const modalElement = query(`.${modal}-modal`);

    if (modalElement) {
        setTimeout(function() {
            modalElement.classList.remove("is-active");
        }, 100);
    }
}

/** *****************************************************/
//                5. LANGUAGE FUNCTIONS
/** *****************************************************/

/**
 * Get the proper icon for the incoming language using the arrays of languages (config/languages.json)
 * @param  {array} languages The array of languages
 * @param  {string} language  The language to use for the flag
 * @returns {string} The proper flag code as string
 */
function getFlagIconFor(languages, language) {
    for (var i = 0; i < languages.length; i++) {
        const oneLanguage = languages[i];
        if (oneLanguage.key === language) {
            return oneLanguage.flag;
        }
    }
    return "";
}

/**
 * Set the correct language and tooltip for the language
 * @param {object} config The configuration object
 */
function setActiveLanguageFlag(config) {
    /* SET CORRECT FLAG IN FUNCTION OF LANGUAGE */

    // Set language name from language code
    const lang = config.lang.replace("-inf", "");
    if (Intl.DisplayNames) {
        languageNames = new Intl.DisplayNames([lang], { type: "language" });
        langName = capitalize(languageNames.of(lang));
    } else {
        langName = lang.toUpperCase();
    }

    fetch("./config/languages.json")
        .then((res) => {
            return res.json();
        })
        .then((out) => {
            // Start demo page
            queryAll(".language-dropdown .dropdown-content").forEach(
                (flagsContainer, i) => {
                    for (var j = 0; j < out.languages.length; j++) {
                        const oneLanguage = out.languages[j];
                        const html = createEntryFor(oneLanguage);
                        flagsContainer.appendChild(html);
                    }
                }
            );

            // Tooltip
            queryAll(".flag-container").forEach((item, i) => {
                item.setAttribute("aria-label", langName);
            });

            // Selected Flag
            const langSelectedFlag = getFlagIconFor(out.languages, config.lang);
            queryAll(".flag-container >a>.flag-icon").forEach((item) => {
                // Fix english flag.
                item.classList.add("flag-icon-" + langSelectedFlag);
            });
        })
        .catch((err) => {
            return console.error(err);
        });
}
/**
 * Change the current language with the incoming one and refresh the page to reload the screensets
 * @param  {string} language The incoming language
 */
function changeLanguage(language) {
    // set the language in local storage
    setInLocalStorage("language", language);

    // Refresh the page
    location.href = location.href;
}

/**
 * Gets the language from the localStorage
 * @returns {string} The language from the localStorage
 */
function getLanguage() {
    // get the language from local storage
    return getFromLocalStorage("language");
}

/**
 * Creates an entry for the dropdown with the incoming language
 * @param  {string} language The language string
 * @returns {object} The generated entry for the dropdown
 */
function createEntryFor(language) {
    // Add a
    var aObj = document.createElement("a");

    // Add span
    var spanObj = document.createElement("span");

    // Set attribute for img, such as id
    spanObj.setAttribute("class", "flag-icon flag-icon-" + language.flag);
    spanObj.innerText = language.label;

    // Create element and return
    aObj.onclick = function() {
        changeLanguage(language.key);
    };
    aObj.setAttribute("class", "dropdown-item");
    aObj.href = "#";
    aObj.appendChild(spanObj);
    return aObj;
}

/**
 * Toggles the language dropdown in the navbar
 */
function toggleLanguageDropDown() {
    queryAll(".language-dropdown").forEach((langDropdown, i) => {
        const isActive = langDropdown.classList.contains("is-active");
        if (isActive) {
            langDropdown.classList.remove("is-active");
        } else {
            langDropdown.classList.add("is-active");
        }
    });
}

/** *****************************************************/
//                6. SAMPLE CONTENT
/** *****************************************************/

/**
 * Load some static content inside the page to show that the user is logged
 * @param  {object} user The user object
 */
function loadSampleContent(user) {


    // Check if we have the showSampleContent Enabled
    if (showSampleContent === true) {
        const sampleContent = query(".sample-content");

        if (sampleContent) {
            const isLogged = user ? true : false;
            const path = isLogged ?
                "./html/sample-content/ecommerce.html" :
                "./html/sample-content/ecommerce-not-logged.html";

            // Load template
            fetch(path)
                .then((res) => {
                    return res.text();
                })
                .then((out) => {
                    // compile the template
                    var template = Handlebars.compile(out);

                    // execute the compiled template and print the output to the console
                    // Add config to the user element prior to compile (it will be used by the template) and compile
                    const user =
                        currentUser && currentUser.status === "OK" ? currentUser : {};
                    user.config = config;

                    // Get price and fix currency if needed
                    let fixedCurrency = "$10000";
                    let classCurrency = "";
                    if (user.data && user.data.wallet.credits) {
                        fixedCurrency =
                            user.data.wallet.credits > 0 ?
                            "$" + user.data.wallet.credits :
                            "-$" + user.data.wallet.credits * -1;
                        classCurrency =
                            user.data.wallet.credits > 0 ? "" : "has-text-danger";
                    }
                    if (!user.data) {
                        user.data = {};
                    }
                    user.data.fixedCurrency = fixedCurrency;
                    user.data.classCurrency = classCurrency;

                    const compiled = template(user);
                    sampleContent.innerHTML = compiled;

                    // Init the product buttons once content is loaded
                    initProductButtons(isLogged);

                    // Init tabs
                    initTabButtons();

                    // Focus the body on the top
                    focusBody();
                })
                .catch((err) => {
                    return console.error(err);
                });
        }
    }

}

/**
 * Cleans HTNL for sample content.
 */
function cleanSampleContent() {
    var sampleContentDiv = query(".sample-content");

    if (sampleContentDiv) {
        sampleContentDiv.innerHTML = "";
    }
}

/**
 * Initialize all tab buttons
 */
function initTabButtons() {
    // Init page tabs
    const tabs = queryAll(".store-tabs a");

    for (var k = 0; k < tabs.length; k++) {
        const oneTab = tabs[k];
        oneTab.addEventListener("click", activateTabButtons);
    }
}

/**
 * Activate a tab when clicked, deactivating after the previous one.
 */
function activateTabButtons(event) {
    const element = event.srcElement;
    if (element) {
        // Update tabs
        const elementToDeactivate = event.srcElement.parentElement.querySelector(
            "a.is-active"
        );
        elementToDeactivate.classList.remove("is-active");
        element.classList.add("is-active");

        // Active content for that tab
        const tabDataElement = element.getAttribute("data-tab");
        query("#" + tabDataElement).classList.add("is-active");

        // Hide current content and deactivate old tab
        const dataTabElementToDeactivate = elementToDeactivate.getAttribute(
            "data-tab"
        );
        query("#" + dataTabElementToDeactivate).classList.remove("is-active");
    }
}

/** *****************************************************/
//               7. PURCHASE FUNCTIONS
/** *****************************************************/

/**
 * Show The purchase modal and adapt the content in function of if you are logged in or not
 * @param {object} element HTML element that receives the click for a purchase
 */
function showPurchaseModal(element) {

    // Showing purchase Modal, and once shown, load dynamic content for that card
    showModal("purchase", function() {

        // We detect if the click was over the link or over the span
        const sourceElement = element.srcElement.hasChildNodes() ? element : element.parent;
        const content = sourceElement && sourceElement.srcElement.parentElement.parentElement.parentElement.parentElement;
        const imagePath = content && content.querySelector('img').getAttribute('src');
        const title = content && content.querySelector(".product-info h3").innerText;
        const description = content && content.querySelector(".product-info p").innerText;
        const buttonText = sourceElement && sourceElement.srcElement.parentElement.innerText;
        const price = buttonText ? Number(buttonText.substr(1)) : "-";
        const hasCredits = currentUser && currentUser.data && currentUser.data.wallet && currentUser.data.wallet.credits - price > 0;
        const isLogged = currentUser && currentUser.status !== "FAIL";
        const enabledButton = !isLogged || hasCredits;
        const priceClass = enabledButton ? "accent-button" : "red-button";
        if (!imagePath || !title || !description || !buttonText) {
            // debugger;
        }
        // Get proper text for button
        const textForButton = isLogged ? "Buy product for &nbsp;" + buttonText : "LOGIN to buy this product";

        // inject the card content into the modal
        const purchaseModal = query(".purchase-modal");
        purchaseModal.querySelector(".product-info h3").innerText = title;
        purchaseModal.querySelector(".product-info p").innerText = description;
        purchaseModal.querySelector("#quickview-price").innerText = buttonText;
        purchaseModal.querySelector(".product-image img").src = imagePath;

        const purchaseButton = purchaseModal.querySelector(".purchase-button");
        purchaseButton.querySelector("span").innerHTML = textForButton;
        purchaseButton.classList.remove("is-loading");

        // Check the status of the button (first we clean it from previous state)
        purchaseButton.classList.remove("is-disabled", "red-button", "accent-button");
        purchaseButton.classList.add(priceClass);
        if (!enabledButton) {
            purchaseButton.classList.add('is-disabled');
        }

    });
}

/**
 * Init all product buttons to lauch a purchase modal with the content of that product
 */
function initProductButtons() {
    // Init all product buttons
    const productButtons = queryAll(".product-actions .button");

    for (var k = 0; k < productButtons.length; k++) {
        const oneProductButton = productButtons[k];
        oneProductButton.addEventListener("click", showPurchaseModal);
    }
}



/** *****************************************************/
//             8. CHANGE API KEY FUNCTIONS
/** *****************************************************/

/**
 * Initializes the modal for the dynamic IP Key Load of the page. If the API key is valid, all buttons are enabled and the user can go to the next state.
 * If it's invalid, it shows the error on the screen, and doesn't allow to continue with the dynamic load of the screen.
 */
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
    const changeApiKeyExplanations = queryAll(".change-api-key-modal .change-api-key-explanation");

    const changeApiKeyButton = query(".change-api-key-modal .change-api-key-button");
    const resetApiKeyButton = query(".change-api-key-modal .reset-api-key-button");
    const apiKeyErrorLabel = query(".change-api-key-modal .api-key-error-label");
    const fromUrlNotice = query(".change-api-key-modal .from-url-notice");
    const resetUrlMessage = query(".change-api-key-modal .reset-url-message");

    // Showing proper ApiKey (the one in the url takes precedence over the one in the localStorage)
    const apiKeyFromLocalStorage = getFromLocalStorage("reload-with-apikey");
    const apiKeyFromQueryString = config.apiKeyFromQueryString;
    const screensetPrefixFromQueryString = getFromQueryString("screensetPrefix");
    apiKeyInput.value = apiKeyFromQueryString ? apiKeyFromQueryString : apiKeyFromLocalStorage;
    configApiKeyInput.innerText = config.apiKey;

    // Hide the previous errors
    apiKeyErrorLabel.classList.add('is-hidden');


    // Modify the UI accordingly
    const hasApiKeyFromLocalStorage = apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== '';
    const hasApiKeyFromQueryString = apiKeyFromQueryString && apiKeyFromQueryString !== null && apiKeyFromQueryString !== '';
    const hasScreensetPrefixFromQueryString = screensetPrefixFromQueryString && screensetPrefixFromQueryString !== null && screensetPrefixFromQueryString !== '';
    if (hasApiKeyFromLocalStorage || hasApiKeyFromQueryString) {

        // Dynamic Loaded. Common for both cases
        apiKeyInput.classList.add("has-text-success-dark");
        apiKeyInput.classList.add("active");
        apiKeyInputTag.classList.remove("is-hidden");
        configApiKeyInput.classList.add("is-disabled");
        configApiKeyInputTagDisabled.classList.remove("is-hidden");

        // Additional changes for API Key loaded from URL
        if (hasApiKeyFromQueryString) {
            fromUrlNotice.classList.remove("is-hidden");
            resetUrlMessage.classList.remove("is-hidden");
            changeApiKeyButton.classList.add("is-disabled");
            changeApiKeyExplanations.forEach(element => {
                element.classList.add("is-hidden");
            });
        } else {

            resetApiKeyButton.classList.remove("is-hidden");
            defaultApiKeyField.classList.remove("is-hidden");

        }

        // Additions in the screen if the Screenset Prefix was added.
        if (hasScreensetPrefixFromQueryString) {
            const screensetPrefixField = query('.screenset-prefix-field');
            const screensetPrefixInput = query('.screenset-prefix-input');
            screensetPrefixInput.value = config.raas_prefix;
            screensetPrefixField.classList.remove('is-hidden');
        }

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
    apiKeyInput.addEventListener("input", updateChangeApiKeyElementsStatus);
}

/**
 * Validates the inserted api key and updates the modal with the new values recieved from the inserted API Key. 
 * @param {object} event HTML Element with the inserted API Key
 */
function updateChangeApiKeyElementsStatus(event) {

    // Get the value from the form...
    const apiKeyFromForm = event.target.value;

    // Getting the button element
    const changeApiKeyButton = query(".change-api-key-modal .change-api-key-button");
    const apiKeyInputControl = query(".change-api-key-modal .api-key-input").parentElement;
    const apiKeyErrorLabel = query(".change-api-key-modal .api-key-error-label");

    // Restart initial components
    apiKeyInputControl.classList.remove("has-success");
    apiKeyInputControl.classList.remove("has-error");
    apiKeyErrorLabel.classList.add("is-hidden");

    // Compare with existing api keys and check if we must validate the incoming api key
    const apiKeyFromLocalStorage = getFromLocalStorage("reload-with-apikey");
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


    // if (apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== '') {
    //     console.error('Invalid Api Key %c%s %c ... resetting to original state with api key %c%s', 'font-weight: bold;', apiKeyFromLocalStorage, 'font-weight: normal', 'font-weight: bold; color: #257942', config.apiKey);
    //     clearCustomApiKey();
    // }
}

/** *****************************************************/