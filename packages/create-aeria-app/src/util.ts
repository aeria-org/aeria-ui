import { spawn } from 'child_process'

export type Tuple = string | string[] extends infer Value
  ? [Value] | [undefined, Value]
  : never

export const error = (value: string | string[]): Tuple => [value]
export const success = (value: string | string[]): Tuple => [,value]
export const isError = (tuple: Tuple) => !!tuple[0]
export const unwrap = (tuple: Tuple) => tuple[0] || tuple[1]

export const $ = async (
  cmd: string | string[],
  options: {
    stdout?: boolean
    stderr?: boolean
  } = {},
) => {
  const result = spawn('sh', [
    '-c',
    Array.isArray(cmd)
      ? cmd.join(';')
      : cmd,
  ])

  if( options.stdout ) {
    result.stdout.pipe(process.stdout)
  }

  if (options.stderr !== false) {
    result.stderr.pipe(process.stderr)
  }

  const stdout: string[] = []
  for await( const chunk of result.stdout ) {
    stdout.push(chunk.toString())
  }

  return stdout.join('\n').trim()
}

export enum LogLevel {
  Info = 'info',
  Error = 'error',
  Warning = 'warning',
  Debug = 'debug',
}

export const log = (level: LogLevel, value: any) => {
  console.log(
    `[${level}]`,
    Array.isArray(value)
      ? value.join('\n')
      : value,
  )
}

