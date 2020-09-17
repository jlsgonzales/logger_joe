// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LogLevelDecorator } from './decorators/LogLevelDecorator';
import { ExtensionManager } from './managers/ExtensionManager';
import { FileParserCommand } from './commands/FileParserCommand';
import { HighlightCommand } from './commands/HighlightCommand';
import { HighlightDecorator } from './decorators/HighlightDecorator';
import { RememberLineCommand } from './commands/RememberLineCommand';
import { RememberLineDecorator } from './decorators/RememberLineDecorator';
import { GrepCommand } from './commands/GrepCommand';
import { CommandManager } from './managers/CommandManager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{
    console.log('Congratulations, your extension "logger-joe" is now active!');

    let extension = new ExtensionManager();
    let loglevelDecorator = new LogLevelDecorator(extension);
    let highlightdecorator = new HighlightDecorator(extension);
    let rememberLineDecorator = new RememberLineDecorator(extension);

    extension.registerListeners(context);

    const comamndManager = new CommandManager(
    [
        // active commands
        new FileParserCommand(extension),
        new HighlightCommand(extension, highlightdecorator),
        new GrepCommand(extension, rememberLineDecorator),
        new RememberLineCommand(extension, rememberLineDecorator),
    ]);
    comamndManager.registerCommands(context);
}

// this method is called when your extension is deactivated
export function deactivate() {}




