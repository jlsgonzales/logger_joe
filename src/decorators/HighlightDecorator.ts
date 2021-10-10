import { ExtensionManager } from "../managers";
import * as vscode from 'vscode';

const colors: string[] =
[
    "mediumaquamarine",
    "yellowgreen",
    "mediumorchid",
    "royalblue",
    "mediumpurple",
    "mediumseagreen",
    "aqua",
    "coral",
    "chartreuse",
    "aquamarine",
    "mediumslateblue",
    "blueviolet",
    "cadetblue",
    "chocolate",
    "cornflowerblue",
    "cyan",
    "olive",
    "darkcyan",
    "darkgoldenrod",
    "darkgray",
    "orange",
    "darkkhaki",
    "tomato",
    "darkolivegreen",
    "darkorange",
    "darkorchid",
    "darkred",
    "darksalmon",
    "darkseagreen",
    "darkslateblue",
    "darkturquoise",
    "deepskyblue",
    "dodgerblue",
    "forestgreen",
    "fuchsia",
    "gold",
    "goldenrod",
    "green",
    "greenyellow",
    "hotpink",
    "indianred",
    "khaki",
    "lawngreen",
    "lightblue",
    "lightcoral",
    "lightgreen",
    "lightpink",
    "lightsalmon",
    "lightseagreen",
    "lightskyblue",
    "lime",
];



export class HighlightDecorator
{
    private extensionManager: ExtensionManager;
    private words: Map<string, string[]>; // filename, highlightedWord
    private disposables: vscode.Disposable[];

    constructor(extensionManager: ExtensionManager)
    {
        this.extensionManager = extensionManager;
        this.extensionManager.addUpdateHook((activeEditor: vscode.TextEditor) => this.updateDecoration(activeEditor));
        this.extensionManager.addDisposeHook((fn: string) => this.disposeFile(fn));
        this.words = new Map([]);
        this.disposables = [];
    }

    public updateDecoration(active: vscode.TextEditor)
    {
        this.disposeDecoration();
        this.decorate(active.document.getText(), active);
    }

    public disposeDecoration()
    {
        console.log('disposing', this.constructor.name);
        this.disposables.forEach((disposable) => disposable.dispose());
        this.disposables = [];
    }

    public disposeFile(fn: string)
    {
        console.log('disposing', this.constructor.name);
        this.words.delete(fn);
        this.disposeDecoration();
    }

    private decorate(text: string, active: vscode.TextEditor): void
    {
        const {fileName} = active!.document;
        if (!this.words.has(fileName))
        {
            return;
        }

        this.words.get(fileName)!.forEach( (word: string, index: number) =>
        {
            const decor = vscode.window.createTextEditorDecorationType(
            {
                backgroundColor: colors[index],
                color: "black",
            });
            this.disposables.push(decor);
            const regexPattern = new RegExp(word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "g");
            active.setDecorations(decor, this.searchForRanges(text, regexPattern, active));
            console.log(`highlighting fn:${fileName}, word: ${word}`);
        });
    }

    private searchForRanges(text: string,  regex: RegExp, active: vscode.TextEditor): { range: vscode.Range }[]
    {
        let ranges: {range: vscode.Range}[] = [];
        let match;
        while ((match = regex.exec(text)))
        {
            const startPos = active.document.positionAt(match.index);
            const endPos = active.document.positionAt(match.index + match[0].length);
            const decoration = { range: new vscode.Range(startPos, endPos) };
            ranges.push(decoration);
        }

        return ranges;
    }

    public addWord(fn: string, word: string)
    {
        let words = this.words.get(fn);
        if (words === undefined)
        {
            this.words.set(fn, []);
            words = this.words.get(fn)!;
        }

        if (words!.includes(word))
        {
            console.log(word, " not added");
            return;
        }
        words!.push(word);
    }

    public removeWord(fn: string, word: string)
    {
        let rememberedLines = this.words.get(fn);
        if (rememberedLines === undefined)
        {
            // no remembered
            return;
        }
        if (rememberedLines!.includes(word))
        {
            rememberedLines.splice(rememberedLines.indexOf(word), 1);
        }
    }

    public length(fn: string)
    {
        return (this.words.has(fn)) ? this.words.get(fn)!.length : 0;
    }
}