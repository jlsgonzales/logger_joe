import * as vscode from 'vscode';
import { ExtensionManager } from "../managers";
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
        return [vscode.commands.registerCommand('logger-joe.parseUnparse', () => this.execute())];
    }

    private execute()
    {
        let activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor)
        {
            return;
        }
        const { fileName } = activeEditor.document;
        if (this.extensionManager.includes(fileName))
        {
            this.extensionManager.removeFile(fileName);
        }
        else
        {
            this.extensionManager.addFile(fileName);
        }
        this.extensionManager.update(activeEditor);
    }
}