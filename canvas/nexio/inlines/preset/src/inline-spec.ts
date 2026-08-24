import type { NexioTextAttributes } from '@canvas/nexio-shared/types';
import {
  type InlineRootElement,
  InlineSpecExtension,
} from '@canvas/std/inline';
import type { ExtensionType } from '@canvas/store';
import { html } from 'lit';
import { z } from 'zod';

export type NexioInlineRootElement = InlineRootElement<NexioTextAttributes>;

export const BoldInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>({
    name: 'bold',
    schema: z.object({
      bold: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.bold;
    },
    renderer: ({ delta }) => {
      return html`<nexio-text .delta=${delta}></nexio-text>`;
    },
  });

export const ItalicInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>({
    name: 'italic',
    schema: z.object({
      italic: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.italic;
    },
    renderer: ({ delta }) => {
      return html`<nexio-text .delta=${delta}></nexio-text>`;
    },
  });

export const UnderlineInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>({
    name: 'underline',
    schema: z.object({
      underline: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.underline;
    },
    renderer: ({ delta }) => {
      return html`<nexio-text .delta=${delta}></nexio-text>`;
    },
  });

export const StrikeInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>({
    name: 'strike',
    schema: z.object({
      strike: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.strike;
    },
    renderer: ({ delta }) => {
      return html`<nexio-text .delta=${delta}></nexio-text>`;
    },
  });

export const CodeInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>({
    name: 'inline-code',
    schema: z.object({
      code: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.code;
    },
    renderer: ({ delta }) => {
      return html`<nexio-text .delta=${delta}></nexio-text>`;
    },
  });

export const BackgroundInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>({
    name: 'background',
    schema: z.object({
      background: z.string().optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.background;
    },
    renderer: ({ delta }) => {
      return html`<nexio-text .delta=${delta}></nexio-text>`;
    },
  });

export const ColorInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>({
    name: 'color',
    schema: z.object({
      color: z.string().optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.color;
    },
    renderer: ({ delta }) => {
      return html`<nexio-text .delta=${delta}></nexio-text>`;
    },
  });

export const InlineSpecExtensions: ExtensionType[] = [
  BoldInlineSpecExtension,
  ItalicInlineSpecExtension,
  UnderlineInlineSpecExtension,
  StrikeInlineSpecExtension,
  CodeInlineSpecExtension,
  BackgroundInlineSpecExtension,
  ColorInlineSpecExtension,
];
