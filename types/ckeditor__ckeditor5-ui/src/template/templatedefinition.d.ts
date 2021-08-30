/**
 * A basic TemplateDefinition class.
 */
export default class TemplateDefinition {
  constructor(def: any);

  attributes?: object;
  children?: TemplateDefinition[];
  on?: object;
  tag?: string;
  text?: string | string[];

}
