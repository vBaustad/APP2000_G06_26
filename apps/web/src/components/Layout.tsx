import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
    return(
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <header className="border-b bg-white">
                <nav className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                        isActive ? "font-semibold text-blue-600" : "text-gray-700 hover:text-gray-900"
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                        isActive ? "font-semibold text-blue-600" : "text-gray-700 hover:text-gray-900"
                        }
                    >
                        Login
                    </NavLink>
                </nav>
            </header>
            
            <main className="mx-auto max-w-5xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}