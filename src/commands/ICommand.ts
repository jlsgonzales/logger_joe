import * as vscode from 'vscode';

export interface ICommand
{
    disposables(): vscode.Disposable[];
}