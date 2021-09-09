function global(obj) {
  for (const k in obj) {
    window[k] = obj[k];
  }
}

export { global };
