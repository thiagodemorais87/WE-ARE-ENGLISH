import { brand } from '@/data/brand'
import { teacher } from '@/data/teacher'

export function Footer() {
  return (
    <footer className="border-t border-ink/8 bg-sand section-pad !py-14">
      <div className="container-brand grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="display text-3xl text-cobalt">WE ARE ENGLISH</p>
          <p className="mt-2 text-xs font-semibold tracking-[0.22em] uppercase text-cherry">
            INGLÊS PARTICULAR
          </p>
          <p className="mt-4 text-sm text-muted">SÃO PAULO · BRAZIL</p>
          <p className="mt-1 text-sm text-muted">15 ANOS EM NEW YORK</p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ink/50 mb-4">
            Navegar
          </p>
          <ul className="space-y-2">
            {[...brand.nav, brand.studentArea].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-sm text-ink/80 hover:text-cobalt transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ink/50 mb-4">
            Contato
          </p>
          <ul className="space-y-2">
            <li>
              <a href={teacher.instagram} className="text-sm hover:text-cobalt transition-colors">
                INSTAGRAM
              </a>
            </li>
            <li>
              <a href={teacher.whatsapp} className="text-sm hover:text-cobalt transition-colors">
                WHATSAPP
              </a>
            </li>
            <li>
              <a
                href={`mailto:${teacher.email}`}
                className="text-sm hover:text-cobalt transition-colors"
              >
                E-MAIL
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-brand mt-12 pt-6 border-t border-ink/8 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-muted tracking-[0.12em] uppercase">
        <p>© 2026 WE ARE ENGLISH</p>
        <p>Inglês Particular · São Paulo</p>
      </div>
    </footer>
  )
}
