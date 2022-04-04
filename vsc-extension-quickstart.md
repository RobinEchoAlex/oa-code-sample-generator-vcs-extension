# Quick Start

## What's in the folder

* `package.json` - this is the manifest file in which you declare your extension and command.
* `extension.js` - this is the main file where you will provide the implementation of your command.

## Get up and running straight away

* In VS Code, Press `F5` to open a new window with your extension loaded.
* Run command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `azapi`.
* Set breakpoints in code inside `extension.js` to debug your extension.
* Find output from extension in the debug console.

## Make changes

* You can relaunch the extension from the debug toolbar after changing code in `extension.js`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

## Run tests

* Open the debug viewlet (`Ctrl+Shift+D` or `Cmd+Shift+D` on Mac) and from the launch configuration dropdown pick `Extension Tests`.
* Press `F5` to run the tests in a new window with your extension loaded.
* See the output of the test result in the debug console.
* Make changes to `src/test/suite/extension.test.js` or create new test files inside the `test/suite` folder.
  * The provided test runner will only consider files matching the name pattern `**.test.ts`.
  * You can create folders inside the `test` folder to structure your tests any way you want.
