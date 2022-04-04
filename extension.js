// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const generator = require('./OACodeSampleGenerator');
const { Map } = require('immutable');
const fs = require('fs');
var path = require("path");
var operationMap = readJson();


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ocsg" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('ocsg.azapi', function () {
		vscode.window.setStatusBarMessage('Generating Azure API Calls...',3000);

		const editor = vscode.window.activeTextEditor;
		const userInput = editor.document.getText(editor.selection);
		const operation = urlToOperationId(userInput);
		console.log(operationMap[operation][0])
		let spec = localToRemoteAddr(selectLatestVersion(operationMap[operation]))

		//  spec =
		// 'https://raw.githubusercontent.com/Azure/azure-rest-api-specs/main/specification/resources/resource-manager/Microsoft.Resources/stable/2021-04-01/resources.json';
	
		// Optionally pass in a single operation ID as a fourth command line argument -> node generateExamples spec operationId
		// This will get snippets/models for just that one operation
		const singleOperation =  'ResourceGroups_CreateOrUpdate';
		// 'Deployments_CreateOrUpdateAtScope' is a better one to test the body/model generators with

		console.log(spec)
		console.log(operation)
		getGen(spec,operation).then((result)=>{
			insertText(result)
		} )

		// The code you place here will be executed every time your command is executed
		

	});

	context.subscriptions.push(disposable);
}


function insertText(result){
		const editor = vscode.window.activeTextEditor;

		if(editor==undefined) {
			vscode.window.showErrorMessage("Please move anchor to insertion point")
			return;
		}

		let snippet
		let currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
		let currentlyOpenTabExtName = path.extname(currentlyOpenTabfilePath);
		if(fileExtensionMap.has(currentlyOpenTabExtName)){
			let snippetId = fileExtensionMap.get(currentlyOpenTabExtName)
			snippet = result[0][snippetId]
		}else{
			vscode.window.showErrorMessage("This language is not supported")
			return
		}

		if(modelMap.has(currentlyOpenTabExtName)){
			let snippetId = modelMap.get(currentlyOpenTabExtName)
			model = result[0][snippetId]
		}else{
			vscode.window.showErrorMessage("This language is not supported")
			return
		}

		vscode.env.clipboard.writeText(model);

		console.log(result[0])

		editor.edit((active) => {
			const pos = editor.selection.anchor;
			active.insert(pos, snippet);
		});	
}

async function getGen(spec,singleOperation){
	const { api, generated } =  await generator(spec, singleOperation);
	console.log(generated);
	return api,generated
}

String.prototype.replaceAt = function(index, replacement) {
    if (index >= this.length) {
        return this.valueOf();
    }
 
    return this.substring(0, index) + replacement + this.substring(index + 1);
}
 

function selectLatestVersion(apiList){
	let max = 0; 
	let maxIndex = -1;
	for (i=0;i<apiList.length;i++){
		str = apiList[i].replace(/\D/g,'');
		if (parseInt(str)>max){
			max = parseInt(str)
			maxIndex = i
		}
	}
	return apiList[maxIndex]
}

function urlToOperationId(url){
	index = url.lastIndexOf('/', url.lastIndexOf('/') - 1);
	slice = url.slice(index+1)

	let urlChars = [...slice];
	urlChars[0] = urlChars[0].toUpperCase()
	for(let i=0;i<urlChars.length;i++){
		if(urlChars[i]=="/" || urlChars[i]=="-"){
			urlChars[i+1]=urlChars[i+1].toUpperCase();
		}
	}
	slice = urlChars.join("");

	slice = slice.replace(/\//g,"_")
	slice = slice.replaceAll("-","")
	return slice
}

function readJson(){
	let rawData = fs.readFileSync(path.resolve(__dirname, "operationAddress.json"))
	return JSON.parse(rawData)
}

function localToRemoteAddr(addr){
	addr = "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/main"
			+ addr.slice(addr.indexOf("\\specification"))

	addr = addr.replaceAll("\\","/")
	return addr;
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

const fileExtensionMap = Map({".java":"javaSnippet",".php":"phpSnippet",".py":"pythonSnippet",".cs":"csharpSnippet"});
const modelMap = Map({".java":"javaModel",".php":"phpModel",".py":"pythonModel",".cs":"csharpModel"});