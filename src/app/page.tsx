import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight">kgame</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-300">
        Repasa Ética y Legislación en TI jugando en tiempo real.
      </p>
      <footer className="absolute bottom-6 text-sm text-zinc-500">
        <Link href="/privacidad" className="underline">
          Aviso de privacidad
        </Link>
      </footer>
    </main>
  );
}
