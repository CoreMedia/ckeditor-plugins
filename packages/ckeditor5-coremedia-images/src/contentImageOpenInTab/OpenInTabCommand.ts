import { Command } from "@ckeditor/ckeditor5-core";
import { serviceAgent } from "@coremedia/service-agent";
import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/WorkAreaService";
import WorkAreaServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/WorkAreaServiceDescriptor";
import { requireContentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

//TODO: Where to put this general command?
export default class OpenInTabCommand extends Command {
  override execute(...options: unknown[]): void {
    if (!options) {
      return;
    }

    if (!(options.length > 0)) {
      return;
    }

    const uriPath = requireContentUriPath(options[0] as string);
    serviceAgent
      .fetchService<WorkAreaService>(new WorkAreaServiceDescriptor())
      .then((workAreaService: WorkAreaService): void => {
        workAreaService.openEntitiesInTabs([uriPath]);
      })
      .catch((): void => {
        console.warn("WorkArea Service not available");
      });
  }
}
