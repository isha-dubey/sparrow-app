<script>
  import { ToastContainer, BootstrapToast } from "svelte-toasts";
  import MyToast from "./MyToast.svelte";
</script>

<button on:click={showToast}>Show Toast</button>
<ToastContainer {toasts} let:data>
  <div class="my-toast {data.type}">
    <button on:click={data.remove}>Close</button>
    <p class="title">{data.title}</p>
    <hr />
    <p class="description">{data.description}</p>
    <div>
      <MyToast {data} />
    </div>
  </div>
</ToastContainer>
