import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/play/$id")({
	component: () => <Navigate to="/play" />,
});
