<script lang="ts">
  import { notifications } from "@library/ui/toast/Toast";
  import { afterUpdate, onMount, onDestroy } from "svelte";
  import { getContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import {
    AffineEditorContainer,
    PageEditor,
    EdgelessEditor,
  } from "@blocksuite/presets";
  import { Doc, Schema, DocCollection } from "@blocksuite/store";
  import { AffineSchemas } from "@blocksuite/blocks";
  import "@blocksuite/presets/themes/affine.css";
  // import "@blocksuite/presets/themes/edgeless.css";

  export let onUpdateRequestDescription;
  export let requestStateDoc;
  let description: string = "";
  let textareaRef: HTMLTextAreaElement | null = null;
  let docValue = "";

  interface AppState {
    editor: AffineEditorContainer;
    collection: DocCollection;
  }

  function initEditor(): AppState {
    const schema = new Schema().register(AffineSchemas);
    const collection = new DocCollection({ schema });
    collection.meta.initialize();

    const doc = collection.createDoc({ id: "page1" });
    doc.load(() => {
      const pageBlockId = doc.addBlock("affine:page", {});
      doc.addBlock("affine:surface", {}, pageBlockId);
      const noteId = doc.addBlock("affine:note", {}, pageBlockId);
      doc.addBlock("affine:paragraph", {}, noteId);
    });

    const editor = new PageEditor();
    editor.doc = doc;

    return { editor, collection };
  }

  const appState = writable(initEditor());
  let editorContainer: HTMLDivElement;

  onMount(() => {
    console.log("as", appState);
    appState.subscribe(({ editor }) => {
      console.log("dfgh", editor);
      if (editorContainer) {
        editorContainer.appendChild(editor);
      }
    });
  });

  afterUpdate(() => {
    console.log("asf");
  });

  onDestroy(() => {
    appState.subscribe(({ editor }) => {
      console.log("onDestroyedvalued---------", editor);
    });
  });
</script>

<div class="d-flex flex-column text-fs-14" style="gap: 8px;">
  <div class="d-flex" style="justify-content: space-between;">
    <div style="font-weight: 600;">Documentation</div>
  </div>

  <div
    on:blur={() => {
      if (textareaRef) {
        onUpdateRequestDescription(description);
        notifications.success("Documentation updated");
      }
    }}
    bind:this={editorContainer}
    class="editor-container"
  ></div>
</div>

<style>
</style>
