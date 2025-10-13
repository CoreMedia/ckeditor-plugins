import type { Command } from "ckeditor5";
import { JSWrapper } from "./JSWrapper";
import type { CommandCollectionWrapper } from "./CommandCollectionWrapper";

/**
 * Wraps a CKEditor `Command`.
 */
export class CommandWrapper extends JSWrapper<Command> {
  /**
   * Execute the given command with the provided arguments.
   *
   * @param args - arguments to pass to command
   */
  async execute(...args: unknown[]): Promise<unknown> {
    return this.evaluate((command, args) => command.execute(args), [...args]);
  }

  /**
   * Provide access to CommandCollection via CommandCollection.
   *
   * @param wrapper - CommandCollection wrapper
   * @param commandName - name of the command
   */
  static fromCommandCollection(wrapper: CommandCollectionWrapper, commandName: string): CommandWrapper {
    return new CommandWrapper(
      wrapper.evaluateHandle((c, n) => {
        const command = c.get(n);
        if (!command) {
          throw new Error(`Command '${n}' not available. Available commands: ${[...c.names()].join(", ")}`);
        }
        return command;
      }, commandName),
    );
  }
}
