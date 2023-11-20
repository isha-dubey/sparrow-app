import { writable } from "svelte/store";

const user = writable(null);
export const username = writable("");
export const isLoading = writable(false);
export const isResponseError = writable(false);
export const loginStatus = writable(false);

const setUser = (data) => {
  user.set(data);
};

export { setUser, user };
