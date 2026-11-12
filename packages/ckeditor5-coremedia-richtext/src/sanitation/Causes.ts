export const elementCauses = ["invalid", "invalidAtParent", "mustNotBeEmpty"];
export type ElementCause = (typeof elementCauses)[number];
export const severeElementCauses: Exclude<ElementCause, "mustNotBeEmpty">[] = ["invalid", "invalidAtParent"];

export const attributeCauses = ["invalidAtElement", "invalidValue"];
export type AttributeCause = (typeof attributeCauses)[number];
