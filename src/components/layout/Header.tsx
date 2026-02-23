import { Link } from "@tanstack/react-router";
import { Code2, Home, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-black/80 backdrop-blur-xl border-b border-white/5">
				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden"
						aria-label="Open menu"
					>
						<Menu size={20} className="text-gray-400" />
					</button>

					<Link to="/" className="flex items-center gap-2.5 group">
						<div className="relative">
							<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
								<Code2 className="w-4.5 h-4.5 text-white" />
							</div>
						</div>
						<span className="text-lg font-semibold text-white tracking-tight">
							Orbit
						</span>
					</Link>
				</div>

				<nav className="hidden md:flex items-center gap-1">
					<Link
						to="/play"
						className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
						activeProps={{
							className:
								"px-4 py-2 text-sm font-medium text-white bg-white/5 rounded-lg",
						}}
					>
						Playground
					</Link>
					<a
						href="https://github.com"
						target="_blank"
						rel="noopener noreferrer"
						className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
					>
						GitHub
					</a>
				</nav>

				<div className="flex items-center gap-2">
					<Link
						to="/play"
						className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
					>
						<Code2 className="w-4 h-4" />
						Open Playground
					</Link>
				</div>
			</header>

			<aside
				className={`fixed top-0 left-0 h-full w-72 bg-black/95 backdrop-blur-xl text-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-r border-white/5 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-4 border-b border-white/5">
					<div className="flex items-center gap-2.5">
						<div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center">
							<Code2 className="w-3.5 h-3.5 text-white" />
						</div>
						<span className="font-semibold">Orbit</span>
					</div>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="p-2 hover:bg-white/5 rounded-lg transition-colors"
						aria-label="Close menu"
					>
						<X size={18} className="text-gray-400" />
					</button>
				</div>

				<nav className="flex-1 p-3 overflow-y-auto">
					<div className="space-y-1">
						<Link
							to="/"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
							activeProps={{
								className:
									"flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/5",
							}}
						>
							<Home size={18} />
							<span className="font-medium">Home</span>
						</Link>

						<Link
							to="/play"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
							activeProps={{
								className:
									"flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/5",
							}}
						>
							<Code2 size={18} />
							<span className="font-medium">Playground</span>
						</Link>
					</div>
				</nav>

				<div className="p-4 border-t border-white/5">
					<p className="text-xs text-gray-500">
						A modern JavaScript/TypeScript playground
					</p>
				</div>
			</aside>

			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</>
	);
}
