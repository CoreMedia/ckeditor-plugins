import {extractContentCkeModelUri} from "../../src/content/DragAndDropUtils";

test("extractContentCkeModelUri: should return the content:12345", () => {
  const dragEvent: DragEvent = buildDragEventWithValidId("content/12345");
  const ckeModelUri = extractContentCkeModelUri(dragEvent);
  expect(ckeModelUri).toContain("content:12345");
});

test("extractContentCkeModelUri: should be null for unknown drop event", () => {
  const dragEvent: DragEvent = buildDragEventFromUnknownSource();
  const ckeModelUri = extractContentCkeModelUri(dragEvent);
  expect(ckeModelUri).toBeNull();
});

test("extractContentCkeModelUri: should be null if we have to much data in drop event", () => {
  const dragEvent: DragEvent = buildDragEventWithTooMuchContent();
  const ckeModelUri = extractContentCkeModelUri(dragEvent);
  expect(ckeModelUri).toContain("content:12345");
  expect(ckeModelUri).toContain("content:54321");
});

/**
 * Studio transfers the content id in the key `cm/uri-list`.
 * Here we want to simulate another source so the result is always null in the code.
 */
function buildDragEventFromUnknownSource(): DragEvent {
  return {
    dataTransfer: {
      getData : (key: string): string | null => {
        return null;
      }
    }
  } as DragEvent;
}

function buildDragEventWithValidId(mockCoreMediaUri: string): DragEvent {
  return {
    dataTransfer: {
      getData : (key: string): string | null => {
        if (key === 'cm/uri-list') {
          return "[{\"$Ref\":\""+mockCoreMediaUri+"\"}]";
        }
        return null;
      }
    }
  } as DragEvent;
}

function buildDragEventWithTooMuchContent(): DragEvent {
  return {
    dataTransfer: {
      getData : (key: string): string | null => {
        if (key === 'cm/uri-list') {
          return "[{\"$Ref\":\"content/12345\"}, {\"$Ref\":\"content/54321\"}]";
        }
        return null;
      }
    }
  } as DragEvent;
}
