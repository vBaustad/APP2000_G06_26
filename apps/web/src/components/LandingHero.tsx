/**
 * Fil: LandingHero.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Hero-komponent for forsiden med bakgrunnsbilde, overskrift og søkefelt.
 */

export default function LandingHero() {
    return(
        <section className="relative h-[70vh] w-full">      
            {/* Background image */}
            <img
                src="/images/hero-background.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full items-center justify-center px-4">
                <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-semibold text-center max-w-5xl leading-tight">
                    Finn din neste tur
                </h1>
                <h2 className="mt-6 text-white/90 text-xl md:text-2xl lg:text-3xl font-medium text-center max-w-3xl">
                    Utforsk turforslag, kart og aktiviteter i Utopia
                </h2>

                <form className="mt-10 w-full max-w-3xl">
                    <div className="flex items-center gap-3 rounded-full bg-white/95 backdrop-blur px-4 py-3 shadow-lg">
                    <input
                        type="text"
                        placeholder="Søk etter sted, tur eller hytte…"
                        className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-500 text-lg md:text-xl px-2 py-2"
                    />
                    <button
                        type="submit"
                        className="shrink-0 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 transition"
                    >
                        Søk
                    </button>
                    </div>
                </form>
            </div>
        </section>
    );
}