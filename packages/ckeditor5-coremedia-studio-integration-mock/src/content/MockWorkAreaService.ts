import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/WorkAreaService";

class MockWorkAreaService implements WorkAreaService {
  async openEntitiesInTabs(entities: unknown[]): Promise<unknown> {
    entities.forEach((entity: unknown): void => {
      const node: Element = document.createElement("DIV");
      node.classList.add("notification");
      const textnode: Text = document.createTextNode(`Open Content ${entity} in Studio Tab`);
      node.appendChild(textnode);
      document.getElementById("notifications")?.appendChild(node);
      setTimeout(() => {
        document.getElementById("notifications")?.removeChild(node);
      }, 4000);
    });

    return { success: true };
  }

  async canBeOpenedInTab(): Promise<unknown> {
    throw new Error("Method not implemented.");
  }
  getName(): string {
    return "workAreaService";
  }
}

export default MockWorkAreaService;
