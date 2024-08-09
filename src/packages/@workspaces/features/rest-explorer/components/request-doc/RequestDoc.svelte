<script lang="ts">
  import { notifications } from "@library/ui/toast/Toast";
  import { afterUpdate, onMount, onDestroy } from "svelte";
  import { getContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  // import {AffineSchemas{}}
  import {
    AffineEditorContainer,
    PageEditor,
    EdgelessEditor,
  } from "@isha-dubey/presets";
  // import { Doc, Schema, DocCollection, Text, Job } from "@isha-dubey/store";
  // import { AffineSchemas } from "@isha-dubey/blocksuite-sparrow";
  // import {} from "@isha-dubey/blocksuite-sparrow/packages/blocks";
  // import { AffineSchemas } from "@blocksuite/blocks";
  // import { Html } from "@blocksuite/blocks";
  // import { HtmlAdapter } from "@blocksuite/blocks";
  // import "@blocksuite/presets/themes/affine.css";
  import { editor } from "monaco-editor";
  import "@app/styles/style.css";
  import TextButton from "$lib/components/buttons/TextButton.svelte";

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
      const surfaceId = doc.addBlock("affine:code", {}, pageBlockId);
      const noteId = doc.addBlock("affine:note", {}, pageBlockId);
      doc.addBlock(
        "affine:paragraph",
        {
          text: new Text("isha"),
        },
        surfaceId,
      );
      doc.addBlock(
        "affine:embed-html",
        { html: "<h1>hello world</h1>" },
        surfaceId,
      );
    });

    const editor = new PageEditor();
    editor.doc = doc;
    console.log(doc);

    // editor.innerHTML = `<div>helloo</div>`;
    // const paras = doc.getBlockByFlavour("affine:paragraph");
    // const htmlContent = `<div>helloo</div>`;

    // console.log("p", paras);
    // const para = paras[0];
    // const text = new Html(htmlContent);
    // const adapt = new HtmlAdapter(collection);
    // const job = new Job({ collection });
    // const modelB = doc.getBlockById(htmlId);
    // doc.updateBlock(modelB, {type: 'h1'});

    // doc.updateBlock(para, { text: new Text("<p>text</p>") });
    // console.log(doc);
    // const adapt = new HtmlAdapter(job);
    // adapt.fromDoc(doc);
    // console.log("para----------->", paras);
    // doc.

    return { editor, collection };
  }

  const appState = writable(initEditor());
  let editorContainer: HTMLDivElement;

  onMount(() => {
    appState.subscribe(({ editor }) => {
      if (editorContainer) {
        editorContainer.appendChild(editor);
      }
    });
  });
</script>

<div class="d-flex flex-column text-fs-14" style="gap: 8px;">
  <div class="d-flex" style="justify-content: space-between;">
    <div style="font-weight: 600;">Documentation</div>
  </div>

  <div bind:this={editorContainer} class="editor-container"></div>
</div>

<!-- on:blur={() => {
  if (textareaRef) {
    onUpdateRequestDescription(description);
    notifications.success("Documentation updated");
  }
}} -->

<style>
  :global(.affine-format-bar-widget) {
    gap: 0px !important;
  }
</style>
