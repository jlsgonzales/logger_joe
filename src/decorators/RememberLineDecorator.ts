import { ExtensionManager } from "../ExtensionManager";
import * as vscode from 'vscode';

export class RememberLineDecorator
{
    private extensionManager: ExtensionManager;
    private rememberedLines: number[];

    constructor(extensionManager: ExtensionManager)
    {
        this.extensionManager = extensionManager;
        this.extensionManager.addHook((activeEditor: vscode.TextEditor) => this.updateDecoration(activeEditor));
        this.rememberedLines = [];
    }

    public updateDecoration(active: vscode.TextEditor)
    {
        this.rememberedLines.forEach( (line: number, index: number) =>
        {
            const decor = vscode.window.createTextEditorDecorationType(
            {
                borderWidth: '1px',
                borderStyle: 'solid',
                overviewRulerColor: 'blue',
                overviewRulerLane: vscode.OverviewRulerLane.Right,
                light: { borderColor: 'darkblue' },
                dark: { borderColor: 'lightblue' }
            });
            active.setDecorations(decor, [{ range: active.document.lineAt(line).range }]);
            console.log("updateDecoration for: ", active.document.lineAt(line).range);
        });
    }

    public addLine(ln: number)
    {
        if (this.rememberedLines.includes(ln))
        {
            return;
        }
        this.rememberedLines.push(ln);
        this.rememberedLines = this.rememberedLines.sort((a, b) => a - b);
    }

    public getNextLine(editor: vscode.TextEditor)
    {
        const currentLine = editor.visibleRanges[0].start.line;
        return (this.rememberedLines.find(ln => ln > currentLine) !== undefined) ?
            this.rememberedLines.find(ln => ln > currentLine)! :
            this.rememberedLines[0]; // loops to the first remembered word
    }

    public getPreviousLine(editor: vscode.TextEditor)
    {
        const currentLine = editor.visibleRanges[0].start.line;
        return (this.rememberedLines.find(ln => ln < currentLine) !== undefined) ?
            this.rememberedLines.find(ln => ln < currentLine)! :
            this.rememberedLines[this.rememberedLines.length - 1]; // loops to the last remembered word
    }

    public isRememberedEmpty(): boolean
    {
        return this.rememberedLines.length === 0;
    }
}