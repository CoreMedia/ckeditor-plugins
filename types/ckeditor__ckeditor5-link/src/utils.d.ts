import Node from "@ckeditor/ckeditor5-engine/src/view/node";
import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import AttributeElement from "@ckeditor/ckeditor5-engine/src/view/attributeelement";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import { LinkDecoratorDefinition } from "./link";
import Element from "@ckeditor/ckeditor5-engine/src/model/element";
import Schema from "@ckeditor/ckeditor5-engine/src/model/schema";

export const LINK_KEYSTROKE: string;

export function isLinkElement(node: Node): boolean;

export function createLinkElement(href: string, conversionApi: DowncastConversionApi): AttributeElement;

export function ensureSafeUrl(url: any): string;

export function getLocalizedDecorators(t: Locale, decorators: Array<LinkDecoratorDefinition>): Array<LinkDecoratorDefinition>;

export function normalizeDecorators(decorators: { [key: string]: LinkDecoratorDefinition }): Array<LinkDecoratorDefinition>;

export function isImageAllowed(element: Element, schema: Schema): boolean;

export function isEmail(value: string): boolean;

export function addLinkProtocolIfApplicable(link: string, defaultProtocol: string): boolean;
