# ![Icon](src/icons/icon-192.png)<br>Seneca Answers

Seneca Answers is an extension for Firefox and Chrome to get the answers to SenecaLearning lessons.

![GitHub Release](https://img.shields.io/github/v/release/pepperonijail77/seneca-answers)
![GitHub Downloads](https://img.shields.io/github/downloads/pepperonijail77/seneca-answers/total)
![Mozilla Add-on Users](https://img.shields.io/amo/users/seneca-answers)
![GitHub commits since latest release](https://img.shields.io/github/commits-since/pepperonijail77/seneca-answers/latest/dev)

![Screenshot](screenshots/screenshot-480.png)

## Instalation

[![Get the Add-on](https://extensionworkshop.com/assets/img/documentation/publish/get-the-addon-178x60px.dad84b42.png)](https://addons.mozilla.org/firefox/addon/seneca-answers/)
[<img src="https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/add-ons-badge-images/microsoft-edge-add-ons-badge.png" alt="Get it from Microsoft Edge" height="60">](https://microsoftedge.microsoft.com/addons/detail/seneca-answers/bokkhhblppjnkonkllaccbneanfenncg)

### Manual installation

<details>
<summary>Firefox</summary>

Download `seneca-answers_X.X.X-firefox.xpi` from the latest [release](https://github.com/pepperonijail77/seneca-answers/releases/latest) - you will have to right-click and select `Save Link As...`, otherwise Firefox will try to install it.

Go to `about:debugging#/runtime/this-firefox`, and press `Load Temporary Add-on...`, then select the `seneca-answers_X.X.X-firefox.xpi` file that you downloaded.

</details>
<details>
<summary>Chrome</summary>

Download `seneca-answers_X.X.X-chrome.zip` from the latest [release](https://github.com/pepperonijail77/seneca-answers/releases/latest) - you will have to right-click and select `Save link as...`, otherwise Chrome will try to install it. Extract its contents into a folder somewhere.

On Chrome, go to `chrome://extensions`, and enable developer mode if you haven't already.

Press `Load unpacked`, then navigate to and select the folder that you extracted into.

</details>
<details>
<summary>Other chromium</summary>

> Note that it is only tested on Firefox, Helium, and Chromium. There is no guarantee that it will work on other browsers.

Download `seneca-answers_X.X.X-chrome.zip` from the latest [release](https://github.com/pepperonijail77/seneca-answers/releases/latest).

Go to `chrome://extensions`, and enable developer mode if you haven't already.

Drag and drop `seneca-answers_X.X.X-chrome.zip` that you downloaded onto the page, and press `Add Extension`.

</details>

## Usage

Go to any lesson on [Seneca](https://app.senecalearning.com/), and you will see an overlay on the right. Press `Complete` and reload the page to automatically complete the section in one click, or manually input the answers from the overlay and press `Refresh` to re-fetch the answers.

## Build

<details>
<summary>Prerequisites</summary>

- [git](https://git-scm.com/)
- [node.js](https://nodejs.org/)

Clone the repo.

```sh
git clone https://github.com/pepperonijail77/seneca-answers.git
```

or

```sh
gh repo clone pepperonijail77/seneca-answers
```

In the root directory install all the npm dependencies.

```sh
npm install
```

</details>
<br>

In the root directory run build.js with npm.

Firefox:

```sh
npm run build:firefox
```

Chromium:

```sh
npm run build:chrome
```

Both:

```sh
npm run build
```

The built files will be in `/dist`.

## License

This product is licensed under the [GNU GPL v3](https://choosealicense.com/licenses/gpl-3.0) License.
