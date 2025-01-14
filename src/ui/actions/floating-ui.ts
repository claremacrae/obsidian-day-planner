import {
  autoUpdate,
  computePosition,
  ComputePositionConfig,
} from "@floating-ui/dom";
import type { SvelteComponentTyped } from "svelte";
import { get, writable } from "svelte/store";

interface FloatingUiOptions<Props> {
  when: boolean;
  Component: typeof SvelteComponentTyped<Props>;
  props: Props;
  options: Partial<ComputePositionConfig>;
}

function isEventRelated(event: MouseEvent, otherNode: HTMLElement) {
  return (
    event.relatedTarget &&
    (event.relatedTarget === otherNode ||
      (event.relatedTarget instanceof Node &&
        otherNode.contains(event.relatedTarget)))
  );
}

export function floatingUi<Props>(
  anchor: HTMLElement,
  options: FloatingUiOptions<Props>,
) {
  let floatingUiWrapper: HTMLDivElement;
  let componentInstance: SvelteComponentTyped<Props>;
  let cleanUpAutoUpdate: () => void;
  let initialized = false;
  let currentOptions = options;

  const hoveringOverUi = writable(false);

  function init() {
    if (initialized || !currentOptions.when) {
      return;
    }

    initialized = true;

    floatingUiWrapper = document.createElement("div");

    floatingUiWrapper.addEventListener(
      "mouseenter",
      handleFloatingUiMouseEnter,
    );
    floatingUiWrapper.addEventListener(
      "mouseleave",
      handleFloatingUiMouseLeave,
    );

    document.body.appendChild(floatingUiWrapper);
    Object.assign(floatingUiWrapper.style, {
      position: "absolute",
      width: "max-content",
      top: 0,
      left: 0,
    });

    componentInstance = new currentOptions.Component({
      target: floatingUiWrapper,
      props: currentOptions.props,
      intro: true,
    });

    cleanUpAutoUpdate = autoUpdate(anchor, floatingUiWrapper, () => {
      computePosition(anchor, floatingUiWrapper, currentOptions.options).then(
        ({ x, y }) => {
          Object.assign(floatingUiWrapper.style, {
            left: `${x}px`,
            top: `${y}px`,
          });
        },
      );
    });
  }

  function onDestroy() {
    if (!initialized) {
      return;
    }

    Object.assign(floatingUiWrapper.style, {
      transition: "opacity 200ms",
      opacity: 0,
    });

    floatingUiWrapper.addEventListener("transitionend", () => {
      if (!initialized) {
        return;
      }

      initialized = false;

      cleanUpAutoUpdate();

      floatingUiWrapper.removeEventListener(
        "mouseenter",
        handleFloatingUiMouseEnter,
      );
      floatingUiWrapper.removeEventListener(
        "mouseleave",
        handleFloatingUiMouseLeave,
      );

      componentInstance.$destroy();
    });
  }

  function handleFloatingUiMouseEnter() {
    hoveringOverUi.set(true);
  }

  function handleFloatingUiMouseLeave(event: MouseEvent) {
    if (anchor && !isEventRelated(event, anchor)) {
      hoveringOverUi.set(false);
    }
  }

  function handleAnchorMouseEnter() {
    hoveringOverUi.set(true);
    init();
  }

  function handleAnchorMouseLeave(event: MouseEvent) {
    if (floatingUiWrapper && !isEventRelated(event, floatingUiWrapper)) {
      hoveringOverUi.set(false);
    }
  }

  anchor.addEventListener("mouseenter", handleAnchorMouseEnter);
  anchor.addEventListener("mouseleave", handleAnchorMouseLeave);
  window.addEventListener("blur", handleAnchorMouseLeave);

  const unsubscribe = hoveringOverUi.subscribe((isHovering) => {
    if (isHovering) {
      if (floatingUiWrapper) {
        Object.assign(floatingUiWrapper.style, {
          transition: "none",
          opacity: 1,
        });
      }
    } else {
      onDestroy();
    }
  });

  return {
    destroy() {
      onDestroy();
      unsubscribe();

      anchor.removeEventListener("mouseenter", handleAnchorMouseEnter);
      anchor.removeEventListener("mouseleave", handleAnchorMouseLeave);
      window.removeEventListener("blur", handleAnchorMouseLeave);
    },
    update(options: FloatingUiOptions<Props>) {
      currentOptions = options;

      if (currentOptions.when && get(hoveringOverUi)) {
        if (initialized) {
          componentInstance?.$set(currentOptions.props);
        } else {
          init();
        }
      } else {
        onDestroy();
      }
    },
  };
}
