import { contentLinkData } from "./ContentLinkData";
import { differencingData } from "./DifferencingData";
import { entitiesData } from "./EntitiesData";
import { grsData } from "./GrsData";
import { invalidData } from "./InvalidData";
import { linkTargetData } from "./LinkTargetData";
import { loremIpsumData } from "./LoremIpsumData";
import { simpleData } from "./SimpleData";
import { welcomeTextData } from "./WelcomeTextData";
import { ExampleData } from "../ExampleData";

export const richTextData: ExampleData = {
  ...contentLinkData,
  ...differencingData,
  ...entitiesData,
  ...grsData,
  ...invalidData,
  ...linkTargetData,
  ...loremIpsumData,
  ...simpleData,
  ...welcomeTextData,
};
