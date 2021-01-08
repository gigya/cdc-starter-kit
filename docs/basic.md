# Basic Usage

In this guide we will explain how to configure this demo website to support the basic features that Gigya offers using the webSdk and the Screensets + Configuration in the console.

## 1. Project Overview

This project is a Simple Page Application (except for the edit-profile.page, only for logged users) where the user will be in two different states: __logged__ or __not logged__, and the content rendered will be selected in function of these.

| Not Logged | Logged |
|-|-|
|![Not Logged](img/basic/0-not-logged.png)|![Logged](img/basic/1-logged-with-language.png)



The navigation bar will reflect the current status of the user (if is logged or not), showing different elements for each case.

All gigya related links are fully functional, allowing us to register, login, edit the profile, and in general, interact with Gigya WebSDK. When logged in, a list of the Identity Providers of the user it's shown in the navigation bar.

![Bar Example](img/basic/1-logged-short-bar.png)


## 2. Configuration of the project (config.json)

The title, logo, and descriptions for the website can be easily set modifying the ```config/config.json``` and refreshing the page.

You can customize as well some basic aspects of the look and feel for your website, like the background, the colors of the links, or the colors and background for the navigation bar.

Note that there are some properties lke _raas_prefix_, or _lang_, that they need to be correctly set in order to have the site properly working. The include properties are:

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

```
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
If your screensets in the console are like "Default-RegistrationLogin" or "Default-UpdateProfile", then this file will work for the project without any modifications.


## 3. Project Structure

In this section we will show the project file structure with a brief explanation of the main folders and files.

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
2. __css__: The generated css files to be used in the project.
3. __docs__: This set of docs.
4. __html__: Main HTML content of the site. Navigation bar and logged sample content it's stored here.
5. __img__: It contains all the images for the project.
6. __js__: It contains the files with the logic of the site. It has a specific file for Gigya functions, another one to make the site demo work, and a last one (main.js), that will start all the process.
7. __less__: css files are automatically generated using this less files as source. Using a proper plugin, any modification over these files will generate a new css set of files in the /css folder.
8. __index.html__: This is the main page of the site. It contains all the elements needed to manage both logged and not logged states for the user.
9. __edit-profile.html__: The edit profile page. This page will be shown only for logged in users, being redirected to the index.html page when the session of the user is not present.
10. __Other files__: The rest of the files are or README files, or editor configuration files, like the .eslintrc.js. Git files are also there, and they can all be removed and the project will work as expected.


## 4. What else.

If you want to know how to enhace/ extend the capabilities of this site, with elements like Captcha, Events, Extensions, etc, read the [Advanced Guide](advanced.md).
