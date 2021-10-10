// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext } from 'vscode';
import { App } from './app';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext)
{
    console.log('Congratulations, your extension "logger-joe" is now active!');
    const app = new App();
    app.init(context);
}

// this method is called when your extension is deactivated
export function deactivate() {}




