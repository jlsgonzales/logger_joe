import * as vscode from 'vscode';
import { ExtensionManager } from "../managers/ExtensionManager";
import { HighlightDecorator } from '../decorators/HighlightDecorator';
import { ICommand } from './ICommand';

const MAX_HIGHLIGHTED_WORD = 50;

export class HighlightCommand implements ICommand
{
    private extensionManager: ExtensionManager;
    private decorator: HighlightDecorator;

    constructor(extensionManager: ExtensionManager, decorator: HighlightDecorator)
    {
        this.extensionManager = extensionManager;
        this.decorator = decorator;
    }

    public disposables()
    {
        return [
            vscode.commands.registerCommand('logger-joe.highlightWord', () => this.highlight()),
            vscode.commands.registerCommand('logger-joe.unhighlightWord', () => this.unhighlight()),
        ];
    }

    private highlight()
    {
        const editor = vscode.window.activeTextEditor!;
        if (!editor)
        {
            return;
        }

        if (this.decorator.length(editor.document.fileName) > MAX_HIGHLIGHTED_WORD)
        {
            vscode.window.showErrorMessage(`Logger Joe can only highlight ${MAX_HIGHLIGHTED_WORD} words`);
            return;
        }

        let highlightedWord: string = this.getSelectedWord(editor);
        this.decorator.addWord(editor.document.fileName, highlightedWord);

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

    private unhighlight()
    {
        const editor = vscode.window.activeTextEditor!;
        if (!editor)
        {
            return;
        }

        let highlightedWord: string = this.getSelectedWord(editor);
        this.decorator.removeWord(editor.document.fileName, highlightedWord);

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

    private getSelectedWord(editor: vscode.TextEditor)
    {
        let userSelectedRange: vscode.Range = new vscode.Range(editor.selection.start, editor.selection.end);
        return editor.document.getText(userSelectedRange);
    }
}