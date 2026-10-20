import type { ImportMatch } from '../../logic/v2/exchange'

/**
 * Decide whether to apply an incoming packet given how it relates to the one already held.
 * Returns the message to show and whether to go ahead. Replacing anything asks first.
 */
export function confirmImport(
  match: ImportMatch,
  name: string,
  heldAt: string | undefined,
  kept: string,
): { apply: boolean; message: string } {
  const held = heldAt ? new Date(heldAt).toLocaleString() : 'earlier'
  switch (match) {
    case 'new':
      return { apply: true, message: `Added ${name}.` }
    case 'same':
      return { apply: false, message: `Already up to date: ${name}. Nothing was changed.` }
    case 'newer': {
      const apply = confirm(
        `A newer version of ${name} is in this file.\n\nReplace the version imported ${held}? ${kept}`,
      )
      return {
        apply,
        message: apply ? `Updated ${name}.` : `Kept the existing version of ${name}.`,
      }
    }
    case 'older': {
      const apply = confirm(
        `This file holds an OLDER version of ${name} than the one imported ${held}.\n\nReplace it with the older version? ${kept}`,
      )
      return {
        apply,
        message: apply
          ? `Replaced ${name} with the older version.`
          : `Kept the newer version of ${name}.`,
      }
    }
  }
}
