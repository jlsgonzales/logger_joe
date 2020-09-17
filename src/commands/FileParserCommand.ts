import * as vscode from 'vscode';
import { ExtensionManager } from "../managers/ExtensionManager";
import { ICommand } from './ICommand';

export class FileParserCommand implements ICommand
{
    private extensionManager: ExtensionManager;

    constructor(extensionManager: ExtensionManager)
    {
        this.extensionManager = extensionManager;
    }

    public disposables()
    {
        return [vscode.commands.registerCommand('logger-joe.helloWorld', () => this.execute())];
    }

    private execute()
    {
        let activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || this.extensionManager.includes(activeEditor.document.fileName))
        {
            return;
        }
        this.extensionManager.addFile(activeEditor.document.fileName);
        this.extensionManager.update(activeEditor);
    }
}