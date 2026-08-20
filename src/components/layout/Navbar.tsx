import { useEffect, useState } from 'react'
import { brand } from '@/data/brand'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'bg-sand/90 backdrop-blur-md border-b border-ink/5'
          : 'bg-transparent'
      }`}
    >
      <nav
        className="container-wide flex items-center justify-between gap-4 px-5 md:px-8 py-4"
        aria-label="Navegação principal"
      >
        <a
          href="#home"
          className="display text-xl md:text-2xl text-cobalt tracking-tight shrink-0"
        >
          WE ARE ENGLISH
        </a>

        <ul className="hidden lg:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {brand.nav.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="group relative text-[11px] font-semibold tracking-[0.2em] uppercase text-ink/75 hover:text-cobalt transition-colors"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-cobalt transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Button href={brand.studentArea.href} variant="primary" className="!py-2.5 !px-5 !text-xs">
            {brand.studentArea.label}
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden>
            <span
              className={`h-0.5 bg-ink transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
            />
            <span className={`h-0.5 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span
              className={`h-0.5 bg-ink transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
            />
          </span>
        </button>
      </nav>

      {open ? (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-ink/5 bg-sand px-5 pb-8 pt-4"
        >
          <ul className="flex flex-col gap-4">
            {brand.nav.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="block py-2 text-sm font-semibold tracking-[0.18em] uppercase"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Button
                href={brand.studentArea.href}
                className="w-full"
                onClick={() => setOpen(false)}
              >
                {brand.studentArea.label}
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  )
}
