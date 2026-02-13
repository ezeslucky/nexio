import { LifeCycleWatcher } from '../extension/index.js';
import { cmdSymbol } from './consts.js';
import type { Chain, Command, InitCommandCtx } from './types.js';


export class CommandManager extends LifeCycleWatcher {
  static override readonly key = 'commandManager';

  private readonly _createChain = (_cmds: Command[]): Chain => {
    const getCommandCtx = this._getCommandCtx;
    const createChain = this._createChain;
    const chain = this.chain;

    return {
      [cmdSymbol]: _cmds,
      run: function (this: Chain) {
        let ctx = getCommandCtx();
        let success = false;
        try {
          const cmds = this[cmdSymbol];
          ctx = runCmds(ctx, [
            ...cmds,
            (_, next) => {
              success = true;
              next();
            },
          ]);
        } catch (err) {
          console.error(err);
        }

        return [success, ctx];
      },
      with: function (this: Chain, value) {
        const cmds = this[cmdSymbol];
        return createChain([...cmds, (_, next) => next(value)]) as never;
      },
      pipe: function (this: Chain, command: Command, input?: object) {
        const cmds = this[cmdSymbol];
        return createChain([
          ...cmds,
          (ctx, next) => command({ ...ctx, ...input }, next),
        ]);
      },
      try: function (this: Chain, fn) {
        const cmds = this[cmdSymbol];
        return createChain([
          ...cmds,
          (beforeCtx, next) => {
            let ctx = beforeCtx;

            const commands = fn(chain());

            commands.some(innerChain => {
              innerChain[cmdSymbol] = [
                (_, next) => {
                  next(ctx);
                },
                ...innerChain[cmdSymbol],
              ];

              const [success, branchCtx] = innerChain.run();
              ctx = { ...ctx, ...branchCtx };

              if (success) {
                next(ctx);
                return true;
              }
              return false;
            });
          },
        ]) as never;
      },
      tryAll: function (this: Chain, fn) {
        const cmds = this[cmdSymbol];
        return createChain([
          ...cmds,
          (beforeCtx, next) => {
            let ctx = beforeCtx;

            let allFail = true;

            const commands = fn(chain());

            commands.forEach(innerChain => {
              innerChain[cmdSymbol] = [
                (_, next) => {
                  next(ctx);
                },
                ...innerChain[cmdSymbol],
              ];

              const [success, branchCtx] = innerChain.run();
              ctx = { ...ctx, ...branchCtx };

              if (success) {
                allFail = false;
              }
            });

            if (!allFail) {
              next(ctx);
            }
          },
        ]) as never;
      },
    };
  };

  private readonly _getCommandCtx = (): InitCommandCtx => {
    return {
      std: this.std,
    };
  };

  /**
   * Create a chain to run a series of commands
   * ```ts
   * const chain = commandManager.chain();
   * const [result, data] = chain
   *   .myCommand1()
   *   .myCommand2(payload)
   *   .run();
   * ```
   * @returns [success, data] - success is a boolean to indicate if the chain is successful,
   *   data is the final context after running the chain
   */
  chain = (): Chain<InitCommandCtx> => {
    return this._createChain([]);
  };

  exec = <Output extends object, Input extends object>(
    command: Command<Input, Output>,
    input?: Input
  ) => {
    return this.chain().pipe(command, input).run();
  };
}

function runCmds(ctx: InitCommandCtx, [cmd, ...rest]: Command[]) {
  let _ctx = ctx;
  if (cmd) {
    cmd(ctx, data => {
      _ctx = runCmds({ ...ctx, ...data }, rest);
    });
  }
  return _ctx;
}
