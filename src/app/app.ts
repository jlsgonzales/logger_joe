import { ExtensionContext } from "vscode";
import { FileParserCommand, HighlightCommand, GrepCommand, RememberLineCommand } from "../commands";
import { ExtensionManager, CommandManager, DecoratorManager } from "../managers";


export class App {
  private extensionManager = new ExtensionManager();
  private commandManager = new CommandManager();
  private decoratorManger = new DecoratorManager(this.extensionManager);


  public init(context: ExtensionContext) {
    this.extensionManager.registerListeners(context);

    this.commandManager.registerNewCommand(context,  new FileParserCommand(this.extensionManager));
    this.commandManager.registerNewCommand(context, new HighlightCommand(this.extensionManager, this.decoratorManger));
    this.commandManager.registerNewCommand(context, new GrepCommand(this.extensionManager, this.decoratorManger));
    this.commandManager.registerNewCommand(context, new RememberLineCommand(this.extensionManager, this.decoratorManger));
  }
}


