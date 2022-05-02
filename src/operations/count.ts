import type { Document } from "../bson.ts";
import type { Collection } from "../collection.ts";
import type { Server } from "../sdam/server.ts";
import type { ClientSession } from "../sessions.ts";
import type { Callback, MongoDBNamespace } from "../utils.ts";
import { CommandOperation, CommandOperationOptions } from "./command.ts";
import { Aspect, defineAspects } from "./operation.ts";

/** @public */
export interface CountOptions extends CommandOperationOptions {
  /** The number of documents to skip. */
  skip?: number;
  /** The maximum amounts to count before aborting. */
  limit?: number;
  /** Number of milliseconds to wait before aborting the query. */
  maxTimeMS?: number;
  /** An index name hint for the query. */
  hint?: string | Document;
}

/** @internal */
export class CountOperation extends CommandOperation<number> {
  override options: CountOptions;
  collectionName?: string;
  query: Document;

  constructor(
    namespace: MongoDBNamespace,
    filter: Document,
    options: CountOptions,
  ) {
    super({ s: { namespace: namespace } } as unknown as Collection, options);

    this.options = options;
    this.collectionName = namespace.collection;
    this.query = filter;
  }

  override execute(
    server: Server,
    session: ClientSession | undefined,
    callback: Callback<number>,
  ): void {
    const options = this.options;
    const cmd: Document = {
      count: this.collectionName,
      query: this.query,
    };

    if (typeof options.limit === "number") {
      cmd.limit = options.limit;
    }

    if (typeof options.skip === "number") {
      cmd.skip = options.skip;
    }

    if (options.hint != null) {
      cmd.hint = options.hint;
    }

    if (typeof options.maxTimeMS === "number") {
      cmd.maxTimeMS = options.maxTimeMS;
    }

    super.executeCommand(server, session, cmd, (err, result) => {
      callback(err, result ? result.n : 0);
    });
  }
}

defineAspects(CountOperation, [Aspect.READ_OPERATION, Aspect.RETRYABLE]);
