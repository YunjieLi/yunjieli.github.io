import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DinosaurGame() {
  return (
    <div className="flex flex-col h-dvh">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-background shrink-0">
        <h1 className="text-lg font-bold leading-none">Running dinosaur 🦖</h1>
        <span className="text-sm text-muted-foreground">
          Inspired by{' '}
          <a
            href="https://codepen.io/MysticReborn/pen/rygqao"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'h-auto p-0 text-sm')}
          >
            codepen
          </a>
        </span>
      </header>
      <iframe
        src="/dinosaur-game/game.html"
        className="flex-1 w-full border-none"
        title="Dinosaur Game"
      />
    </div>
  )
}
