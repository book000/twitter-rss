/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'cycle' {
  export function decycle(object: any): any
  export function retrocycle(json: any): any
}
