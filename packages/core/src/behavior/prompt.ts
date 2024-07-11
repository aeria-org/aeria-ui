export type PromptOption = {
  title: string
  variant?:
    | 'primary'
    | 'danger'
  click?: (answer: string, action: PromptOption)=> void
}
