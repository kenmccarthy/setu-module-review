import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HELP_INTRO, HELP_SECTIONS, type HelpBlock } from '../content/help'
import { Callout, PageTitle, Section } from '../components/fields'

export function HelpPage() {
  const { hash } = useLocation()

  // The app uses hash routing, so a section anchor cannot be a plain "#id" link and the browser
  // never scrolls to it by itself. Links carry the anchor as the route's own hash instead.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <>
      <PageTitle title="Help & Guide" lede={HELP_INTRO} />

      <nav
        aria-label="Contents"
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contents</h2>
        <ol className="mt-2 grid list-decimal gap-1 pl-5 text-sm sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-6">
          {HELP_SECTIONS.map((s) => (
            <li key={s.id}>
              <Link className="text-brand-700 hover:underline" to={`/help#${s.id}`}>
                {s.heading}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {HELP_SECTIONS.map((s) => (
        <Section key={s.id} id={s.id} title={s.heading}>
          {s.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </Section>
      ))}
    </>
  )
}

function Block({ block }: { block: HelpBlock }) {
  switch (block.kind) {
    case 'p':
      return <p className="text-sm text-slate-700">{block.text}</p>
    case 'ul':
      return (
        <ul className="list-disc space-y-1 pl-6 text-sm text-slate-700">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case 'steps':
      return (
        <dl className="space-y-3">
          {block.items.map((item) => (
            <div key={item.title}>
              <dt className="text-sm font-semibold text-slate-900">{item.title}</dt>
              <dd className="text-sm text-slate-700">{item.text}</dd>
            </div>
          ))}
        </dl>
      )
    case 'note':
      return (
        <Callout title={block.title} tone="note">
          <p>{block.text}</p>
        </Callout>
      )
    case 'faq':
      return (
        <dl className="divide-y divide-slate-100">
          {block.items.map((item) => (
            <div key={item.q} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold text-slate-900">{item.q}</dt>
              <dd className="mt-0.5 text-sm text-slate-700">{item.a}</dd>
            </div>
          ))}
        </dl>
      )
  }
}
