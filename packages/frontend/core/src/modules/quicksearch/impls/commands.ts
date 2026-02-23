import {
  type NexioCommand,
  NexioCommandRegistry,
  type CommandCategory,
  PreconditionStrategy,
} from '@nexio/core/commands';
import type { DocMode } from '@blocksuite/nexio/model';
import { Entity, LiveData } from '@ezeslucky/infra';
import Fuse from 'fuse.js';

import type { GlobalContextService } from '../../global-context';
import type { QuickSearchSession } from '../providers/quick-search-provider';
import type { QuickSearchGroup } from '../types/group';
import type { QuickSearchItem } from '../types/item';
import { highlighter } from '../utils/highlighter';

const categories = {
  'nexio:recent': {
    id: 'command:nexio:recent',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.nexio.recent' },
    score: 10,
  },
  'nexio:navigation': {
    id: 'command:nexio:navigation',
    label: {
      i18nKey: 'com.nexio.cmdk.nexio.category.nexio.navigation',
    },
    score: 10,
  },
  'nexio:creation': {
    id: 'command:nexio:creation',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.nexio.creation' },
    score: 10,
  },
  'nexio:general': {
    id: 'command:nexio:general',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.nexio.general' },
    score: 10,
  },
  'nexio:layout': {
    id: 'command:nexio:layout',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.nexio.layout' },
    score: 10,
  },
  'nexio:pages': {
    id: 'command:nexio:pages',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.nexio.pages' },
    score: 10,
  },
  'nexio:edgeless': {
    id: 'command:nexio:edgeless',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.nexio.edgeless' },
    score: 10,
  },
  'nexio:collections': {
    id: 'command:nexio:collections',
    label: {
      i18nKey: 'com.nexio.cmdk.nexio.category.nexio.collections',
    },
    score: 10,
  },
  'nexio:settings': {
    id: 'command:nexio:settings',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.nexio.settings' },
    score: 10,
  },
  'nexio:updates': {
    id: 'command:nexio:updates',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.nexio.updates' },
    score: 10,
  },
  'nexio:help': {
    id: 'command:nexio:help',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.nexio.help' },
    score: 10,
  },
  'editor:edgeless': {
    id: 'command:editor:edgeless',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.editor.edgeless' },
    score: 10,
  },
  'editor:insert-object': {
    id: 'command:editor:insert-object',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.editor.insert-object' },
    score: 10,
  },
  'editor:page': {
    id: 'command:editor:page',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.editor.page' },
    score: 10,
  },
  'nexio:results': {
    id: 'command:nexio:results',
    label: { i18nKey: 'com.nexio.cmdk.nexio.category.results' },
    score: 10,
  },
} satisfies Required<{
  [key in CommandCategory]: QuickSearchGroup & { id: `command:${key}` };
}>;

function filterCommandByContext(
  command: NexioCommand,
  context: {
    docMode: DocMode | undefined;
  }
) {
  if (command.preconditionStrategy === PreconditionStrategy.Always) {
    return true;
  }
  if (command.preconditionStrategy === PreconditionStrategy.InEdgeless) {
    return context.docMode === 'edgeless';
  }
  if (command.preconditionStrategy === PreconditionStrategy.InPaper) {
    return context.docMode === 'page';
  }
  if (command.preconditionStrategy === PreconditionStrategy.InPaperOrEdgeless) {
    return !!context.docMode;
  }
  if (command.preconditionStrategy === PreconditionStrategy.Never) {
    return false;
  }
  if (typeof command.preconditionStrategy === 'function') {
    return command.preconditionStrategy();
  }
  return true;
}

function getAllCommand(context: { docMode: DocMode | undefined }) {
  const commands = NexioCommandRegistry.getAll();
  return commands.filter(command => {
    return filterCommandByContext(command, context);
  });
}

export class CommandsQuickSearchSession
  extends Entity
  implements QuickSearchSession<'commands', NexioCommand>
{
  constructor(private readonly contextService: GlobalContextService) {
    super();
  }

  query$ = new LiveData('');

  items$ = LiveData.computed(get => {
    const query = get(this.query$);
    const docMode =
      get(this.contextService.globalContext.docMode.$) ?? undefined;
    const commands = getAllCommand({ docMode });

    const fuse = new Fuse(commands, {
      keys: [{ name: 'label.title', weight: 2 }, 'label.subTitle'],
      includeMatches: true,
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.0,
    });

    const result = query
      ? fuse.search(query)
      : commands.map(item => ({ item, matches: [], score: 0 }));

    return result.map<QuickSearchItem<'commands', NexioCommand>>(
      ({ item, matches, score = 1 }) => {
        const normalizedRange = ([start, end]: [number, number]) =>
          [
            start,
            end + 1 /* in fuse, the `end` is different from the `substring` */,
          ] as [number, number];
        const titleMatches = matches
          ?.filter(match => match.key === 'label.title')
          .flatMap(match => match.indices.map(normalizedRange));
        const subTitleMatches = matches
          ?.filter(match => match.key === 'label.subTitle')
          .flatMap(match => match.indices.map(normalizedRange));

        return {
          id: 'command:' + item.id,
          source: 'commands',
          label: {
            title:
              highlighter(
                item.label.title,
                '<b>',
                '</b>',
                titleMatches ?? []
              ) ?? item.label.title,
            subTitle: item.label.subTitle
              ? (highlighter(
                  item.label.subTitle,
                  '<b>',
                  '</b>',
                  subTitleMatches ?? []
                ) ?? item.label.subTitle)
              : undefined,
          },
          group: categories[item.category],
          score:
            1 -
            score /* in fuse, the smaller the score, the better the match, so we need to reverse it */,
          icon: item.icon,
          keyBinding: item.keyBinding?.binding,
          payload: item,
        };
      }
    );
  });

  query(query: string) {
    this.query$.next(query);
  }
}
