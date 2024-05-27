<script lang="ts">
  let data = {};
</script>

<div class="my-toast {data.type}">
  <button on:click={data.remove}>Close</button>
  <p class="title">{data.title}</p>
  <hr />
  <p class="description">{data.description}</p>
  <div>
    <slot>Some other content here.</slot>
  </div>
</div>

<style>
  .my-toast {
    height: 100px;
  }
</style>
