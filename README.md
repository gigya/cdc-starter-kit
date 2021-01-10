[![Demo Site](docs/img/readme/0-gigya-starter-kit-v5.png)](https://juan.gigya-cs.com/cdc-starter-kit/)

# **SAP Customer Data Cloud Starter Kit**
#### **{**HTML + CSS + JS**}**


SAP Customer Data Cloud (SAP CDC) Starter Kit is a simple front-end template for building
fast, robust, and adaptable web apps or sites, including SAP CDC capabilities.

The project includes a demo website with the most common user flows, like registration, login, profile update, reset password, etc. All these flows are offered OOTB using SAP CDC [Screensets](https://developers.gigya.com/display/GD/Screen-Sets), and only using **HTML**, **CSS** and **JS**.

* Homepage: [https://github.com/gigya/cdc-starter-kit](https://github.com/gigya/cdc-starter-kit)
* Source: [https://github.com/gigya/cdc-starter-kit](https://github.com/gigya/cdc-starter-kit)

## Quick start

Follow the [Installation Guide](docs/install.md) to have this demo running in less than 10 minutes.

Can't wait? Check out our [demo site](https://juan.gigya-cs.com/cdc-starter-kit/)!

 <!-- [![Demo Site](docs/img/basic/0-not-logged-with-language.png)](https://juan.gigya-cs.com/cdc-starter-kit/) -->


 [![Demo Site](docs/img/basic/0-not-logged-with-language.png)](https://juan.gigya-cs.com/cdc-starter-kit/)


## Included Flows

The included flows in the demo are:

| Flow | Description |
|-|-|
| Registration | A [Full Registration](https://developers.gigya.com/display/GD/Screen-Sets#Screen-Sets-RegistrationFlows) user flow, which creates a user in Gigya.|
| Login | [Login](https://developers.gigya.com/display/GD/Screen-Sets#Screen-Sets-RegistrationFlows) capabilities for created users in Gigya. |
| Update Profile | Once logged, you have the screens used when [updating](https://developers.gigya.com/display/GD/Default+Screen-sets#DefaultScreen-sets-DefaultScreen-Sets) a user profile. |
| Email / Code Verification | Performs email / code verification inside the registration flow. To be [enabled](https://developers.gigya.com/display/GD/Policies#Policies-email_verificationEmailVerification) in Gigya console. |
| Reset Password | Link to get a [Reset Password](https://developers.gigya.com/display/GD/Email+Templates#EmailTemplates-PasswordReset) email whenever a user chooses to reset their password. The link is valid for 1 hour by default.|
| Change Password | Once logged in, link to [change](https://developers.gigya.com/display/GD/Policies#Policies-PasswordChange) the current user password. |
| Consent | Test Gigya [Consent](https://developers.gigya.com/display/GD/Consent+Management) features with very few steps and checks them inside the console. |
| Subscriptions / Lite Registrations | No password involved. Used typically for subscriptions, and any flow where only an email address is required, such as competition sign-ups, unlocking restricted content, voting, etc. For more information, see [Lite Registration](). |
| Passwordless login. (Phone Login) | Users can log in or register using their mobile phones. A temporary code (one-time password, or OTP) is sent to their phones and used to authenticate them. For more information, see [Phone Number Login](https://developers.gigya.com/display/GD/Phone+Number+Login). |
| Social Login | Login with Facebook, Google, Apple, Twitter, LinkedIn, etc..., and create a Gigya account with the data obtained from that [Social Provider](https://developers.gigya.com/display/GD/Social+Login). |
| Link Accounts | With social accounts, enable [Linking](https://developers.gigya.com/display/GD/Linking+Social+Accounts) feature to merge them into a single one, associated with two identities, rather than maintaining two separate accounts. |


#### Features

Global features (Cross-flow capabilities):

<!---
| Registration Completion |  |
| TFA | |
| Concatenate Screensets | Split your form into several to improve the user experience. See [doc](). |
-->

| Feature | Description |
|-|-|
| i18n | Set the [language]() of your screensets. |
| Captcha | Add [CAPTCHA]() to your screensets to protect them against automated scripts. |
| Events | Execute actions after a successful login, after screen is loaded, or before submitting elements. Full list of available events [here](https://developers.gigya.com/display/GD/accounts.showScreenSet+JS#accounts.showScreenSetJS-Events). |
| Extensions | Add [Extensions]() to control or enrich your flows serverside. |

## Requirements

1. Gigya Console access with Create Site capabilities.

1. Web server. (Apache, ngix, ...)

## Documentation

Take a look at the [Basic Guide](docs/basic.md) to understand how to configure and customize your project. If you want to go deeper and understand the implementation basics, please go to the [Advanced Guide](docs/advanced.md), where you will find these and many other details.

This documentation is bundled with the project, making it available for offline reading and provides a useful starting point for any documentation you want to write about your project.

All relevant code (html, js, and css/less) is commented internally, so it can help developers understand how it was done and make it easier to integrate with other projects.

## Additional Gigya Links

Please follow this [link](docs/links.md) to find more related SAP CDC documentation about the configuration/enhancement of this site.

## Browser support

* Chrome *(latest 2)*
* Edge *(latest 2)*
* Firefox *(latest 2)*
* Internet Explorer 11
* Opera *(latest 2)*
* Safari *(latest 2)*

*This doesn't mean that Gigya Starter Kit cannot be used in older browsers,
just that we'll ensure compatibility with the ones mentioned above.*

## Troubleshooting

If you find yourself running into issues during installation or running the web application, please send an email to any contributors. We would be happy to discuss how they can be solved.


## License

This project is licensed under the [MIT License](http://www.apache.org/licenses/LICENSE-2.0), Copyright (c) 2021 SAP-CDC. For more information, see `LICENSE.md`.
