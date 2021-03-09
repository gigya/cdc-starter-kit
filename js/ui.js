/** *****************************************************/
//                    2. UI FUNCTIONS
/** *****************************************************/

/**
 * Render the nabvar
 * @param {object} out The html of the navbar
 */
function renderNavbar(out) {
    // Adding Nabvar
    var outAsElement = htmlToElement(out);
    document.querySelector("#main-navbar .container").innerHTML =
        outAsElement.innerHTML;
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
        siteTitle.innerText = siteTitle.innerText.replaceAll(
            "{{Title}}",
            config.site_title
        );
    }
    for (const siteDescription of siteDescriptions) {
        siteDescription.innerText = siteDescription.innerText.replaceAll(
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
    if (!user.data.purchasedProducts) {
        user.data.purchasedProducts = 4;
    }

    if (!user.data.credits) {
        user.data.credits = 165;
    }

    // debugger;
    /* Hide Registration Screenset */
    hideModal("logging-out");
    hideScreenset("not_logged_placeholder");

    /* Taking relevant info for user */
    var provider = user.loginProvider;
    var uid = user.UID;
    var email = user.profile.email;
    var username = user.profile.firstName;
    username = typeof username !== "undefined" ? username : "(NO NAME)";

    // Check if it's first login
    var again = user.lastLoginTimestamp - user.createdTimestamp < 10000 ? "" : " again";
    // debugger;
    // console.log("again :>> %o", user.lastLoginTimestamp - user.createdTimestamp);

    /* Change the username in the web */
    const siteTitles = queryAll(".site-title");
    const siteDescriptions = queryAll(".site-description");
    const lastLoginUserFriendlyDate = prettyDate(user.lastLogin);

    for (const siteTitle of siteTitles) {
        siteTitle.innerText = siteTitle.innerText.replaceAll(
            "{{Username}}",
            username
        );
    }
    for (const siteTitle of siteTitles) {
        siteTitle.innerText = siteTitle.innerText.replaceAll("{{Again}}", again);
    }

    for (const siteDescription of siteDescriptions) {
        siteDescription.innerText = siteDescription.innerText.replaceAll(
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

    // Load logged sample content
    loadSampleContent(user);
}

/**
 * Hides the logged info for the user and shows the non-logged section
 *
 * @param  {object} user User info object
 */
function showUnloggedHTML() {
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

/**
 * Shows/Hides the right part of the navbar menu for small screen sizes
 */
function toggleBurgerMenu() {
    // debugger;
    var navbarMenu = query(".navbar-menu");
    if (navbarMenu.classList.contains("is-opened")) {
        navbarMenu.classList.remove("is-opened");
    } else {
        navbarMenu.classList.add("is-opened");
    }
}

/**
 * Load some static content inside the page to show that the user is logged
 * @param  {object} user The user object
 */
function loadSampleContent(user) {
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
                if (user.data && user.data.credits) {
                    fixedCurrency =
                        user.data.credits > 0 ?
                        "$" + user.data.credits :
                        "-$" + user.data.credits * -1;
                    classCurrency = user.data.credits > 0 ? "" : "has-text-danger";
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

function cleanSampleContent() {
    var sampleContentDiv = query(".sample-content");

    if (sampleContentDiv) {
        sampleContentDiv.innerHTML = "";
    }
}
/**
 * Blurres the body while the page is logging out
 */
function logoutFromSite() {
    // Clean user state
    currentUser = null;

    // Show Logging out modal
    showModal("logging-out");

    // Remove content from div (if we need to come back again)
    cleanSampleContent();

    // Call the logout function with the callback function
    logoutWithRaaS(gotoUnloggedPage);
}
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

function focusBody() {
    // Look if the screenset was already shown
    const navbar = query("body");

    if (navbar) {
        navbar.scrollIntoView(); // sets focus to element
    }
}
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
    // window.location.href = window.config.main_url.replace('http://', 'https://');
    window.location.href = window.config.main_url;
}

// Show / Hide Modals
function showModal(modal, callback) {
    log("Showing " + capitalize(modal) + " Modal ...");

    // If modal already exists, use that one instead of loading it
    const modalExists = query(`.${modal}-modal`);

    if (modalExists !== null) {
        // If there is a callback function, execute it now.
        if (callback) {
            setTimeout(callback, 300);
            // callback();
        }
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
                // debugger;
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
//                3. LANGUAGE FUNCTIONS
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
    const lang = config.lang.replaceAll("-inf", "");
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
    localStorage.setItem("language", language);

    // Refresh the page
    location.href = location.href;
}

/**
 * Gets the language from the localStorage
 * @returns {string} The language from the localStorage
 */
function getLanguage() {
    // get the language from local storage
    return localStorage.getItem("language");
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
        // debugger;
        if (isActive) {
            langDropdown.classList.remove("is-active");
        } else {
            langDropdown.classList.add("is-active");
        }
    });
}


/** *****************************************************/
//               6. PURCHASE FUNCTIONS
/** *****************************************************/

function showPurchaseModal(element) {
    // debugger;
    // We detect if the click was over the link or over the span
    const sourceElement = element.srcElement.hasChildNodes() ?
        element :
        element.parent;
    const content =
        sourceElement.srcElement.parentElement.parentElement.parentElement
        .parentElement.innerHTML;
    const buttonText = sourceElement.srcElement.innerHTML;
    // Showing purchase Modal, and once shown, load dynamic content for that card
    const purchaseModal = query(".purchase-modal");
    if (purchaseModal) {
        purchaseModal.querySelector(".modal-card-body").innerHTML = "";
    }
    showModal("purchase", function() {
        // Show the purchase button
        const isLogged = currentUser && currentUser.status !== "FAIL";
        const textForButton = isLogged ?
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Buy product for &nbsp;" +
            buttonText :
            "LOGIN to buy this product";
        // inject the card content into the modal
        const purchaseModal = query(".purchase-modal");
        purchaseModal.querySelector(".modal-card-body").innerHTML = content;

        purchaseModal.querySelector(
            ".modal-card-foot .purchase-button"
        ).innerHTML = textForButton;
        purchaseModal.classList.remove("is-hidden");
    });
}

function initProductButtons() {
    // Init all product buttons
    const productButtons = queryAll(".product-actions .button");

    for (var k = 0; k < productButtons.length; k++) {
        const oneProductButton = productButtons[k];
        oneProductButton.addEventListener("click", showPurchaseModal);
    }
}

function initTabButtons() {
    // Init page tabs
    const tabs = queryAll(".store-tabs a");

    for (var k = 0; k < tabs.length; k++) {
        const oneTab = tabs[k];
        oneTab.addEventListener("click", function(event) {
            const element = event.srcElement;
            // debugger;
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
        });
    }
}