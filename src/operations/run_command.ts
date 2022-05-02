import type { Document } from '../bson.ts';
import type { Server } from '../sdam/server.ts';
import type { ClientSession } from '../sessions.ts';
import { Callback, MongoDBNamespace } from '../utils.ts';
import { CommandOperation, CommandOperationOptions, OperationParent } from './command.ts';

/** @public */
export type RunCommandOptions = CommandOperationOptions;

/** @internal */
export class RunCommandOperation<T = Document> extends CommandOperation<T> {
  override options: RunCommandOptions;
  command: Document;

  constructor(parent: OperationParent | undefined, command: Document, options?: RunCommandOptions) {
    super(parent, options);
    this.options = options ?? {};
    this.command = command;
  }

  override execute(
    server: Server,
    session: ClientSession | undefined,
    callback: Callback<T>
  ): void {
    const command = this.command;
    this.executeCommand(server, session, command, callback);
  }
}

export class RunAdminCommandOperation<T = Document> extends RunCommandOperation<T> {
  constructor(parent: OperationParent | undefined, command: Document, options?: RunCommandOptions) {
    super(parent, command, options);
    this.ns = new MongoDBNamespace('admin');
  }
}
