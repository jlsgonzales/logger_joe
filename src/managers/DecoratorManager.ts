import { ExtensionManager } from ".";
import { LogLevelDecorator, HighlightDecorator, RememberLineDecorator } from "../decorators";

export class DecoratorManager
{
  private loglevelDecorator: LogLevelDecorator;
  private highlightDecorator: HighlightDecorator;
  private rememberLineDecorator: RememberLineDecorator;

  constructor(private extension: ExtensionManager) {
    this.loglevelDecorator = new LogLevelDecorator(this.extension);
    this.highlightDecorator = new HighlightDecorator(this.extension);
    this.rememberLineDecorator = new RememberLineDecorator(this.extension);
  }

  public get logLevel() {
    return this.loglevelDecorator;
  }

  public get highlight() {
    return this.highlightDecorator;
  }

  public get rememberLine() {
    return this.rememberLineDecorator;
  }
}