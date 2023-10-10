import { ExampleData } from "../ExampleData";
import { inlineFormatData } from "./InlineFormatData";
import { welcomeTextData } from "./WelcomeTextData";
import { challengingData } from "./ChallengingData";
import { securityChallengeData } from "./SecurityChallengeData";
import { codeBlockData } from "./BBCodeCodeData";

export const bbCodeData: ExampleData = {
  ...challengingData,
  ...codeBlockData,
  ...inlineFormatData,
  ...securityChallengeData,
  ...welcomeTextData,
};
