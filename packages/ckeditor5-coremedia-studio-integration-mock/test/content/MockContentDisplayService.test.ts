import test, { describe } from "node:test";
import expect from "expect";
import { first } from "rxjs/operators";
import MockContentDisplayService from "../../src/content/MockContentDisplayService";
import { retrieveValuesUntilComplete } from "./ObservableTestUtil";

void describe("MockContentDisplayService", () => {
  void describe("name(UriPath): Promise<string>", () => {
    void test("should provide some static name by default containing the ID", async () => {
      const service = new MockContentDisplayService();
      const result = await service.name("content/42");
      expect(result).toMatch(/.*42.*/);
    });
  });
  void describe("observe_asLink(UriPath): Observable<ContentAsLink>", async () => {
    const service = new MockContentDisplayService();
    const observable = service.observe_asLink("content/42", 10).pipe(first());

    await test("should provide some static content representation by default", async () => {
      const values = await retrieveValuesUntilComplete(observable);
      const result = values.pop();
      expect(result?.content?.name).toMatch(/.*42.*/);
      expect(result?.type?.name).toStrictEqual("Document");
      expect(result?.type?.classes).toContain("icon--document-document");
      expect(result?.state?.name).toStrictEqual("Checked In");
      expect(result?.state?.classes).toContain("icon--checked-in");
    });
  });
});
