export const useClipboard = () => (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = text

  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.position = 'fixed'

  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  document.execCommand('copy')
  document.body.removeChild(textarea)
}
