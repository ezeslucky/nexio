import type { EditorHost } from '@canvas/nexio/std';
import { captureException } from '@sentry/react';
import { BehaviorSubject, Subject } from 'rxjs';

import type { ChatContextValue } from '../components/ai-chat-content';
import {
  PaymentRequiredError,
  RequestTimeoutError,
  UnauthorizedError,
} from './error';

export interface AIUserInfo {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface AIChatParams {
  host: EditorHost;
  input?: string;
  mode?: 'page' | 'edgeless';
  // Auto select and append selection to input via `Continue in AI Chat` action.
  autoSelect?: boolean;
  context?: Partial<ChatContextValue | null>;
  fromAnswer?: boolean;
}

export interface AISendParams {
  host: EditorHost;
  input: string;
  context?: Partial<ChatContextValue | null>;
}

export interface AIEmbeddingStatus {
  embedded: number;
  total: number;
}

export type ActionEventType =
  | 'started'
  | 'finished'
  | 'error'
  | 'aborted:paywall'
  | 'aborted:login-required'
  | 'aborted:server-error'
  | 'aborted:stop'
  | 'aborted:timeout'
  | 'result:insert'
  | 'result:replace'
  | 'result:use-as-caption'
  | 'result:add-page'
  | 'result:add-note'
  | 'result:continue-in-chat'
  | 'result:discard'
  | 'result:retry';


export class AIProvider {
  static get slots() {
    return AIProvider.instance.slots;
  }

  static get actions() {
    return AIProvider.instance.actions;
  }

  static get userInfo() {
    return AIProvider.instance.userInfoFn();
  }

  static get photoEngine() {
    return AIProvider.instance.photoEngine;
  }

  static get histories() {
    return AIProvider.instance.histories;
  }

  static get session() {
    return AIProvider.instance.session;
  }

  static get context() {
    return AIProvider.instance.context;
  }

  static get actionHistory() {
    return AIProvider.instance.actionHistory;
  }

  static get toggleGeneralAIOnboarding() {
    return AIProvider.instance.toggleGeneralAIOnboarding;
  }

  static get forkChat() {
    return AIProvider.instance.forkChat;
  }

  static get embedding() {
    return AIProvider.instance.embedding;
  }

  private static readonly instance = new AIProvider();

  static LAST_ACTION_SESSIONID = '';

  static MAX_LOCAL_HISTORY = 10;

  private readonly actions: Partial<CanvasPresets.AIActions> = {};

  private photoEngine: CanvasPresets.AIPhotoEngineService | null = null;

  private histories: CanvasPresets.AIHistoryService | null = null;

  private session: CanvasPresets.AISessionService | null = null;

  private context: CanvasPresets.AIContextService | null = null;

  private toggleGeneralAIOnboarding: ((value: boolean) => void) | null = null;

  private forkChat:
    | ((
        options: CanvasPresets.AIForkChatSessionOptions
      ) => string | Promise<string>)
    | null = null;

  private readonly slots = {
    // use case: when user selects "continue in chat" in an ask ai result panel
    // do we need to pass the context to the chat panel?
    /* eslint-disable rxjs/finnish */
    requestOpenWithChat: new BehaviorSubject<AIChatParams | null>(null),
    requestSendWithChat: new BehaviorSubject<AISendParams | null>(null),
    requestInsertTemplate: new Subject<{
      template: string;
      mode: 'page' | 'edgeless';
    }>(),
    requestLogin: new Subject<{ host?: EditorHost | null }>(),
    requestUpgradePlan: new Subject<{ host?: EditorHost | null }>(),
    // stream of AI actions triggered by users
    actions: new Subject<{
      action: keyof CanvasPresets.AIActions;
      options: CanvasPresets.AITextActionOptions;
      event: ActionEventType;
    }>(),
    // downstream can emit this slot to notify ai presets that user info has been updated
    userInfo: new Subject<AIUserInfo | null>(),
    previewPanelOpenChange: new Subject<boolean>(),
    /* eslint-enable rxjs/finnish */
  };

  // track the history of triggered actions (in memory only)
  private readonly actionHistory: {
    action: keyof CanvasPresets.AIActions;
    options: CanvasPresets.AITextActionOptions;
  }[] = [];

  private userInfoFn: () => AIUserInfo | Promise<AIUserInfo> | null = () =>
    null;

  private embedding: CanvasPresets.AIEmbeddingService | null = null;

  private provideAction<T extends keyof CanvasPresets.AIActions>(
    id: T,
    action: (
      ...options: Parameters<CanvasPresets.AIActions[T]>
    ) => Promise<ReturnType<CanvasPresets.AIActions[T]>>
  ): void {
    // @ts-expect-error TODO: maybe fix this
    this.actions[id] = async (
      ...args: Parameters<CanvasPresets.AIActions[T]>
    ) => {
      const options = args[0];
      const slots = this.slots;
      slots.actions.next({
        action: id,
        options,
        event: 'started',
      });
      this.actionHistory.push({ action: id, options });
      if (this.actionHistory.length > AIProvider.MAX_LOCAL_HISTORY) {
        this.actionHistory.shift();
      }
      // wrap the action with slot actions
      const result: CanvasPresets.TextStream | Promise<string> =
        await action(...args);
      const isTextStream = (
        m: CanvasPresets.TextStream | Promise<string>
      ): m is CanvasPresets.TextStream =>
        Reflect.has(m, Symbol.asyncIterator);
      if (isTextStream(result)) {
        return {
          [Symbol.asyncIterator]: async function* () {
            let user = null;
            try {
              user = await AIProvider.userInfo;
              yield* result;
              slots.actions.next({
                action: id,
                options,
                event: 'finished',
              });
            } catch (err) {
              slots.actions.next({
                action: id,
                options,
                event: 'error',
              });
              if (err instanceof RequestTimeoutError) {
                slots.actions.next({
                  action: id,
                  options,
                  event: 'aborted:timeout',
                });
              } else if (err instanceof PaymentRequiredError) {
                slots.actions.next({
                  action: id,
                  options,
                  event: 'aborted:paywall',
                });
              } else if (err instanceof UnauthorizedError) {
                slots.actions.next({
                  action: id,
                  options,
                  event: 'aborted:login-required',
                });
              } else {
                slots.actions.next({
                  action: id,
                  options,
                  event: 'aborted:server-error',
                });
                captureException(err, {
                  user: { id: user?.id },
                  extra: {
                    action: id,
                    session: AIProvider.LAST_ACTION_SESSIONID,
                  },
                });
              }
              throw err;
            }
          },
        };
      } else {
        let user: any = null;
        return result
          .then(async result => {
            user = await AIProvider.userInfo;
            slots.actions.next({
              action: id,
              options,
              event: 'finished',
            });
            return result;
          })
          .catch(err => {
            slots.actions.next({
              action: id,
              options,
              event: 'error',
            });
            if (err instanceof PaymentRequiredError) {
              slots.actions.next({
                action: id,
                options,
                event: 'aborted:paywall',
              });
            } else {
              captureException(err, {
                user: { id: user?.id },
                extra: {
                  action: id,
                  session: AIProvider.LAST_ACTION_SESSIONID,
                },
              });
            }
            throw err;
          });
      }
    };
  }

  static provide(
    id: 'userInfo',
    fn: () => AIUserInfo | Promise<AIUserInfo> | null
  ): void;

  static provide(
    id: 'session',
    service: CanvasPresets.AISessionService
  ): void;

  static provide(
    id: 'context',
    service: CanvasPresets.AIContextService
  ): void;

  static provide(
    id: 'histories',
    service: CanvasPresets.AIHistoryService
  ): void;

  static provide(
    id: 'photoEngine',
    engine: CanvasPresets.AIPhotoEngineService
  ): void;

  static provide(
    id: 'forkChat',
    fn: (
      options: CanvasPresets.AIForkChatSessionOptions
    ) => string | Promise<string>
  ): void;

  static provide(id: 'onboarding', fn: (value: boolean) => void): void;

  static provide(
    id: 'embedding',
    service: CanvasPresets.AIEmbeddingService
  ): void;

  // actions:
  static provide<T extends keyof CanvasPresets.AIActions>(
    id: T,
    action: (
      ...options: Parameters<CanvasPresets.AIActions[T]>
    ) => Promise<ReturnType<CanvasPresets.AIActions[T]>>
  ): void;

  static provide(id: unknown, action: unknown) {
    if (id === 'userInfo') {
      AIProvider.instance.userInfoFn = action as () => AIUserInfo;
    } else if (id === 'histories') {
      AIProvider.instance.histories =
        action as CanvasPresets.AIHistoryService;
    } else if (id === 'session') {
      AIProvider.instance.session =
        action as CanvasPresets.AISessionService;
    } else if (id === 'context') {
      AIProvider.instance.context =
        action as CanvasPresets.AIContextService;
    } else if (id === 'photoEngine') {
      AIProvider.instance.photoEngine =
        action as CanvasPresets.AIPhotoEngineService;
    } else if (id === 'onboarding') {
      AIProvider.instance.toggleGeneralAIOnboarding = action as (
        value: boolean
      ) => void;
    } else if (id === 'forkChat') {
      AIProvider.instance.forkChat = action as (
        options: CanvasPresets.AIForkChatSessionOptions
      ) => string | Promise<string>;
    } else if (id === 'embedding') {
      AIProvider.instance.embedding =
        action as CanvasPresets.AIEmbeddingService;
    } else {
      AIProvider.instance.provideAction(id as any, action as any);
    }
  }
}
