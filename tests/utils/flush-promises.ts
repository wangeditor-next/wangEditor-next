export default function flushPromises() {
  return new Promise(resolve => {
    setTimeout(resolve, 0)
  })
}
