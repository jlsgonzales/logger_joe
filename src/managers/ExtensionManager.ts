import * as vscode from 'vscode';

type TUpdateHook = (active: vscode.TextEditor) => void;
type TDisposeHook = (fn: string) => void;

export class ExtensionManager
{
    private files: string[];
    private updateHooks: TUpdateHook[];
    private undoHooks: TUpdateHook[];
    private disposeHooks: TDisposeHook[];

    constructor()
    {
        this.files = [];
        this.updateHooks = [];
        this.undoHooks = [];
        this.disposeHooks = [];
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

    public addUpdateHook(newUpdateHook: TUpdateHook)
    {
        this.updateHooks.push(newUpdateHook);
    }

    public addUndoHook(newUndoHook: TUpdateHook)
    {
        this.undoHooks.push(newUndoHook);
    }

    public addDisposeHook(newDisposeHook: TDisposeHook)
    {
        this.disposeHooks.push(newDisposeHook);
    }

    public update(activeEditor?: vscode.TextEditor)
    {
        setTimeout(() =>
        {
            if (activeEditor && this.includes(activeEditor.document.fileName))
            {
                this.updateHooks.forEach((updateHook: TUpdateHook) => updateHook(activeEditor!));
            }
        }, 500);
    }

    public undo(activeEditor?: vscode.TextEditor)
    {
        if (activeEditor && this.includes(activeEditor.document.fileName))
        {
            console.log("extension.undo");
            this.undoHooks.forEach((updateHook: TUpdateHook) => updateHook(activeEditor!));
        }
    }

    public replace(oldFN: string, newFN: string)
    {
        if (this.files.includes(oldFN))
        {
            this.files[this.files.indexOf(oldFN)] = newFN;
        }
        else
        {
            console.log(`Failed to replace filename. ${oldFN} is not saved`);
        }
    }

    public registerListeners(context: vscode.ExtensionContext)
    {
        // Listen to Editor Changes
        vscode.window.onDidChangeActiveTextEditor(editor =>
        {
            if (editor && this.includes(editor?.document.fileName!))
            {
                this.update(editor);
            }
        }, null, context.subscriptions);

        vscode.workspace.onDidChangeTextDocument(event =>
        {
            let activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && this.includes(activeEditor.document.fileName))
            {
                this.update(activeEditor);
            }
        }, null, context.subscriptions);

        vscode.workspace.onWillSaveTextDocument((event: vscode.TextDocumentWillSaveEvent) =>
        {
            let activeEditor = vscode.window.activeTextEditor;
            this.replace(activeEditor!.document.fileName, event.document.fileName);
        });

        vscode.commands.registerTextEditorCommand('undo', (editor, edit, ...args) =>
        {
            if(this.includes(editor.document.fileName))
            {
                console.log('undo done in file:', editor.document.fileName);
                this.undo(editor);
                this.update(editor);
            }
            return vscode.commands.executeCommand('default:undo', args);
        });
    }

    public removeFile(fn: string)
    {
        if (this.files.includes(fn))
        {
            this.files = this.files.filter((fileName) => fileName !== fn);
        }
        this.disposeHooks.forEach((disposeHook: TDisposeHook) => disposeHook(fn));
        console.log('removed file: ', fn, ' from parsed files: ', this.files);
    }
}