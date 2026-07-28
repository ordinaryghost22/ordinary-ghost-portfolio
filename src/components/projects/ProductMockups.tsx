import { cn } from '@/lib/utils'

/** Stylized product UIs — stand in for screenshots until real captures land. */

/** Archive cover — login photography for AI Repair SaaS */
export function IRepairLoginMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center bg-[#090909] px-6 py-8 sm:px-10',
        className,
      )}
    >
      <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
        <div className="text-center">
          <div className="text-[15px] font-medium tracking-[-0.03em] text-[#FAFAFA] sm:text-[16px]">
            iRepair
          </div>
          <div className="mt-1.5 text-[11px] tracking-[-0.01em] text-[#6B7280]">
            Sign in to your operations desk
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <div className="rounded-[12px] border border-white/[0.08] bg-[#111111] px-3.5 py-2.5">
            <div className="text-[9px] tracking-[0.08em] text-[#6B7280] uppercase">
              Email
            </div>
            <div className="mt-1 text-[12px] text-[#A1A1AA]">
              owner@irepair.shop
            </div>
          </div>
          <div className="rounded-[12px] border border-white/[0.08] bg-[#111111] px-3.5 py-2.5">
            <div className="text-[9px] tracking-[0.08em] text-[#6B7280] uppercase">
              Password
            </div>
            <div className="mt-1 tracking-[0.2em] text-[#A1A1AA]">••••••••</div>
          </div>
        </div>

        <div className="mt-4 rounded-[12px] border border-white/[0.1] bg-[#FAFAFA] px-3.5 py-2.5 text-center text-[12px] font-medium tracking-[-0.01em] text-[#090909]">
          Sign in
        </div>

        <div className="mt-5 text-center text-[10px] text-[#6B7280]">
          Secure access · Role-aware
        </div>
      </div>
    </div>
  )
}

export function IRepairMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full w-full text-[10px] text-[#A1A1AA] sm:text-[11px]',
        className,
      )}
    >
      {/* Sidebar */}
      <aside className="flex w-[28%] flex-col border-r border-white/[0.06] bg-[#0c0c0c] p-3 sm:p-4">
        <div className="mb-5 text-[12px] font-medium tracking-[-0.02em] text-[#FAFAFA] sm:text-[13px]">
          iRepair
        </div>
        {['Overview', 'Bookings', 'Leads', 'Chat', 'Settings'].map(
          (item, i) => (
            <div
              key={item}
              className={cn(
                'mb-1 rounded-[12px] px-2.5 py-2',
                i === 1
                  ? 'bg-white/[0.06] text-[#FAFAFA]'
                  : 'text-[#6B7280]',
              )}
            >
              {item}
            </div>
          ),
        )}
        <div className="mt-auto rounded-[12px] border border-white/[0.06] p-2.5">
          <div className="text-[9px] tracking-[0.08em] text-[#6B7280] uppercase">
            AI status
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[#FAFAFA]">
            <span className="size-1.5 rounded-full bg-[#FAFAFA]/70" />
            Online
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[13px] font-medium tracking-[-0.02em] text-[#FAFAFA] sm:text-[15px]">
              Today’s bookings
            </div>
            <div className="mt-0.5 text-[#6B7280]">12 scheduled · 3 waiting</div>
          </div>
          <div className="rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[#FAFAFA]">
            + New booking
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { v: '24', l: 'Active leads' },
            { v: '89%', l: 'Fill rate' },
            { v: '4.8m', l: 'Avg reply' },
          ].map((stat) => (
            <div
              key={stat.l}
              className="rounded-[14px] border border-white/[0.06] bg-[#111111] p-2.5 sm:p-3"
            >
              <div className="text-[14px] font-medium tracking-[-0.03em] text-[#FAFAFA] sm:text-[16px]">
                {stat.v}
              </div>
              <div className="mt-0.5 text-[9px] text-[#6B7280]">{stat.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex-1 space-y-2 overflow-hidden sm:mt-4">
          {[
            { name: 'Screen repair — Ayesha', time: '10:30', tag: 'Confirmed' },
            { name: 'Battery swap — Hassan', time: '11:15', tag: 'AI booked' },
            { name: 'Diagnostic — Omar', time: '13:00', tag: 'Pending' },
          ].map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between gap-2 rounded-[12px] border border-white/[0.06] bg-[#111111]/80 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="truncate text-[#FAFAFA]">{row.name}</div>
                <div className="text-[#6B7280]">{row.time}</div>
              </div>
              <div className="shrink-0 rounded-full border border-white/[0.08] px-2 py-0.5 text-[9px] text-[#A1A1AA]">
                {row.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TutorMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full w-full text-[10px] text-[#A1A1AA] sm:text-[11px]',
        className,
      )}
    >
      <aside className="flex w-[32%] flex-col border-r border-white/[0.06] bg-[#0c0c0c] p-3 sm:p-4">
        <div className="text-[12px] font-medium tracking-[-0.02em] text-[#FAFAFA] sm:text-[13px]">
          Class 10 · Physics
        </div>
        <div className="mt-1 text-[#6B7280]">Textbook index</div>
        <div className="mt-4 space-y-1">
          {['Ch 1 — Motion', 'Ch 2 — Force', 'Ch 3 — Work', 'Ch 4 — Waves'].map(
            (ch, i) => (
              <div
                key={ch}
                className={cn(
                  'rounded-[12px] px-2.5 py-2',
                  i === 1
                    ? 'bg-white/[0.06] text-[#FAFAFA]'
                    : 'text-[#6B7280]',
                )}
              >
                {ch}
              </div>
            ),
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="text-[13px] font-medium tracking-[-0.02em] text-[#FAFAFA] sm:text-[15px]">
          Ask from the chapter
        </div>
        <div className="mt-3 flex-1 space-y-3 overflow-hidden">
          <div className="max-w-[90%] rounded-[14px] rounded-tl-sm border border-white/[0.06] bg-[#111111] px-3 py-2.5 text-[#FAFAFA]">
            Explain Newton’s second law using the examples in Chapter 2.
          </div>
          <div className="ml-auto max-w-[92%] rounded-[14px] rounded-tr-sm border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-[#A1A1AA]">
            From your textbook: force equals mass times acceleration. When a
            2 kg cart is pushed with 6 N…
            <div className="mt-2 text-[9px] text-[#6B7280]">
              Source · Ch 2 §2.3
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-[14px] border border-white/[0.08] bg-[#111111] px-3 py-2.5 text-[#6B7280]">
          Ask a syllabus question…
        </div>
      </div>
    </div>
  )
}

export function OrdinaryGhostMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col justify-center bg-[#0a0a0a] px-6 py-8 sm:px-10',
        className,
      )}
    >
      <div className="text-[10px] tracking-[0.14em] text-[#6B7280] uppercase">
        Ordinary Ghost
      </div>
      <div className="mt-6 text-[clamp(1.25rem,3vw,1.75rem)] font-medium leading-[1.1] tracking-[-0.03em] text-[#FAFAFA]">
        Built slowly.
        <br />
        Meant to last.
      </div>
      <div className="mt-4 max-w-[32ch] text-[11px] leading-[1.55] text-[#A1A1AA]">
        Software for businesses that cannot afford quiet failures.
      </div>
      <div className="mt-6 flex gap-2">
        <div className="rounded-[12px] bg-[#FAFAFA] px-3 py-2 text-[10px] font-medium text-[#0a0a0a]">
          See the work
        </div>
        <div className="rounded-[12px] border border-white/15 px-3 py-2 text-[10px] font-medium text-[#FAFAFA]">
          Resume
        </div>
      </div>
    </div>
  )
}
