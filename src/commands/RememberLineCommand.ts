import * as vscode from 'vscode';
import { ExtensionManager } from "../ExtensionManager";
import { RememberLineDecorator } from '../decorators/RememberLineDecorator';


export class RememberLineCommand
{
    private extensionManager: ExtensionManager;
    private decorator: RememberLineDecorator;

    constructor(extensionManager: ExtensionManager, decorator: RememberLineDecorator)
    {
        this.extensionManager = extensionManager;
        this.decorator = decorator;
    }

    public get disposableRemember()
    {
        return vscode.commands.registerCommand('logger-joe.rememberLine', () => this.remember());
    }

    public get disposableNext()
    {
        return vscode.commands.registerCommand('logger-joe.nextRememberLine', () => this.next());
    }

    public get disposablePrevious()
    {
        return vscode.commands.registerCommand('logger-joe.previousRememberLine', () => this.previous());
    }

    public remember()
    {
        const editor = vscode.window.activeTextEditor!;
        if (!editor)
        {
            return;
        }
        this.decorator.addLine(editor.selection.active.line);

        if (this.extensionManager.includes(editor.document.fileName))
        {
            this.decorator.updateDecoration(editor);
        }
        else
        {
            this.extensionManager.addFile(editor.document.fileName);
            this.extensionManager.update(editor);
        }
    }

    public next()
    {
        const editor = vscode.window.activeTextEditor!;
        if (!editor)
        {
            return;
        }
        if (this.decorator.isRememberedEmpty())
        {
            return;
        }
        this.goToLine(editor, this.decorator.getNextLine(editor));
    }

    public previous()
    {
        const editor = vscode.window.activeTextEditor!;
        if (!editor)
        {
            return;
        }

        if (this.decorator.isRememberedEmpty())
        {
            return;
        }

        this.goToLine(editor, this.decorator.getPreviousLine(editor));
    }

    private goToLine(editor:vscode.TextEditor, ln: number)
    {
        editor.revealRange(new vscode.Selection(new vscode.Position(ln, 0),new vscode.Position(ln, 0)), vscode.TextEditorRevealType.AtTop);
        console.log(`goToLine: ${ln}`);
    }
}