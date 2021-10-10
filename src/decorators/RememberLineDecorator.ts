import { ExtensionManager } from "../managers";
import * as vscode from 'vscode';

export class RememberLineDecorator
{
    private extensionManager: ExtensionManager;
    private rememberedLines: Map<string, number[]>; // filename, rememberedlines
    private tempRememberedLines: Map<string, number[]>; // filename, rememberedlines
    private disposables: vscode.Disposable[];

    constructor(extensionManager: ExtensionManager)
    {
        this.extensionManager = extensionManager;
        this.extensionManager.addUpdateHook((activeEditor: vscode.TextEditor) => this.updateDecoration(activeEditor));
        this.extensionManager.addUndoHook((activeEditor: vscode.TextEditor) => this.undo(activeEditor));
        this.extensionManager.addDisposeHook((fn: string) => this.disposeFile(fn));
        this.rememberedLines = new Map([]);
        this.tempRememberedLines = new Map([]);
        this.disposables = [];
    }

    public undo(editor: vscode.TextEditor)
    {
        const fileName = editor.document.fileName;
        if (!this.tempRememberedLines.has(fileName))
        {
            return;
        }
        console.log("reverting remembered to", this.tempRememberedLines.get(fileName));
        this.rememberedLines.set(fileName, [...this.tempRememberedLines.get(fileName)!]);
    }

    public updateDecoration(active: vscode.TextEditor)
    {
        const fileName = active.document.fileName;
        if (!this.rememberedLines.has(fileName))
        {
            return;
        }
        this.disposeDecoration();
        this.rememberedLines.get(fileName)!.forEach( (line: number, index: number) =>
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
            this.disposables.push(decor);
            active.setDecorations(decor, [{ range: active.document.lineAt(line).range }]);
            console.log("rememberline ", line);
        });
    }

    private disposeDecoration()
    {
        console.log('disposing', this.constructor.name);
        this.disposables.forEach((disposable) => disposable.dispose());
        this.disposables = [];
    }

    public disposeFile(fn: string)
    {
        console.log('disposing', this.constructor.name);
        this.disposeDecoration();
        this.rememberedLines.delete(fn);
        this.tempRememberedLines.delete(fn);
    }

    public addLine(fn: string, ln: number)
    {
        let rememberedLines = this.rememberedLines.get(fn);
        if (rememberedLines === undefined)
        {
            this.rememberedLines.set(fn, []);
            rememberedLines = this.rememberedLines.get(fn)!;
        }

        if (rememberedLines!.includes(ln))
        {
            return;
        }
        rememberedLines!.push(ln);
        rememberedLines = rememberedLines!.sort((a, b) => a - b);
    }

    public removeLine(fn: string, ln: number)
    {
        let rememberedLines = this.rememberedLines.get(fn);
        if (rememberedLines === undefined)
        {
            // no remembered
            return;
        }
        if (rememberedLines!.includes(ln))
        {
            rememberedLines.splice(rememberedLines.indexOf(ln), 1);
        }
    }

    public getNextLine(editor: vscode.TextEditor)
    {
        const currentLine = editor.visibleRanges[0].start.line;
        const rememberedLines = this.rememberedLines.get(editor.document.fileName)!;
        return (rememberedLines.find(ln => ln > currentLine) !== undefined) ?
            rememberedLines.find(ln => ln > currentLine)! :
            rememberedLines[0]; // loops to the first remembered word
    }

    public getPreviousLine(editor: vscode.TextEditor)
    {
        const currentLine = editor.visibleRanges[0].start.line; // 6123
        console.log("currentLine", currentLine);
        const rememberedLines = this.rememberedLines.get(editor.document.fileName)!;
        const result = [...rememberedLines].reverse().find(ln => ln < currentLine);
        console.log("result", result);
        return (result !== undefined) ?
            result! :
            rememberedLines[rememberedLines.length - 1]; // loops to the last remembered word
    }

    public isRememberedEmpty(fn: string): boolean
    {
        return (!this.rememberedLines.has(fn) || this.rememberedLines.get(fn)!.length === 0);
    }

    public includes(fn: string, ln: number): boolean
    {
        return this.rememberedLines.has(fn) && this.rememberedLines.get(fn)!.includes(ln);
    }

    public replace(fn: string, oldLn: number, newLn: number)
    {
        // make sure old and new are valid!!!
        const remembered = this.rememberedLines.get(fn)!;
        const oldIndex = remembered.indexOf(oldLn);

        remembered.splice(oldIndex, 1);
        remembered.push(newLn);
    }

    public replicate(fn: string, lines: number[])
    {
        this.rememberedLines.set(fn, lines);
        console.log("Remembering ", fn, lines);
    }

    public saveAsTemp(fn: string)
    {
        if (!this.rememberedLines.has(fn))
        {
            return;
        }
        this.tempRememberedLines.set(fn, [...this.rememberedLines.get(fn)!]);
    }
}