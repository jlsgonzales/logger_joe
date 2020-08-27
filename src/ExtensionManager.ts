import * as vscode from 'vscode';

type TUpdateHook = (active: vscode.TextEditor) => void;

export class ExtensionManager
{
    private files: string[];
    private updateHooks: TUpdateHook[];

    constructor()
    {
        this.files = [];
        this.updateHooks = [];
    }

    public addFile(fileName: string): void
    {
        if (this.files.includes(fileName))
        {
            return;
        }
        this.files.push(fileName);
    }

    public includes(filename: string): boolean
    {
        return this.files.includes(filename);
    }

    public addHook(newUpdateHook: TUpdateHook)
    {
        this.updateHooks.push(newUpdateHook);
    }

    public update(activeEditor?: vscode.TextEditor)
    {
        if (activeEditor && this.includes(activeEditor.document.fileName))
        {
            this.updateHooks.forEach((updateHook: TUpdateHook) => updateHook(activeEditor!));
        }
    }
}