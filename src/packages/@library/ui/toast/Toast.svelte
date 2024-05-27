<script >
  import { BootstrapToast , ToastContainer }  from "svelte-toasts";
</script>

<ToastContainer let:data>
      <BootstrapToast {data} />
</ToastContainer>
