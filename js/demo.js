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
//              MAIN FRAMEWORK FUNCTION
/** *****************************************************/
window.addEventListener('load', (event) => {

    console.log('DOM fully loaded and parsed');

    /* Load Configuration */
    loadConfigurationFromFile();
});

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

    query('.message.logged').classList.remove('hidden');

    /* Showing user info into HTML */
    query('.message.not-logged').classList.add('hidden');
    // query('.message.logged').classList.remove('hidden');

    // Text for message
    var html = '<strong>Welcome </strong> ' + username + ',<strong> email: </strong>' + email + '<hr/>';
    html += '<strong>UID: </strong>' + uid + ', <strong>SP: </strong>' + provider;
    query('.message.logged .message-body').innerHTML = html;

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
    const profileUserImage = user.profile.photoURL;
    if (profileUserImage !== '') {
        const imageTag = query('.user-image img');
        const iconTag = query('.user-image ion-icon');
        imageTag.classList.remove('hidden');
        iconTag.classList.add('hidden');
        imageTag.setAttribute('src', profileUserImage);
    }
}

/**
 * Hides the logged info for the user and shows the non-logged section
 *
 * @param  {object} user User info object
 */
function showUnloggedHTML() {

    /* Hide Registration Screenset */
    hideScreenset('edit_profile_placeholder');

    /* Showing 'not logged' elements */
    query('.message.not-logged').classList.remove('hidden');
    query('.message.logged').classList.add('hidden');

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


function displayTemplate(tmpl, data) {
    console.log('display %o with data %o', tmpl, data);
    if (templates[tmpl] !== undefined) {
        var template = templates[tmpl];
        var html = template(data);
        query('.sample_content').innerHTML(html);
    }
}

function loadSampleContent(user) {

    //
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
            query('.sample_content').innerHTML = compiled;

        }).catch((err) => { return console.error(err); });
}

/**
 * Check Gigya session Functions
 *
 * @param  {object} user User info object
 */
function redirectIfLogged(user) {

    /* If not logged, show registration form */
    if (!user.UID) {
        sessionStatus = 'loggedIn';
        console.log('You are not logged in.');

        showUnloggedHTML();
        // loginWithRaaS('not_logged_placeholder');
        registerWithRaaS('not_logged_placeholder');

    } else {
        sessionStatus = 'loggedOut';

        /* If logged, show user HTML */
        showLoggedHTML(user);
        loadSampleContent(user);
    }
}

/**
 * Loads the configuration file into the window object to be used later on to customize the UI
 */
function loadConfigurationFromFile() {
    fetch('./config/config.json')
        .then((res) => { return res.json(); })
        .then((out) => {
            console.log('Config file: ');
            console.table(out);
            // debugger;
            window.config = out;
            setUI(window.config);

        }).catch((err) => { return console.error(err); });
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

    /* CHANGE SITE LOGO / MENU LOGO */
    var srcMenuPic = 'img/logos/' + window.config.menu_pic;
    const srcMenuPicElements = queryAll('.site-logo');
    for (const srcMenuPicElement of srcMenuPicElements) {
        srcMenuPicElement.setAttribute('src', srcMenuPic);
    }

    /* CHANGE TITLE AND DESCRIPTION */
    const siteTitles = queryAll('.site-title');
    const siteDescriptions = queryAll('.site-description');
    for (const siteTitle of siteTitles) {
        siteTitle.innerText = siteTitle.innerText.replaceAll('{{Title}}', window.config.site_title);
    }
    for (const siteDescription of siteDescriptions) {
        siteDescription.innerText = siteDescription.innerText.replaceAll('{{Description}}', window.config.site_description);
    }

    /* CHANGE PAGE PROPERTIES */
    document.title = window.config.site_title;
    query('link[rel*="icon"]').href = window.config.menu_pic;
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
