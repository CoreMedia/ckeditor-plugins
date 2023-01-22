export const causes = ["invalid", "invalidAtParent", "mustNotBeEmpty"];
export type Cause = typeof causes[number];
export const severeCauses: Exclude<Cause, "mustNotBeEmpty">[] = ["invalid", "invalidAtParent"];
