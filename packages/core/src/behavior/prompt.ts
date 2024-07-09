export type PromptAction = {
  title: string
  variant?:
    | 'primary'
    | 'danger'
  click?: (answer: string, action: PromptAction)=> void
}
