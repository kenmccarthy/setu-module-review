import { z } from 'zod'

/** Enum of option values plus '' for "not yet answered". */
export function scale<T extends string>(
  options: readonly { value: T }[],
): z.ZodType<'' | T, '' | T | undefined> {
  const values = ['', ...options.map((o) => o.value)] as [string, ...string[]]
  return z.enum(values).default('') as unknown as z.ZodType<'' | T, '' | T | undefined>
}

export const str = () => z.string().default('')
export const strList = () => z.array(z.string()).default([])

export const CapabilitySchema = z.object({
  id: z.string(),
  label: z.string(),
  custom: z.boolean().default(false),
})
export type Capability = z.infer<typeof CapabilitySchema>
