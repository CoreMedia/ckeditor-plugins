import { ExampleData } from "../ExampleData";
import { bbCode } from "./BBCode";

const lines = (...texts: string[]): string => texts.join("");

const htmlEntity = {
  lsqb: {
    raw: `[`,
    dec: `&#91;`,
    hex: `&#x5B;`,
    named: `&lsqb;`,
  },
  rsqb: {
    raw: `]`,
    dec: `&#93;`,
    hex: `&#x5D;`,
    named: `&rsqb;`,
  },
  gt: {
    raw: `>`,
    dec: `&#62;`,
    hex: `&#x3E;`,
    named: `&gt;`,
  },
  lt: {
    raw: `<`,
    dec: `&#60;`,
    hex: `&#x3C;`,
    named: `&lt;`,
  },
};

/**
 * Same possible challenges to BBCode to HTML and vice versa processing.
 *
 * @see [XSS Filter Evasion – OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html)
 */
export const securityChallengeData: ExampleData = {
  "Security: Escaping in BBCode": lines(
    `${bbCode.h1("Security: Escaping in BBCode")}`,
    `${bbCode.p(`Lorem \\[b\\]ip\\sum\\[/b\\] dolor`)}`,
    `${bbCode.h2("Remark")}`,
    `${bbCode.p(`For safe processing we enable escaping by default. It is required, that parsers for stored BBCode apply the same escaping mechanism.`)}`,
  ),
  "Security: Inline HTML in BBCode": lines(
    `${bbCode.h1("Security: Inline HTML in BBCode")}`,
    `${bbCode.p(`Lorem <strong>ipsum</strong> dolor`)}`,
  ),
  "Security: Escaped Inline HTML in BBCode (Decimal)": lines(
    `${bbCode.h1("Security: Escaped Inline HTML in BBCode (Decimal)")}`,
    `${bbCode.p(`Lorem ${htmlEntity.lt.dec}strong${htmlEntity.gt.dec}ipsum${htmlEntity.lt.dec}/strong${htmlEntity.gt.dec} dolor`)}`,
  ),
  "Security: Escaped Inline HTML in BBCode (Hexadecimal)": lines(
    `${bbCode.h1("Security: Escaped Inline HTML in BBCode (Hexadecimal)")}`,
    `${bbCode.p(`Lorem ${htmlEntity.lt.hex}strong${htmlEntity.gt.hex}ipsum${htmlEntity.lt.hex}/strong${htmlEntity.gt.hex} dolor`)}`,
  ),
  "Security: Escaped Inline HTML in BBCode (Named)": lines(
    `${bbCode.h1("Security: Escaped Inline HTML in BBCode (Named)")}`,
    `${bbCode.p(`Lorem ${htmlEntity.lt.named}strong${htmlEntity.gt.named}ipsum${htmlEntity.lt.named}/strong${htmlEntity.gt.named} dolor`)}`,
  ),
  "Security: Square Bracket HTML Entity in BBCode (Decimal)": lines(
    `${bbCode.h1("Security: Square Bracket HTML Entity in BBCode (Decimal)")}`,
    `Lorem ${htmlEntity.lsqb.dec}b${htmlEntity.rsqb.dec}ipsum${htmlEntity.lsqb.dec}/b${htmlEntity.rsqb.dec} dolor`,
  ),
  "Security: Square Bracket HTML Entity in BBCode (Hexadecimal)": lines(
    `${bbCode.h1("Security: Square Bracket HTML Entity in BBCode (Hexadecimal)")}`,
    `Lorem ${htmlEntity.lsqb.hex}b${htmlEntity.rsqb.hex}ipsum${htmlEntity.lsqb.hex}/b${htmlEntity.rsqb.hex} dolor`,
  ),
  "Security: Square Bracket HTML Entity in BBCode (Named)": lines(
    `${bbCode.h1("Security: Square Bracket HTML Entity in BBCode (Named)")}`,
    `Lorem ${htmlEntity.lsqb.named}b${htmlEntity.rsqb.named}ipsum${htmlEntity.lsqb.named}/b${htmlEntity.rsqb.named} dolor`,
  ),
};
