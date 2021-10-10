import * as vscode from 'vscode';
import { ExtensionManager } from "../managers/ExtensionManager";
import { RememberLineDecorator } from '../decorators/RememberLineDecorator';
import { ICommand } from './ICommand';
import { DecoratorManager } from '../managers';

type Operation =
{
    cb: (editor: vscode.TextEditor) => void,
};

export class RememberLineCommand implements ICommand
{
    private extensionManager: ExtensionManager;
    private decorator: RememberLineDecorator;
    private operationMap: Map<string, Operation>;

    constructor(extensionManager: ExtensionManager, decorator: DecoratorManager)
    {
        this.extensionManager = extensionManager;
        this.decorator = decorator.rememberLine;
        this.operationMap = new Map([
            [ "Logger Joe: Remember This Line", { cb: this.remember.bind(this) } ],
            [ "Logger Joe: Forget This Line", { cb: this.forget.bind(this) } ],
            [ "Logger Joe: Forget All Lines in File", { cb: this.forgetAll.bind(this) } ],
        ]);
    }

    public disposables()
    {
        return [
            vscode.commands.registerCommand('logger-joe.rememberForget', () => this.rememberForget()),
            vscode.commands.registerCommand('logger-joe.nextRememberLine', () => this.next()),
            vscode.commands.registerCommand('logger-joe.previousRememberLine', () => this.previous()),
        ];
    }

    public rememberForget()
    {
        console.log("rememberForget");
        const editor = vscode.window.activeTextEditor!;
        if (!editor)
        {
            return;
        }
        vscode.window.showQuickPick(Array.from(this.operationMap.keys())).then((value?: string) =>
        {
            if (value === undefined)
            {
                return;
            }
            const choice = this.operationMap.get(value)!;
            choice.cb(editor);
            if (this.extensionManager.includes(editor.document.fileName))
            {
                this.decorator.updateDecoration(editor);
            }
            else
            {
                this.extensionManager.addFile(editor.document.fileName);
                this.extensionManager.update(editor);
            }
        });
    }

    public remember(editor: vscode.TextEditor)
    {
        this.decorator.addLine(editor.document.fileName, editor.selection.active.line);
    }

    public forget(editor: vscode.TextEditor)
    {
        this.decorator.removeLine(editor.document.fileName, editor.selection.active.line);
    }

    public forgetAll(editor: vscode.TextEditor)
    {
        this.decorator.disposeFile(editor.document.fileName);
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