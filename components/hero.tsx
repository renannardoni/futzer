import { Search } from "lucide-react";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Encontre a quadra perfeita para seu jogo
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Alugue campos de futebol society, grama ou salão perto de você. Rápido, fácil e seguro.
          </p>
          <div className="flex items-center gap-2 rounded-full bg-background p-2 shadow-lg">
            <Search className="ml-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cidade ou bairro..."
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Buscar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
