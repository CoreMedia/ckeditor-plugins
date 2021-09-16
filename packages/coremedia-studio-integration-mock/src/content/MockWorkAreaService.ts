import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/WorkAreaService";

class MockWorkAreaService implements WorkAreaService {
  openEntitiesInTabs(entities: Array<unknown>): Promise<unknown> {
    return new Promise((resolve: (resolve: { success: boolean }) => void): void => {
      entities = entities.map((entity: unknown): unknown => {
        const node: Element = document.createElement("DIV");
        node.classList.add("notification");
        const textnode: Text = document.createTextNode(`Open Content ${entity} in Studio Tab`);
        node.appendChild(textnode);
        document.getElementById("notifications")?.appendChild(node);
        setTimeout(() => {
          document.getElementById("notifications")?.removeChild(node);
        }, 4000);
        return entity;
      });

      resolve({ success: true });
    });
  }
  canBeOpenedInTab(): Promise<unknown> {
    throw new Error("Method not implemented.");
  }
  getName(): string {
    return "workAreaService";
  }
}

export default MockWorkAreaService;
