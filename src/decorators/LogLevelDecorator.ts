import * as vscode from 'vscode';
import { ExtensionManager } from '../ExtensionManager';

type TProgress =
{
    bar: vscode.Progress<{ increment: number }>,
    progress: number,
    resolver: () => void,
};

export class LogLevelDecorator
{
    private timeout: NodeJS.Timeout | undefined;
    private extensionManager: ExtensionManager;
    private progressBar?: TProgress;

    constructor(extensionManager: ExtensionManager)
    {
        this.extensionManager = extensionManager;
        this.extensionManager.addHook((activeEditor: vscode.TextEditor) => this.updateDecoration(activeEditor));
    }

    public updateDecoration(active: vscode.TextEditor)
    {
        if (this.timeout)
        {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.timeout = setTimeout( () => this.decorate(active), 500);
    }

    private decorate(active: vscode.TextEditor): void
    {
        const text = active.document.getText();
        this.displayProgress();
        this.decorateLogLevels(text, active);
    }

    private displayProgress()
    {
        vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: "Decorating Log Levels", },
        (progress) =>
        {
            return new Promise((resolver: () => void) =>
            {
                this.progressBar =  { bar: progress, resolver: resolver, progress: 0 };
            });
		});
    }

    private decorateLogLevels(text: string, active: vscode.TextEditor): void
    {
        const infoDecorator = vscode.window.createTextEditorDecorationType(
        {
            light: { color: 'green'},
            dark: { color: 'lightgreen'}
        });
        const warnDecorator = vscode.window.createTextEditorDecorationType(
        {
            light: { color: 'yellow'},
            dark: { color: 'yellow'}
        });
        const errorDecorator = vscode.window.createTextEditorDecorationType(
        {
            light: { color: 'red'},
            dark: { color: 'red'}
        });
        const fatalDecorator = vscode.window.createTextEditorDecorationType(
        {
            light: { color: 'darkviolet'},
            dark: { color: 'violet'}
        });

        active.setDecorations(infoDecorator, this.searchForRanges(text, /INFO/g, active));
        active.setDecorations(warnDecorator, this.searchForRanges(text, /WARN/g, active));
        active.setDecorations(errorDecorator, this.searchForRanges(text, /ERROR/g, active));
        active.setDecorations(fatalDecorator, this.searchForRanges(text, /FATAL/g, active));
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

        this.updateProgress(25); // 25%

        return ranges;
    }

    private updateProgress(percentFinished: number)
    {
        this.progressBar!.progress += percentFinished;
        this.progressBar!.bar.report({ increment: this.progressBar!.progress });
        if (this.progressBar!.progress >= 100)
        {
            this.progressBar!.resolver();
        }
    }
}
