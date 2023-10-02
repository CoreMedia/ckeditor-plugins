import { ExampleData } from "../ExampleData";
import { inlineFormatData } from "./InlineFormatData";
import { welcomeTextData } from "./WelcomeTextData";
import { challengingData } from "./ChallengingData";

export const bbCodeData: ExampleData = {
  ...challengingData,
  ...inlineFormatData,
  ...welcomeTextData,
};
