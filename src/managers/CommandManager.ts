import { Disposable, ExtensionContext } from "vscode";
import { ICommand } from "../commands/ICommand";

export class CommandManager
{
  private commands: ICommand[] = [];

  public registerNewCommand(context: ExtensionContext, command: ICommand)
  {
    this.commands.push(command);
    command.disposables().forEach((disposable: Disposable) =>
    {
        context.subscriptions.push(disposable);
    });
  }
}