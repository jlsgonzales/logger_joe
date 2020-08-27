import { ExtensionManager } from "../ExtensionManager";
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
    private words: string[];

    constructor(extensionManager: ExtensionManager)
    {
        this.extensionManager = extensionManager;
        this.extensionManager.addHook((activeEditor: vscode.TextEditor) => this.updateDecoration(activeEditor));
        this.words = [];
    }

    public updateDecoration(active: vscode.TextEditor)
    {
        this.decorate(active.document.getText(), active);
    }

    private decorate(text: string, active: vscode.TextEditor): void
    {
        this.words.forEach( (word: string, index: number) =>
        {
            const decor = vscode.window.createTextEditorDecorationType(
            {
                backgroundColor: colors[index],
                color: "black",
            });
            active.setDecorations(decor, this.searchForRanges(text, new RegExp(word, "g"), active));
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

    public addWord(word: string)
    {
        if (this.words.includes(word))
        {
            return;
        }
        this.words.push(word);
    }

    public get length()
    {
        return this.words.length;
    }
}