import { NavLink } from "react-router-dom";

type NavbarVariant = "transparent" | "solid";

type NavbarProps = {
  variant?: NavbarVariant;
};



export default function Navbar({ variant = "solid" }: NavbarProps) {
    const isTransparent = variant === "transparent";

    const headerClass = isTransparent
        ? "absolute top-0 left-0 w-full z-20 bg-transparent text-white"
        : "relative w-full z-20 bg-white/90 backdrop-blur border-b border-gray-200 text-gray-900";

    const linkBase = "transition font-medium";
    const linkClass = ({ isActive }: { isActive: boolean }) => {
        if (isTransparent) {
        return `${linkBase} ${isActive ? "text-white" : "text-white/80 hover:text-white"}`;
        }
        return `${linkBase} ${isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`;
    };
    return(
        <>        
            <header className={headerClass}>
                <nav className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="h-12 w-16 rounded-md bg-emerald-600 text-white flex items-center justify-center font-semibold">
                            UTOPIA
                        </div>
                    </div>
                    <ul className="hidden md:flex items-center gap-8 font-medium">
                        <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
                        <li><NavLink to="/map" className={linkClass}>Kart</NavLink></li>
                        <li><NavLink to="/explore" className={linkClass}>Utforsker</NavLink></li>
                        <li><NavLink to="/me" className={linkClass}>Mine turer</NavLink></li>
                        <li><NavLink to="/login" className={linkClass}>Logg inn</NavLink></li>
                    </ul>
                </nav>
            </header>            
        </>
    );
}