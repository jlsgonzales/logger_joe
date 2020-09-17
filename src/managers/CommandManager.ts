import { ICommand } from "../commands/ICommand";
import * as vscode from 'vscode';

export class CommandManager
{
    private commands: ICommand[];
    constructor(commands: ICommand[])
    {
        this.commands = commands;
    }

    public registerCommands(context: vscode.ExtensionContext)
    {
        this.commands.forEach((command) =>
        {
            command.disposables().forEach((disposable: vscode.Disposable) =>
            {
                context.subscriptions.push(disposable);
            });
        });
    }
}