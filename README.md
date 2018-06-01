## Aniwhere

Find anything aniwhere.

![Screenshot](https://user-images.githubusercontent.com/5101076/40774142-657b8bfc-64f7-11e8-9c5e-edd828a6fe71.png)

[Download the latest version here](https://github.com/CyanSalt/aniwhere/releases/latest)

### Search anything if you want

* Just type full name or even several letters of your program or document.
* Search results will be shown immediately below the input, press `↑` and `↓` to change focus between options.
* Search-engine hyperlinks, Math expression outcome, etc. will be shown as well.
* Press `Enter` or click to **select** the result. It will have different performance if you do with `ctrl` key.

### Adapt to your own PC

* Copy the file `resources/default/settings.json` to `storage` (create this folder if not exist).
* Change source folders or programs and documents. Use environment variables or user directories if you want (`"aniwhere"`, `"home"`, `"appData"`, `"desktop"` and so on).
* Set extension names of those files you want to search. Use `"/"` or `".*"` if needed.
* Enable internal high performance mode with `"presets.highPerformance"` configure. Set it to `"speed"` or `"memory"` to reduce several particular processes.

### HACK IT!

* The messages in this app is written in English, and will be shown as the language set in your system by default. however, you can use its internal translations or translate it yourself.
  * Create file `translation.json` in the `storage` directory.
  * Type your configure like `{"@use": "en-US"}`, or customize the translation file yourself (See [All translatable texts](https://github.com/CyanSalt/todu/blob/master/src/resources/default/translation.json)).

* This app is built with [Electron](https://electronjs.org/) and [VueJS](https://vuejs.org/index.html). If you are familiar with eithor of those, you can add `custom.js` to write your own code whenever the app launched. See the demo at `resources/default/custom.js`

* As well as script, you can also add `custom.css` to write your stylesheets.

* For getting the document layout of the app's page, you can press `Control/Cmd+Shift+I` to open the devtools panel, just like you do it in Chrome.

### License

MIT
