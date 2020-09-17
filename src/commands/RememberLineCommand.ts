import * as vscode from 'vscode';
import { ExtensionManager } from "../managers/ExtensionManager";
import { RememberLineDecorator } from '../decorators/RememberLineDecorator';
import { ICommand } from './ICommand';


export class RememberLineCommand implements ICommand
{
    private extensionManager: ExtensionManager;
    private decorator: RememberLineDecorator;

    constructor(extensionManager: ExtensionManager, decorator: RememberLineDecorator)
    {
        this.extensionManager = extensionManager;
        this.decorator = decorator;
    }

    public disposables()
    {
        return [
            vscode.commands.registerCommand('logger-joe.rememberLine', () => this.remember()),
            vscode.commands.registerCommand('logger-joe.forgetLine', () => this.forget()),
            vscode.commands.registerCommand('logger-joe.nextRememberLine', () => this.next()),
            vscode.commands.registerCommand('logger-joe.previousRememberLine', () => this.previous()),
        ];
    }

    public remember()
    {
        const editor = vscode.window.activeTextEditor!;
        if (!editor)
        {
            return;
        }
        this.decorator.addLine(editor.document.fileName, editor.selection.active.line);

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

    public forget()
    {
        const editor = vscode.window.activeTextEditor!;
        if (!editor)
        {
            return;
        }
        this.decorator.removeLine(editor.document.fileName, editor.selection.active.line);

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
        if (this.decorator.isRememberedEmpty(editor.document.fileName))
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

        if (this.decorator.isRememberedEmpty(editor.document.fileName))
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