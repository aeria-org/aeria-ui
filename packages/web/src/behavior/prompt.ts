export type PromptAction = {
  name: string
  title: string
  variant?:
    | 'primary'
    | 'danger'
  click?: (answer: PromptAction)=> void
}
