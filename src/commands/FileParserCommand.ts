import * as vscode from 'vscode';
import { ExtensionManager } from "../ExtensionManager";

export class FileParserCommand
{
    private extensionManager: ExtensionManager;

    constructor(extensionManager: ExtensionManager)
    {
        this.extensionManager = extensionManager;
    }

    public get disposable()
    {
        return vscode.commands.registerCommand('logger-joe.helloWorld', () => this.execute());
    }

    public execute()
    {
        let activeEditor = vscode.window.activeTextEditor;
        if (activeEditor)
        {
            this.extensionManager.addFile(activeEditor.document.fileName);
            this.extensionManager.update(activeEditor);
        }
    }
}