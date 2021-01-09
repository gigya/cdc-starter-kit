# Basic Usage

In this guide, we will explain how to configure this demo website to support the basic features that Gigya offers using the web SDK and the Screensets, and with some configuration in the console.

## 1. Project Overview

This project is a Simple Page Application (except for the edit-profile page, only for logged users) where the user will be in two different states: __logged__ or __not logged__, and the content rendered will be selected in function of these.

| Not Logged | Logged |
|-|-|
|![Not Logged](img/basic/0-not-logged.png)|![Logged](img/basic/1-logged-with-language.png)



The navigation bar will reflect the user's current status (if it is logged or not), showing different elements for each case.

All Gigya related links are fully functional, allowing us to register, login, edit the profile, and in general, interact with Gigya WebSDK. When logged in, a list of the user's identity providers is shown in the navigation bar.

![Bar Example](img/basic/1-logged-short-bar.png)


## 2. Configuration of the project (config.json)

The title, logo, and descriptions for the website are set, modifying the ```config/config.json``` and refreshing the page.

You can also customize some basic aspects of your website's look and feel, like the background, the colors of the links, text colors, and background for the navigation bar.

Note that some properties, like _raas_prefix_, or _lang_, need to be correctly set to have the website properly working. Included properties are:


| Name | Description |
|-|-|
|```site_title```|Site Title (For the main page)
|```site_description```|Site Title (For the main page)
|```menu_description```|Description for the top menu in the navbar
|```menu_bg_color```|Background color for the navbar
|```menu_bg_color_hover```|Background color for the links in the navbar when hovered
|```menu_text_color```|Color for the text of the items in the navbar
|```text_color```|Color for the main text in the site
|```background_color```|Background color of the site
|```menu_pic```|Menu picture for the site (in the navbar)
|```main_url```|Main url of the site (for redirections and proper linking)
|```main_pic```|Main picture for the site
|```raas_prefix```|Gigya Prefix for the screensets
|```lang```|Default Language


Here you can find an example of this file:

```json
{
    "menu_description": "CDC Starter Kit",
    "site_title": "SAP Customer Data Cloud Starter Kit",
    "site_description": "Sample Site with basic Customer Data Cloud capabilities",
    "menu_bg_color": "white",
    "menu_bg_color_hover": "#1d87ff2a",
    "menu_text_color": "#999",
    "text_color": "#7a7a7a",
    "background_color": "#f4f4f4",
    "menu_pic": "sap.png",
    "main_url": "https://juan.gigya-cs.com/cdc-starter-kit/",
    "main_pic": "sap.png",
    "raas_prefix": "Default",
    "lang": "en"
}
```
> If your screensets are called like Default-RegistrationLogin or Default-UpdateProfile, then the file is valid to be used without any modifications.


## 3. Project Structure

This section will show the project file structure with a brief explanation of the main folders and files. Below, the files in a tree view:

```
├── config
│   ├── config.json
│   └── languages.json
|
├── css
│   ├── demo.css
│   └── lib
│       ├── bulma-social.min.css
│       └── core.min.css
|
├── docs
│   ├── advanced.md
│   ├── basic.md
│   ├── img/
│   ├── install.md
│   └── links.md
|
├── html
│   ├── consents
│   │   ├── deletion.html
│   │   ├── privacy.html
│   │   └── tos.html
│   ├── facebook
│   │   └── channelURL.html
│   ├── sample_content
│   │   └── ecommerce.html
│   └── skeleton
│       └── navbar.html
|
├── img/*
|
├── js
│   ├── engine.js
│   ├── gigya-raas.js
│   └── main.js
|
├── less
│   ├── demo.less
│   └── src
│       ├── framework.less
│       └── lib
│           ├── classes.less
│           ├── gigya.less
│           ├── layout.less
│           └── variables.less
|
├── CONTRIBUTING.md
├── LICENSE.txt
├── NOTICE.txt
├── README.md
├── index.html
└── edit-profile.html

```


1. __config__: Folder for the configuration files. You can configure the site behavior and sources, as well as the languages in the dropdown.
2. __css__: The generated css files used in the project.
3. __docs__: This set of docs.
4. __html__: Main HTML content of the site. The navigation bar and logged sample content it's stored here.
5. __img__: It contains all the images for the project.
6. __js__: It contains the files with the logic of the site. It has a specific file for Gigya functions, another one to make the site demo work, and a last one (main.js), that will start all the process.
7. __less__: css files are automatically generated using these less files as source. Using a proper plugin, any modification over these files will generate a new css set of files in the /css folder.
8. __index.html__: This is the main page of the site. It contains all the elements needed to manage both logged and not logged states for the user.
9. __edit-profile.html__: The edit profile page. This page will be shown only for logged in users, being redirected to the index.html page when the user's session is not present.
10. __Other files__: The rest of the files are or README files, or editor configuration files, like the .eslintrc.js. Git files are also there, and they can all be removed, and the project will work as expected.


## 4. How it works

This project is a simple HTML + JS + CSS project, although it has some libraries that empower/enhance the standard web capabilities. In this section we detail all of them.

### 4.1. Styles
Although it uses css at the end, the project styles are built using [less](https://lesscss.org), which generates a file ```demo.css```, which is the one used in the main web pages of the app: ```ìndex.html``` and ```èdit-profile.html```.


### 4.2. JavaScript
The project uses vanilla javascript  for all their interactions, although it uses [handlebars](https://handlebars.org) as template engine to simplify the pages and make them more meaningful. There are three main files that manage all the website:

1. **gigya-raas.js**: This file contains all typical gigya functions in a RaaS process. You will find here the triggers for the login, the registration, or the reset password process. __This is the file you want to copy in your project to have a set of default gigya functions__.

1. **engine.js**: This file contains all the logic needed to make the site work. All these core functions, like managing the sessions, repainting the screen, dealing with dates, etc., are included in this file.

1. **main.js**: his file contains the main Gigya trigger ```onGigyaServiceReady```. When present, this function is triggered automatically once Gigya it's fully loaded (in ```index.html```). This is the content of the file:

```javascript
function onGigyaServiceReady() {

    /* Check if the user was previously logged in */
    if (typeof gigya === 'undefined') {
        alert('Gigya is not loaded on this page :(');
    } else {

        /* Load Configuration from setup/config.json */
        loadConfigurationFromFile();
    }
}

````

The```loadConfigurationFromFile``` function (inside ```js/engine.js```), reads the configuration file placed into (```config/config.json```) and take the values to initialize the site.

> **DISCLAIMER**: This framework doesn't pretend to be a good example / good practice for a real website. The objective here is to learn how Gigya works. Therefore aspects like security, UX, speed, responsivity, etc., are far from ideal.
>
> Please, use your own web technology when integrating Gigya, and think of this as a simplification of a real use case._

### 4.3. HTML



## 5. What else.

Although the site it's fully functional, there is still much more content to cover. If you want to know how to enhance/ extend the capabilities of this site, with elements like Captcha, Events, Registration Completion, Extensions, to understand how to integrate consents, etc., take a look at the Links Page, where you will find how to implement many of these improvements.
