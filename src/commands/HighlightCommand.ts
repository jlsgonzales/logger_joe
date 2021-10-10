import * as vscode from 'vscode';
import { ExtensionManager } from "../managers/ExtensionManager";
import { HighlightDecorator } from '../decorators/HighlightDecorator';
import { ICommand } from './ICommand';
import { DecoratorManager } from '../managers';

const MAX_HIGHLIGHTED_WORD = 50;

type Operation =
{
    cb: (editor: vscode.TextEditor) => void,
};

export class HighlightCommand implements ICommand
{
    private extensionManager: ExtensionManager;
    private decorator: HighlightDecorator;
    private operationMap: Map<string, Operation>;

    constructor(extensionManager: ExtensionManager, decorator: DecoratorManager)
    {
        this.extensionManager = extensionManager;
        this.decorator = decorator.highlight;
        this.operationMap = new Map([
            [ "Logger Joe: Highlight Selected", { cb: this.highlight.bind(this) } ],
            [ "Logger Joe: Unhighlight Selected", { cb: this.unhighlight.bind(this) } ],
            [ "Logger Joe: Unhighlight All in File", { cb: this.unhighlightAll.bind(this) } ],
        ]);
    }

    public disposables()
    {
        return [
            vscode.commands.registerCommand('logger-joe.highlightUnhighlight', () => this.highlightUnhighlight()),
        ];
    }

    public highlightUnhighlight()
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

    private highlight(editor: vscode.TextEditor)
    {
        if (this.decorator.length(editor.document.fileName) > MAX_HIGHLIGHTED_WORD)
        {
            vscode.window.showErrorMessage(`Logger Joe can only highlight ${MAX_HIGHLIGHTED_WORD} words`);
            return;
        }

        let highlightedWord: string = this.getSelectedWord(editor);
        this.decorator.addWord(editor.document.fileName, highlightedWord);
    }

    private unhighlight(editor: vscode.TextEditor)
    {
        let highlightedWord: string = this.getSelectedWord(editor);
        this.decorator.removeWord(editor.document.fileName, highlightedWord);
    }

    private unhighlightAll(editor: vscode.TextEditor)
    {
        this.decorator.disposeFile(editor.document.fileName);
    }

    private getSelectedWord(editor: vscode.TextEditor)
    {
        let userSelectedRange: vscode.Range = new vscode.Range(editor.selection.start, editor.selection.end);
        return editor.document.getText(userSelectedRange);
    }
}