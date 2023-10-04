import { ExampleData } from "../ExampleData";
import { inlineFormatData } from "./InlineFormatData";
import { welcomeTextData } from "./WelcomeTextData";
import { challengingData } from "./ChallengingData";
import { securityChallengeData } from "./SecurityChallengeData";

export const bbCodeData: ExampleData = {
  ...challengingData,
  ...inlineFormatData,
  ...securityChallengeData,
  ...welcomeTextData,
};
