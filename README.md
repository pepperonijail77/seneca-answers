# Seneca Answers

Web extension to get the answers to SenecaLearning lessons.

## Instalation

<details>
<summary>Firefox</summary>

Get `seneca-answers.xpi` from the latest [release](https://github.com/pepperonijail77/seneca-answers/releases/latest). You will have to right-click and select `Save Link As...`, otherwise Firefox will try to install it.

Go to `about:debugging#/runtime/this-firefox`, and press `Load Temporary Add-on...`, then select the `seneca-answers.xpi` file that you downloaded.

</details>
<details>
<summary>Chrome</summary>

Get `seneca-answers.crx` from the latest [release](https://github.com/pepperonijail77/seneca-answers/releases/latest).

Go to `chrome://extensions`, and make sure Developer mode is enabled.

Drag and drop `seneca-answers.crx` that you downloaded onto the page, and press `Add Extension`.

</details>

## Usage

Simply go onto a lesson on [Seneca](https://app.senecalearning.com/), and you will see a pop-up on the right. Press `Get Answers` to get answers, and `X` to hide the pop-up.

## Build

<details>
<summary>Prerequisites</summary>

- [git](https://git-scm.com/)
- [node.js](https://nodejs.org/)

Clone the repo.
```sh
git clone https://github.com/pepperonijail77/seneca-answers.git
```

In the root directory install all the npm dependencies.
```sh
npm install
```

</details>

In the root directory run build.js with node.js.

Firefox:
```sh
node build.js firefox
```

Chrome:
```sh
node build.js chrome
```

Both:
```sh
node build.js
```

The built files will be in `/dist`.

## Acknowledgments

* [Ella](https://github.com/ellsies) - I don't know who this is, but they made the [seneca.ellsies.tech](https://seneca.ellsies.tech/api) API, which this relies on.

## License
This product is licensed under the [GNU GPL v3](https://choosealicense.com/licenses/gpl-3.0) License.