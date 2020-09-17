import * as vscode from 'vscode';
import { ExtensionManager } from "../managers/ExtensionManager";
import { RememberLineDecorator } from '../decorators/RememberLineDecorator';
import { ICommand } from './ICommand';

enum EPatternType
{
    word = "WORD",
    regex = "REGEX",
}

type Operation =
{
    cb: (editor: vscode.TextEditor, pattern: string) => void,
    pattern: EPatternType
};

type GrepResult =
{
    content: string,
    remembered: number[],
};

export class GrepCommand implements ICommand
{
    private extensionManager: ExtensionManager;
    private operationMap: Map<string, Operation>;
    private rememberDecorator: RememberLineDecorator;

    constructor(extensionManager: ExtensionManager, remember: RememberLineDecorator)
    {
        this.extensionManager = extensionManager;
        this.operationMap = new Map([
            [
                "Logger Joe: Grep To New Editor (Text)",
                { cb: this.grepTextToNew.bind(this), pattern: EPatternType.word }
            ],
            [
                "Logger Joe: Grep To Current Editor (Text)",
                { cb: this.grepTextToCurrent.bind(this), pattern: EPatternType.word }
            ],
            [
                "Logger Joe: Grep To New Editor (Regex)",
                { cb: this.grepRegexToNew.bind(this), pattern: EPatternType.regex }
            ],
            [
                "Logger Joe: Grep To Current Editor (Regex)",
                { cb: this.grepRegexToCurrent.bind(this), pattern: EPatternType.regex }
            ],
        ]);
        this.rememberDecorator = remember;
    }

    public disposables()
    {
        return [vscode.commands.registerCommand('logger-joe.grep', () => this.execute())];
    }

    public execute()
    {
        const editor = vscode.window.activeTextEditor!;

        if (!editor)
        {
            return;
        }

        if (!this.extensionManager.includes(editor.document.fileName))
        {
            this.extensionManager.addFile(editor.document.fileName);
            this.extensionManager.update(editor);
        }

        vscode.window.showQuickPick(Array.from(this.operationMap.keys())).then((value?: string) =>
        {
            if (value === undefined)
            {
                return;
            }
            const choice = this.operationMap.get(value)!;
            vscode.window.showInputBox(
            {
                prompt: (choice.pattern === EPatternType.word) ? "Enter Text": "Enter Regex Pattern",
                value: (choice.pattern === EPatternType.word) ? "" : "/ /g",
            }).then((pattern?: string) =>
            {
                if (pattern === undefined || pattern.length === 0)
                {
                    return;
                }
                try
                {
                    choice.cb(editor, pattern!);
                }
                catch(err)
                {
                    console.error(err);
                    vscode.window.showErrorMessage(err);
                }
            });
        });
    }

    private grepTextToNew(editor: vscode.TextEditor, pattern: string)
    {
        const regexPattern =  new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "g");
        this.writeToNew(this.searchForMatch(editor, regexPattern, false));
    }

    private grepTextToCurrent(editor: vscode.TextEditor, pattern: string)
    {
        this.rememberDecorator.saveAsTemp(editor.document.fileName);
        const regexPattern =  new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "g");
        this.writeToCurrent(editor, this.searchForMatch(editor, regexPattern, true));
    }

    private grepRegexToNew(editor: vscode.TextEditor, regexStr: string)
    {
        const pattern = regexStr.substring(1, regexStr.lastIndexOf("/"));
        const flags = (regexStr.substring(regexStr.lastIndexOf("/")).length > 1) ?
            regexStr.substring(regexStr.lastIndexOf("/") + 1) : "";
        this.writeToNew(this.searchForMatch(editor, new RegExp(pattern, flags), false));
    }

    private grepRegexToCurrent(editor: vscode.TextEditor, regexStr: string)
    {
        this.rememberDecorator.saveAsTemp(editor.document.fileName);
        const pattern = regexStr.substring(1, regexStr.lastIndexOf("/"));
        const flags = (regexStr.substring(regexStr.lastIndexOf("/")).length > 1) ?
            regexStr.substring(regexStr.lastIndexOf("/") + 1) : "";
        this.writeToCurrent(editor, this.searchForMatch(editor, new RegExp(pattern, flags), true));
    }

    private writeToNew(grepResult: GrepResult)
    {
        vscode.workspace.openTextDocument({content: grepResult.content}).then((doc: vscode.TextDocument) =>
        {
            this.extensionManager.addFile(doc.fileName);
            this.rememberDecorator.replicate(doc.fileName, grepResult.remembered);
        });
    }

    private writeToCurrent(editor: vscode.TextEditor, grepResult: GrepResult)
    {
        editor.edit((editBuilder) =>
        {
            const range = new vscode.Range(new vscode.Position(0, 0), editor.document.lineAt(editor.document.lineCount - 1).range.end);
            editBuilder.replace(range, grepResult.content);
            this.extensionManager.update();
        }).then((bo) =>
        {
            console.log("Editor.edit then", bo);
            this.extensionManager.update(editor);
        });
    }

    private searchForMatch(editor: vscode.TextEditor, regex: RegExp, isWritingToCurrent = false): GrepResult
    {
        const {document} = editor;
        const currentText = document.getText();
        let result: GrepResult = { content: "", remembered: [] };
        let newLineNumber: number = 0;
        let match;
        while ((match = regex.exec(currentText)))
        {
            const ln = document.positionAt(match.index).line;
            result.content = result.content.concat(document.lineAt(ln).text, (document.eol === vscode.EndOfLine.CRLF) ? "\r\n" : "\n");
            if(this.rememberDecorator.includes(document.fileName, ln))
            {
                result.remembered.push(newLineNumber);
                if (isWritingToCurrent)
                {
                    this.rememberDecorator.replace(document.fileName, ln, newLineNumber);
                }
            }
            ++newLineNumber;
        }
        return result;
    }
}