import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import appCss from "../styles.css?url";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Orbit - JavaScript & TypeScript Playground",
			},
			{
				name: "description",
				content:
					"A fast, beautiful playground for JavaScript and TypeScript with real-time execution, multiple themes, and instant sharing.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "preconnect",
				href: "https://cdn.jsdelivr.net",
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%2300c6fb"/><stop offset="100%25" style="stop-color:%23005bea"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(%23g)"/><path d="M30 62V38l12 12-12 12zm22-24v24l12-12-12-12z" fill="white" opacity="0.95"/></svg>',
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="bg-black">
				<ConvexProvider client={convex}>
					{children}
				</ConvexProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
