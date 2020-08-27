import * as vscode from 'vscode';
import { ExtensionManager } from "../ExtensionManager";
import { HighlightDecorator } from '../decorators/HighlightDecorator';

const MAX_HIGHLIGHTED_WORD = 50;

export class HighlightCommand
{
    private extensionManager: ExtensionManager;
    private decorator: HighlightDecorator;

    constructor(extensionManager: ExtensionManager, decorator: HighlightDecorator)
    {
        this.extensionManager = extensionManager;
        this.decorator = decorator;
    }

    public get disposable()
    {
        return vscode.commands.registerCommand('logger-joe.highlightWord', () => this.execute());
    }

    public execute()
    {
        const editor = vscode.window.activeTextEditor!;
        if (!editor)
        {
            return;
        }

        if (this.decorator.length > MAX_HIGHLIGHTED_WORD)
        {
            vscode.window.showErrorMessage(`Logger Joe can only highlight ${MAX_HIGHLIGHTED_WORD} words`);
            return;
        }

        let userSelectedRange: vscode.Range = new vscode.Range(editor.selection.start, editor.selection.end);
        let highlightedWord: string = editor.document.getText(userSelectedRange);
        this.decorator.addWord(highlightedWord);

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
}