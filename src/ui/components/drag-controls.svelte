<script lang="ts">
  import {
    FoldVertical,
    ArrowDownToLine,
    GripVertical,
    Copy,
  } from "lucide-svelte";

  import BlockControlButton from "./block-control-button.svelte";
  import ExpandingControls from "./expanding-controls.svelte";

  export let onMove: () => void;
  export let onMoveWithNeighbors: () => void | undefined = undefined;
  export let onCopy: () => void | undefined = undefined;
  export let onMoveWithShrink: () => void | undefined = undefined;
</script>

<ExpandingControls --right="4px" --top="4px">
  <BlockControlButton
    slot="visible"
    cursor="grab"
    label="Start moving"
    on:mousedown={onMove}
  >
    <GripVertical class="svg-icon" />
  </BlockControlButton>
  <svelte:fragment slot="hidden">
    {#if onCopy}
      <BlockControlButton
        cursor="grab"
        label="Start copying"
        on:mousedown={onCopy}
      >
        <Copy class="svg-icon" />
      </BlockControlButton>
    {/if}
    {#if onMoveWithNeighbors}
      <BlockControlButton
        cursor="grab"
        label="Move block and push neighboring blocks"
        on:mousedown={onMoveWithNeighbors}
      >
        <ArrowDownToLine class="svg-icon" />
      </BlockControlButton>
    {/if}
    {#if onMoveWithShrink}
      <BlockControlButton
        cursor="grab"
        label="Move block and shrink neighboring blocks"
        on:mousedown={onMoveWithShrink}
      >
        <FoldVertical class="svg-icon" />
      </BlockControlButton>
    {/if}
  </svelte:fragment>
</ExpandingControls>
