<script lang="ts">
  import ListItem from "@tiptap/extension-list-item";
  import StarterKit from "@tiptap/starter-kit";
  import { Editor } from "@tiptap/core";
  import TextStyle from "@tiptap/extension-text-style";
  import { Color } from "@tiptap/extension-color";
  import { notifications } from "@library/ui/toast/Toast";
  import { onMount } from "svelte";
  import Underline from "@tiptap/extension-underline";
  import Code from "@tiptap/extension-code";
  import {
    AttachmentsIcon,
    BoldIcon,
    BulletIcon,
    CodeIcon,
    HeadingIcon,
    ItalicsIcon,
    NumberingIcon,
    UnderlineIcon,
  } from "@library/icons";
  let showDiv = false;

  function handleSelectionChange() {
    const selection = window.getSelection();
    showDiv = selection.toString().length > 0;
  }

  function handleBlur() {
    showDiv = false;
  }

  let element: HTMLDivElement;
  let editor;
  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        Code.configure({
          HTMLAttributes: {
            class: "code-block",
          },
        }),
        Underline.configure({ types: [TextStyle.name, ListItem.name] }),
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
        TextStyle.configure({ types: [ListItem.name] }),
        StarterKit,
      ],
      content: `
              <blockquote >
           <p class="editor-content">hello world</p>
            </blockquote>
          `,
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      },
    });
  });

  let selectionText = "";

  let description: string = "";
  export let onUpdateRequestDescription;
  export let requestStateDoc;
  let textareaRef: HTMLTextAreaElement | null = null;
  let docValue = "";
  let collectionTabWrapper: HTMLElement;

  onMount(() => {
    docValue = requestStateDoc;
  });
</script>

<div class="d-flex flex-column text-fs-14" style="gap: 8px;">
  <div class="d-flex" style="justify-content: space-between;">
    <div style="font-weight: 600;">Documentation</div>
  </div>

  {#if editor}
    <div class="control-group">
      <div class="button-group">
        <button
          style="background-color: transparent; border: none; cursor: pointer;"
          on:click={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()}
          class={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
        >
          <HeadingIcon
            height={"12px"}
            width={"13px"}
            color={"var(--icon-tertiary-100)"}
          />
        </button>
        <button
          style="background-color: transparent; border: none; cursor: pointer;"
          on:click={() =>
            console.log && editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          class={editor.isActive("bold") ? "is-active" : ""}
        >
          <BoldIcon
            height={"12px"}
            width={"10px"}
            color={"var(--icon-tertiary-100)"}
          />
        </button>
        <button
          style="background-color: transparent; border: none; cursor: pointer;"
          on:click={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          class={editor.isActive("italic") ? "is-active" : ""}
        >
          <ItalicsIcon
            height={"12px"}
            width={"13px"}
            color={"var(--icon-tertiary-100)"}
          />
        </button>
        <button
          style="background-color: transparent; border: none; cursor: pointer;"
          on:click={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          class={editor.isActive("underline") ? "is-active" : ""}
        >
          <UnderlineIcon
            height={"12px"}
            width={"13px"}
            color={"var(--icon-tertiary-100)"}
          />
        </button>
        <button
          style="background-color: transparent; border: none; cursor: pointer;"
          on:click={() => editor.chain().focus().toggleOrderedList().run()}
          class={editor.isActive("orderedList") ? "is-active" : ""}
        >
          <NumberingIcon
            height={"12px"}
            width={"13px"}
            color={"var(--icon-tertiary-100)"}
          />
        </button>
        <button
          style="background-color: transparent; border: none; cursor: pointer;"
          on:click={() => editor.chain().focus().toggleBulletList().run()}
          class={editor.isActive("bulletList") ? "is-active" : ""}
        >
          <BulletIcon
            height={"12px"}
            width={"13px"}
            color={"var(--icon-tertiary-100)"}
          />
        </button>

        <button
          style="background-color: transparent; border: none; cursor: pointer;"
          on:click={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          class={editor.isActive("code") ? "is-active" : ""}
        >
          <CodeIcon
            height={"12px"}
            width={"13px"}
            color={"var(--icon-tertiary-100)"}
          />
        </button>
      </div>
    </div>
  {/if}
  <div
    class="editor-content"
    bind:this={element}
    on:mouseup={handleSelectionChange}
    on:keyup={handleSelectionChange}
    on:focusout={handleBlur}
    on:blur={() => {
      if (textareaRef) {
        onUpdateRequestDescription(description);
        notifications.success("Documentation updated");
      }
    }}
  />
</div>

<!-- {#if showDiv}
  <div class="selection-div">
    <p>Hello World</p>
  </div>
{/if} -->

<style>
  .text-area:focus {
    border: 1px solid var(--border-primary-300) !important;
  }
  .text-area:hover {
    background-color: var(--bg-secondary-450) !important;
  }

  .selection-div {
    position: absolute;
    top: 20px; /* Adjust as needed */
    left: 20px; /* Adjust as needed */
    padding: 10px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
  }
</style>
