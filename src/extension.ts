// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LogLevelDecorator } from './decorators/LogLevelDecorator';
import { ExtensionManager } from './ExtensionManager';
import { FileParserCommand } from './commands/FileParserCommand';
import { HighlightCommand } from './commands/HighlightCommand';
import { HighlightDecorator } from './decorators/HighlightDecorator';
import { RememberLineCommand } from './commands/RememberLineCommand';
import { RememberLineDecorator } from './decorators/RememberLineDecorator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{
    console.log('Congratulations, your extension "logger-joe" is now active!');

    let extension = new ExtensionManager();
    let loglevelDecorator = new LogLevelDecorator(extension);
    let highlightdecorator = new HighlightDecorator(extension);
    let rememberLinedecorator = new RememberLineDecorator(extension);

    // Listen to Editor Changes
    vscode.window.onDidChangeActiveTextEditor(editor =>
    {
        if (editor && extension.includes(editor?.document.fileName!))
        {
            extension.update(editor);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event =>
    {
        let activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && extension.includes(activeEditor.document.fileName))
        {
            extension.update(activeEditor);
        }
    }, null, context.subscriptions);

    // register commands
    context.subscriptions.push((new FileParserCommand(extension)).disposable);
    context.subscriptions.push((new HighlightCommand(extension, highlightdecorator)).disposable);
    const rememberLineCommand = new RememberLineCommand(extension, rememberLinedecorator);
    context.subscriptions.push(rememberLineCommand.disposableRemember);
    context.subscriptions.push(rememberLineCommand.disposableNext);
    context.subscriptions.push(rememberLineCommand.disposablePrevious);
}

// this method is called when your extension is deactivated
export function deactivate() {}




