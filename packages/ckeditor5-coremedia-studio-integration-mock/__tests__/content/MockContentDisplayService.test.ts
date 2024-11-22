import { serviceAgent } from "@coremedia/service-agent";
import { createContentDisplayServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
import MockContentDisplayService from "../../src/content/MockContentDisplayService";
import { testShouldRetrieveValuesThat } from "./ObservableTestUtil";
import { first } from "rxjs/operators";

describe("MockContentDisplayService", () => {
  describe("serviceAgent Integration", () => {
    const service = new MockContentDisplayService();
    serviceAgent.registerService(service);

    test("Should be able to retrieve mock service.", () => {
      expect.hasAssertions();
      return expect(serviceAgent.fetchService(createContentDisplayServiceDescriptor())).resolves.toMatchObject(service);
    });
  });

  describe("name(UriPath): Promise<string>", () => {
    it("should provide some static name by default containing the ID", () => {
      const service = new MockContentDisplayService();
      return expect(service.name("content/42")).resolves.toMatch(/.*42.*/);
    });
  });

  describe("observe_asLink(UriPath): Observable<ContentAsLink>", () => {
    const service = new MockContentDisplayService();
    const observable = service.observe_asLink("content/42").pipe(first());

    testShouldRetrieveValuesThat(
      "should provide some static content representation by default",
      observable,
      (values) => {
        const result = values.pop();
        expect(result?.content?.name).toMatch(/.*42.*/);
        expect(result?.type?.name).toStrictEqual("Document");
        expect(result?.type?.classes).toContain("icon--document-document");
        expect(result?.state?.name).toStrictEqual("Checked In");
        expect(result?.state?.classes).toContain("icon--checked-in");
      },
    );
  });
});
