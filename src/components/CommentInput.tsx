import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { currentUserQueryOptions } from "#/lib/query.options.ts";

export function CommentInput({
	onSubmit,
	placeholder = "Add a comment…",
}: {
	onSubmit: (content: string) => void;
	placeholder?: string;
}) {
	const [value, setValue] = useState("");
	const { data: user } = useQuery(currentUserQueryOptions);

	const submit = () => {
		const trimmed = value.trim();
		if (!trimmed) return;
		onSubmit(trimmed);
		setValue("");
	};

	return (
		<div className="flex items-center gap-3 border-t border-border px-4 py-3">
			{user?.avatarUrl ? (
				<img
					src={user.avatarUrl}
					alt=""
					className="h-8 w-8 rounded-full object-cover"
				/>
			) : (
				<div className="h-8 w-8 rounded-full bg-secondary" />
			)}
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						submit();
					}
				}}
				placeholder={placeholder}
				data-testid="comment-input"
				className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
			/>
			{value.trim() && (
				<button
					type="button"
					data-testid="comment-submit"
					onClick={submit}
					className="text-sm font-semibold text-accent hover:opacity-80 transition-opacity duration-200"
				>
					Post
				</button>
			)}
		</div>
	);
}
