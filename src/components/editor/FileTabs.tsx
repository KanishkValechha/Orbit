import { cn } from "../../lib/utils";

interface FileTab {
	id: string;
	name: string;
	language: string;
	isActive?: boolean;
}

interface FileTabsProps {
	tabs: FileTab[];
	activeId: string;
	onTabClick: (id: string) => void;
	onTabClose?: (id: string) => void;
	className?: string;
}

export function FileTabs({
	tabs,
	activeId,
	onTabClick,
	onTabClose,
	className,
}: FileTabsProps) {
	return (
		<div className={cn("flex items-center gap-0.5 overflow-x-auto", className)}>
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					onClick={() => onTabClick(tab.id)}
					className={cn(
						"group flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap",
						tab.id === activeId
							? "text-white border-cyan-400 bg-white/5"
							: "text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.02]",
					)}
				>
					<span>{tab.name}</span>
					{tabs.length > 1 && onTabClose && (
						<span
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && onTabClose(tab.id)}
							onClick={(e) => {
								e.stopPropagation();
								onTabClose(tab.id);
							}}
							className={cn(
								"ml-1 p-0.5 rounded transition-colors",
								"opacity-0 group-hover:opacity-100",
								"hover:bg-white/10",
							)}
							aria-label={`Close ${tab.name}`}
						>
							<svg
								className="w-3 h-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</span>
					)}
				</button>
			))}
		</div>
	);
}
