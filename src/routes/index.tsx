import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Code2,
	Palette,
	Share2,
	Sparkles,
	Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
	const features = [
		{
			icon: <Code2 className="w-6 h-6 text-cyan-400" />,
			title: "Monaco Editor",
			description:
				"Full TypeScript & JavaScript support with IntelliSense, error highlighting, and auto-completion.",
		},
		{
			icon: <Palette className="w-6 h-6 text-purple-400" />,
			title: "8 Premium Themes",
			description:
				"VS Code, Vercel, GitHub, Monokai Pro, and Dracula themes. Light and dark modes included.",
		},
		{
			icon: <Zap className="w-6 h-6 text-amber-400" />,
			title: "Instant Execution",
			description:
				"Run code in a sandboxed iframe or Web Worker. See results in real-time.",
		},
		{
			icon: <Share2 className="w-6 h-6 text-emerald-400" />,
			title: "Share Snippets",
			description:
				"Save and share your code snippets with a unique URL. Fork and remix others' work.",
		},
	];

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />
			</div>

			<section className="relative py-24 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8">
						<Sparkles className="w-3.5 h-3.5 text-cyan-400" />
						<span>Built with TanStack Start</span>
					</div>

					<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
						<span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
							Orbit
						</span>
						<br />
						<span className="text-gray-300 text-3xl sm:text-4xl lg:text-5xl font-medium">
							JavaScript Playground
						</span>
					</h1>

					<p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
						Write, run, and share JavaScript & TypeScript code in a beautiful,
						modern editor. No setup required.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							to="/play"
							className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
						>
							Open Playground
							<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
						</Link>
						<a
							href="https://github.com"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/10 hover:border-white/20 transition-all"
						>
							View on GitHub
						</a>
					</div>
				</div>
			</section>

			<section className="relative py-16 px-6">
				<div className="max-w-5xl mx-auto">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="group p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
							>
								<div className="flex items-start gap-4">
									<div className="p-2 rounded-lg bg-white/5">
										{feature.icon}
									</div>
									<div>
										<h3 className="text-lg font-semibold text-white mb-1">
											{feature.title}
										</h3>
										<p className="text-gray-400 text-sm leading-relaxed">
											{feature.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="relative py-16 px-6">
				<div className="max-w-3xl mx-auto">
					<div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
						<div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
							<div className="flex gap-1.5">
								<div className="w-3 h-3 rounded-full bg-red-500/80" />
								<div className="w-3 h-3 rounded-full bg-amber-500/80" />
								<div className="w-3 h-3 rounded-full bg-emerald-500/80" />
							</div>
							<span className="text-xs text-gray-500 ml-2">playground.ts</span>
						</div>
						<pre className="p-4 text-sm font-mono overflow-x-auto">
							<code className="text-gray-300">
								<span className="text-purple-400">const</span>{" "}
								<span className="text-cyan-400">greeting</span> ={" "}
								<span className="text-amber-300">
									&quot;Welcome to Orbit!&quot;
								</span>
								{"\n"}
								<span className="text-purple-400">console</span>
								<span className="text-gray-400">.</span>
								<span className="text-emerald-400">log</span>(greeting)
								{"\n\n"}
								<span className="text-gray-500">{`// Start coding...`}</span>
							</code>
						</pre>
					</div>
				</div>
			</section>

			<footer className="relative py-8 px-6 border-t border-white/5">
				<div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
					<p className="text-sm text-gray-500">
						Built with TanStack Start & Monaco Editor
					</p>
					<Link
						to="/play"
						className="text-sm text-gray-400 hover:text-white transition-colors"
					>
						Start coding →
					</Link>
				</div>
			</footer>
		</div>
	);
}
