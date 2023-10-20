import { ExampleData } from "../ExampleData";
import { inlineFormatData } from "./InlineFormatData";
import { welcomeTextData } from "./WelcomeTextData";
import { challengingData } from "./ChallengingData";
import { securityChallengeData } from "./SecurityChallengeData";
import { codeBlockData } from "./BBCodeCodeData";
import { colorData } from "./BBCodeColorData";
import { headingData } from "./BBCodeHeadingData";
import { simpleData } from "./SimpleData";
import { listData } from "./BBCodeListData";
import { quoteData } from "./BBCodeQuoteData";
import { paragraphData } from "./BBCodeParagraphData";

export const bbCodeData: ExampleData = {
  ...challengingData,
  ...codeBlockData,
  ...colorData,
  ...headingData,
  ...inlineFormatData,
  ...listData,
  ...paragraphData,
  ...quoteData,
  ...securityChallengeData,
  ...simpleData,
  ...welcomeTextData,
};
