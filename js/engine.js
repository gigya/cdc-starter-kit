/**
 * ----------------
 *  # Main JS File
 * ----------------
 *
 * This file includes some util and HTML functions to make the site fully functional, and to show/hide elements
 * depending if the user is logged or not.
 *
 * @link   https://github.com/juanatsap/gigya-starter-kit/blob/master/js/main.js
 * @file   This file defines the main functions to make the demo site work.
 * @author juan.andres.moreno@sap.com
 * @since  1.0.0
 */

// -- 0. window.document Shorthands
const query = document.querySelector.bind(document);
const queryAll = document.querySelectorAll.bind(document);
var sessionStatus = 'loggedOut'; // possible values: loggedOut, loggedIn

/** *****************************************************/
//                   DEMO CORE FUNCTIONS
/** *****************************************************/

// -- 1. Core
/**
 * Injects the user data into the HTML of the page
 *
 * @param  {object} user User info object
 */
function showLoggedHTML(user) {

    /* Hide Registration Screenset */
    hideScreenset('not_logged_placeholder');

    /* Taking relevant info for user */
    var provider = user.loginProvider;
    var uid = user.UID;
    var email = user.profile.email;
    var username = user.profile.firstName;

    /* Change the username in the web */
    const siteTitles = queryAll('.site-title');
    const siteDescriptions = queryAll('.site-description');
    const lastLoginUserFriendlyDate = prettyDate(user.lastLogin);

    for (const siteTitle of siteTitles) {
        siteTitle.innerText = siteTitle.innerText.replaceAll('{{Username}}', username);
    }

    for (const siteDescription of siteDescriptions) {
        siteDescription.innerText = siteDescription.innerText.replaceAll('{{Last Login}}', lastLoginUserFriendlyDate);
    }

    /* Switch Menu settings */
    const notLoggedElements = queryAll('.not-logged');
    for (const notLoggedElement of notLoggedElements) {
        notLoggedElement.classList.add('hidden');
    }
    const loggedElements = queryAll('.logged');
    for (const loggedElement of loggedElements) {
        loggedElement.classList.remove('hidden');
    }

    /* Look for user image */
    const profileUserImage = user.profile.photoURL ? user.profile.photoURL : '';
    if (profileUserImage !== '') {
        const imageTag = query('.user-image img');
        const iconTag = query('.user-image ion-icon');
        imageTag.classList.remove('hidden');
        iconTag.classList.add('hidden');
        imageTag.setAttribute('src', profileUserImage);
    }

    // Paint Providers
    const providersButton = query('.button-providers');
    const providersButtonIcons = queryAll('.button-providers ion-icon');
    const providersSpan = query('.span-providers');
    var socialProvidersAsArray = user.socialProviders.split(',');
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
        const newSocialIconChild = document.createElement('ion-icon');
        var iconName = 'logo-' + oneSocialProviderSanitized.toLowerCase();
        iconName = iconName === 'logo-site' ? 'browsers-outline' : iconName;
        newSocialIconChild.setAttribute('name', iconName);
        newSocialIconChild.classList.add('social-provider-icon');
        newSocialIconChild.classList.add('is-' + oneSocialProviderSanitized.toLowerCase());
        providersButton.appendChild(newSocialIconChild);
    }

    // Show all providers label
    providersButton.setAttribute('aria-label', socialProvidersAsArraySanitized.join(', '));
}

/**
 * Hides the logged info for the user and shows the non-logged section
 *
 * @param  {object} user User info object
 */
function showUnloggedHTML() {

    /* Switch Menu settings */
    const notLoggedElements = queryAll('.not-logged');
    for (const notLoggedElement of notLoggedElements) {
        notLoggedElement.classList.remove('hidden');
    }
    const loggedElements = queryAll('.logged');
    for (const loggedElement of loggedElements) {
        loggedElement.classList.add('hidden');
    }
}

function loadSampleContent(user) {

    const sampleContent = query('.sample_content');

    if (sampleContent) {
        const path = './html/sample_content/ecommerce.html';
        //
        fetch(path)
            .then((res) => { return res.text(); })
            .then((out) => {
                // console.log('HTML Content: %s', out);
                // compile the template
                var template = Handlebars.compile(out);
                // execute the compiled template and print the output to the console

                const compiled = template(user);
                // console.log(compiled);
                sampleContent.innerHTML = compiled;
            }).catch((err) => { return console.error(err); });
    }
}

/**
 * Check Gigya session Functions
 *
 * @param  {object} user User info object
 */
function redirectIfLogged(user) {

    /* If not logged, show registration form */
    if (!user.UID) {
        sessionStatus = 'loggedOut';

        console.log('You are not logged in.');

        /* In function of the page, show or show login page, or redirect to home */
        gotoUnloggedPage();

    } else {
        sessionStatus = 'loggedIn';

        /* If logged, show user HTML */
        showLoggedHTML(user);

        /* In function of the page, show or sample content, or edit profile */
        const url = window.location.href;
        if (url.indexOf('edit-profile') <= 0) {
            loadSampleContent(user);
        } else {
            editProfileWithRaaS('edit_profile_placeholder');
        }
    }
}


function capitalize(s) {
    if (typeof s !== 'string') { return ''; }
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Loads the configuration file into the window object to be used later on to customize the UI
 */
function loadConfigurationFromFile() {
    fetch('./config/config.json')
        .then((res) => { return res.json(); })
        .then((out) => {

            // Start demo page
            startDemo(out);

        }).catch((err) => { return console.error(err); });
}

/**
 * [startDemo description]
 * @param  {[type]} out [description]
 */
function startDemo(out) {

    // Store config in window global (:-s)
    console.log('Config file: ');
    console.table(out);

    // Get proper language
    const storedLanguage = getLanguage();
    if (storedLanguage !== null) {
        out.lang = storedLanguage;
    }
    window.config = out;

    // Start UI;
    setUI(out);

    // Check if user is logged in or not
    gigya.accounts.getAccountInfo({ include:'emails, profile', callback: redirectIfLogged });
}

function showOrHighlightLoginScreen() {

    // Look if the screenset was already shown
    const loginScreenset = query('#not_logged_placeholder .gigya-login-form');

    // If yes, highlight the first field once (UX improvement)
    if (loginScreenset !== null) {
        console.log('highlignthing only...');
        const input = loginScreenset.querySelector('input[name="username"]');
        input.focus(); // sets focus to element

    } else {
        // Showing login screen
        loginWithRaaS('not_logged_placeholder');
        // Continue as usual
        console.log('show login screen');
    }
}

// -- 2. UI
/**
 * Set all UI conponents using the configuration object and the state of the user
 * @param {object} config Configuration object
 */
function setUI(config) {
    console.log('Setting UI...');
    //    const config = window.config;

    // Adding Nabvar
    var link = document.querySelector('link[rel="import"]');
    // Clone the <template> in the import.
    var template = link.import.querySelector('template');
    var clone = document.importNode(template.content, true);
    document.querySelector('#main-navbar .container').appendChild(clone);

    /* CHANGE SITE LOGO / MENU LOGO */
    var srcMainPic = 'img/logos/' + config.main_pic;
    var srcMenuPic = 'img/logos/' + config.menu_pic;
    const srcMainPicElement = query('.main-pic');
    srcMainPicElement.setAttribute('src', srcMainPic);
    const srcMenuPicElement = query('.menu-pic');
    srcMenuPicElement.setAttribute('src', srcMenuPic);

    /* CHANGE TITLE AND DESCRIPTION */
    const siteTitles = queryAll('.site-title');
    const siteDescriptions = queryAll('.site-description');
    const menuDescription = query('.menu-description');
    const apiKeyButton = query('.button-apikey');
    const apiKeySpan = query('.span-apikey');
    const datacenterButton = query('.button-datacenter');
    const datacenterSpan = query('.span-datacenter');

    for (const siteTitle of siteTitles) {
        siteTitle.innerText = siteTitle.innerText.replaceAll('{{Title}}', config.site_title);
    }
    for (const siteDescription of siteDescriptions) {
        siteDescription.innerText = siteDescription.innerText.replaceAll('{{Description}}', config.site_description);
    }
    menuDescription.innerText = config.menu_description;

    apiKeyButton.setAttribute('aria-label', 'ApiKey: ' + getApiKeyFromSite());
    apiKeySpan.innerText = getApiKeyFromSite().substring(0, 6) + '...';
    datacenterButton.setAttribute('aria-label', 'Datacenter: ' + getDatacenterFromSite());
    datacenterSpan.innerText = getDatacenterFromSite();

    /* CHANGE PAGE PROPERTIES */
    document.title = config.site_title;
    query('link[rel*="icon"]').href = config.menu_pic;


    /* SET MAIN LINK */
    query('.navbar-item').href = config.main_url;

    /* SET CORRECT FLAG IN FUNCTION OF LANGUAGE */


    // Set language name from language code
    const lang = config.lang.replaceAll('-inf', '');
    if (Intl.DisplayNames) {
        languageNames = new Intl.DisplayNames([ lang ], { type: 'language' });
        langName = capitalize(languageNames.of(lang));
    } else {
        langName = lang.toUpperCase();
    }

    fetch('./config/languages.json')
        .then((res) => { return res.json(); })
        .then((out) => {

            // Start demo page
            console.log(out);
            // debugger;
            queryAll('.language-dropdown .dropdown-content').forEach((flagsContainer, i) => {
                for (var j = 0; j < out.languages.length; j++) {
                    const oneLanguage = out.languages[j];
                    const html = createEntryFor(oneLanguage);
                    flagsContainer.appendChild(html);
                }
            });


            // Tooltip
            queryAll('.flag-container').forEach((item, i) => {
                item.setAttribute('aria-label', langName);
            });

            // Selected Flag
            const langSelectedFlag = getFlagIconFor(out.languages, config.lang);
            queryAll('.flag-container >a>.flag-icon').forEach((item) => {
                // Fix english flag.
                item.classList.add('flag-icon-' + langSelectedFlag);
            });

        }).catch((err) => { return console.error(err); });


    /* SET BACKGROUND & BACKGROUND LINK COLOR HOVER FOR NAVBAR */
    var css = '';
    css = `.navbar .navbar-brand .navbar-item:not(.is-icon):hover, .navbar .navbar-menu .navbar-item:not(.is-icon):hover {background: ${config.menu_bg_color_hover} !important; height:auto;}`;
    css += `.navbar .navbar-brand, .navbar .navbar-menu {background: ${config.menu_bg_color} !important;}`;
    css += `.navbar .navbar-brand .menu-description {color: ${config.menu_text_color} !important;}`;
    css += `.mobile-navbar .navbar-burger span {background-color: ${config.menu_text_color} !important;}`;
    css += `.navbar .icon-link ion-icon, .navbar .span-datacenter,  .navbar .span-apikey,  .navbar .span-providers, .navbar .button-datacenter ion-icon, .navbar .button-apikey ion-icon, .navbar .is-separator {color: ${config.menu_text_color} !important;}`;

    /* SET BACKGROUND & FONT COLORS FOR WEBSITE */
    css += `body {background: ${config.background_color} !important;}`;
    css += `body .title, body .subtitle {color: ${config.text_color} !important;}`;

    var style = document.createElement('style');

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName('head')[0].appendChild(style);


}

function getFlagIconFor(languages, language) {
    for (var i = 0; i < languages.length; i++) {
        const oneLanguage = languages[i];
        if(oneLanguage.key === language){
            return oneLanguage.flag;
        }
    }
    return '';
}
function changeLanguage(language) {

    // set the language in local storage
    localStorage.setItem('language', language);

    // Refresh the page
    location.href = location.href;
}

function getLanguage() {
    // get the language from local storage
    return localStorage.getItem('language');
}

function createEntryFor(language) {

    // Add a
    var aObj = document.createElement('a');

    // Add span
    var spanObj = document.createElement('span');

    // Set attribute for img, such as id
    spanObj.setAttribute('class', 'flag-icon flag-icon-' + language.flag);
    spanObj.innerText = language.label;

    // Create element and return
    aObj.onclick = function() { changeLanguage(language.key); };
    aObj.setAttribute('class', 'dropdown-item');
    aObj.href = '#';
    aObj.appendChild(spanObj);
    return aObj;
}

function toggleLanguageDropDown() {
    queryAll('.language-dropdown').forEach((langDropdown, i) => {
        const isActive = langDropdown.classList.contains('is-active');
        // debugger;
        if (isActive) {
            langDropdown.classList.remove('is-active');
        } else {
            langDropdown.classList.add('is-active');
        }
    });
}

/**
 * [showErrorLogo description]
 * @param  {object} element element from DOM
 */
function showErrorLogo(element) {
    element.onerror = null;
    element.src = 'img/skeleton/logo-error.png';
}

function showSampleAlert() {

    // Toggle Class
    console.log('Sample Content');
    const sampleContentElement = query('.sample-content-modal');
    sampleContentElement.classList.add('is-active');

    // Add Event Handler to close the popup
    sampleContentElement.addEventListener('click', function() {
        // console.log('obj');
        this.classList.remove('is-active');
    });
}
function showLanguageAlert() {
    alert('Show the language of the screensets: [' + window.config.lang.toUpperCase() + ']');
}

function toggleBurgerMenu() {
    // debugger;
    var navbarMenu = query('.navbar-menu');
    if (navbarMenu.classList.contains('is-opened')) {
        navbarMenu.classList.remove('is-opened');
    } else {
        navbarMenu.classList.add('is-opened');
    }
}
// -- 3. Utils
/**
 * Takes an ISO time and returns a string representing how long ago the date represents.
 * @param  {int} time Unix Time
 * @returns {string} prettifiedDate
 */
function prettyDate(time) {
    var date = new Date((time || '').replace(/-/g, '/').replace(/[TZ]/g, ' ')),
        diff = ((new Date()).getTime() - date.getTime()) / 1000,
        dayDiff = Math.floor(diff / 86400);
    // console.log('diff: %s', diff);

    if (isNaN(dayDiff) || dayDiff < 0 || dayDiff >= 31) { return ''; }
    const prettifiedDate = dayDiff === 0 && (diff < 60 && 'just now' || diff < 120 && '1 minute ago' || diff < 3600 && Math.floor(diff / 60) + ' minutes ago' || diff < 7200 && '1 hour ago' || diff < 86400 && Math.floor(diff / 3600) + ' hours ago') || dayDiff === 1 && 'Yesterday' || dayDiff < 7 && dayDiff + ' days ago' || dayDiff < 31 && Math.ceil(dayDiff / 7) + ' weeks ago';
    return prettifiedDate;
}

function gotoUnloggedPage() {

    // Check if we are in edit page. If yes, go to home page. If not, present login window again.
    const editPlaceholder = query('#edit_profile_placeholder');
    if (editPlaceholder) {
        gotoHome();
    } else {
        showUnloggedHTML();
        loginWithRaaS('not_logged_placeholder');
    }

}
function gotoHome() {
    window.location.href = window.config.main_url.replace('http://', 'https://');
}
function getApiKeyFromSite() {
    return gigya.thisScript.APIKey;
}
function getDatacenterFromSite() {
    return gigya.dataCenter;
}
function sanitizeSocial(provider) {
    // Label identity provi0der
    var identityProviderLabel = query('.provider-label');
    var replaceChars = { ',':', ', 'googleplus':'Google', 'saml-':'SAML' };
    var identityProviderSanitized = provider.replace(/,|googleplus|saml-/g, function(match) { return replaceChars[match]; });
    var identityProviderSanitizedAndCapitalized = capitalize(identityProviderSanitized);
    return identityProviderSanitizedAndCapitalized;
}