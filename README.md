![Create Site](docs/img/readme/0-gigya-starter-kit-v5.png)

# **SAP Customer Data Cloud Starter Kit**
#### **{**HTML + CSS + JS**}**


SAP Customer Data Cloud Starter Kit is a simple front-end template for building
fast, robust, and adaptable web apps or sites including SAP Customer Data Cloud capabilities.

The project includes a demo website with the most common user flows, like registration, login, profile update, reset passord, etc. All these flows are offered OOTB using SAP Customer Data Cloud Screensets, and only using **html**, **css** and **js**.

* Homepage: [https://github.com/gigya/cdc-starter-kit](https://github.com/gigya/cdc-starter-kit)
* Source: [https://github.com/gigya/cdc-starter-kit](https://github.com/gigya/cdc-starter-kit)

## Quick start

Follow the [Installation Guide](docs/install.md) to have this demo running in less than 10 minutes.

Can't wait? Check out our demo site!

* [Demo Site](https://juan.gigya-cs.com/cdc-starter-kit/)
 ![Demo Site](docs/img/basic/0-not-logged-with-language.png)

## Included Flows

The included flows in the demo are:

| Flow | Description |
|-|-|
| Registration | A [Full Registration](https://developers.gigya.com/display/GD/Screen-Sets#Screen-Sets-RegistrationFlows) user flow, which creates a user in Gigya. Depending on the policies, screenset customizations and/or user data completion defined in the schema, a set of different options will be triggered.|
| Login | [Login](https://developers.gigya.com/display/GD/Screen-Sets#Screen-Sets-RegistrationFlows) capabilities for created users in Gigya. |
| Update Profile | Once logged, you have the screens used when [updating](https://developers.gigya.com/display/GD/Default+Screen-sets#DefaultScreen-sets-DefaultScreen-Sets) a user profile. |
| Email / Code Verification | Performs email / code verification inside the registration flow. To be [enabled](https://developers.gigya.com/display/GD/Policies#Policies-email_verificationEmailVerification) in Gigya console. |
| Reset Password | Link to get a [Reset Password](https://developers.gigya.com/display/GD/Email+Templates#EmailTemplates-PasswordReset) email whenever a user chooses to reset their password. The is valid for 1 hour by default.|
| Change Password | Once logged in, link to [change](https://developers.gigya.com/display/GD/Policies#Policies-PasswordChange) the current user password. |
| Consent | Test Gigya [Consent](https://developers.gigya.com/display/GD/Consent+Management) features with very few steps and check them inside the console. |
| Subscriptions / Lite Registrations | No password involved. Used typically for subscriptions, and any flow where only an email address is required, such as competition sign-ups, unlocking restricted content, voting etc. For more information, see [Lite Registration](). |
| Passwordless login. (Phone Login) | Users can log in or register using their mobile phones. A temporary code (one-time password, or OTP) is sent to their phones and used to authenticate them. For more information, see [Phone Number Login](https://developers.gigya.com/display/GD/Phone+Number+Login). |
| Social Login | Login with Facebook, Google, Apple, Twitter, LinkedIn, etc..., and create a Gigya account with the data obtained from that [Social Provider](https://developers.gigya.com/display/GD/Social+Login). |
| Link Accounts | With social, enable [Linking Accounts](https://developers.gigya.com/display/GD/Linking+Social+Accounts) to merge them into a single one, associated with two identities, rather than maintaining two separate accounts. |


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
| Events | Execute actions after a successful login, after screen is loaded or before submitting elements. Full list of available events [here](https://developers.gigya.com/display/GD/accounts.showScreenSet+JS#accounts.showScreenSetJS-Events). |
| Extensions | Add [Extensions]() to control or enrich your flows serverside. |

## Requirements

1. Gigya Console access with Create Site capabilities.

1. Web server. (Apache, ngix, ...)

## Documentation

Take a look at the [basic guide](docs/basic.md) to understand how enhance and improve the functionality of this project.

This documentation is bundled with the project which makes it available for offline reading and provides a useful starting point for any documentation you want to write about your project.

## Additional Gigya Links

Please follow this [link](docs/links.md) to find more related SAP Customer Data Cloud documentation about the configuration / enhacement of this site.

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

If you find yourself running into issues during installation or running the web application, please send a email to any of the contributors. We would be happy to discuss how they can be solved.


## License

This project is licensed under the [MIT License](http://www.apache.org/licenses/LICENSE-2.0), Copyright (c) 2021 SAP-CDC. For more information see `LICENSE.md`
