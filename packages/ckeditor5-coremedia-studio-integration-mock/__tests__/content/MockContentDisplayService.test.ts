import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import MockContentDisplayService from "../../src/content/MockContentDisplayService";
import ContentAsLink from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentAsLink";

describe("MockContentDisplayService", () => {
  describe("serviceAgent Integration", () => {
    const service = new MockContentDisplayService();
    serviceAgent.registerService(service);

    test("Should be able to retrieve mock service.", () => {
      expect.hasAssertions();
      return expect(
        serviceAgent.fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
      ).resolves.toMatchObject(service);
    });
  });

  describe("name(UriPath): Promise<string>", () => {
    it("should provide some static name by default containing the ID", () => {
      const service = new MockContentDisplayService();
      return expect(service.name("content/42")).resolves.toMatch(/.*42.*/);
    });
  });

  describe("observe_asLink(UriPath): Observable<ContentAsLink>", () => {
    it("should provide some static content representation by default", (done) => {
      const service = new MockContentDisplayService();

      let result: ContentAsLink | undefined = undefined;

      service.observe_asLink("content/42").subscribe({
        next: (received: ContentAsLink) => (result = received),
        error: (error: unknown) => {
          done(error);
        },
        complete: () => {
          // The following checks are more about "have any result" and may be
          // adapted, if the actual result changes.
          expect(result?.content?.name).toMatch(/.*42.*/);
          expect(result?.type?.name).toStrictEqual("Document");
          expect(result?.type?.classes).toContain("icon--document-document");
          expect(result?.state?.name).toStrictEqual("Checked In");
          expect(result?.state?.classes).toContain("icon--checked-in");
          done();
        },
      });
    });
  });
});
