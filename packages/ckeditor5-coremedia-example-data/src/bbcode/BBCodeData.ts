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
import { linkData } from "./BBCodeUrlData";
import { imgData } from "./BBCodeImgData";
import { sizeData } from "./BBCodeSizeData";

export const bbCodeData: ExampleData = {
  ...challengingData,
  ...codeBlockData,
  ...colorData,
  ...headingData,
  ...imgData,
  ...inlineFormatData,
  ...linkData,
  ...listData,
  ...paragraphData,
  ...quoteData,
  ...securityChallengeData,
  ...simpleData,
  ...sizeData,
  ...welcomeTextData,
};
