import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import * as React from "react";
import { useTheme } from "#/components/theme-provider.tsx";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const shouldReduce = useReducedMotion();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => setMounted(true), []);

	// Resolve current visual theme (handles 'system')
	const isDark = React.useMemo(() => {
		if (!mounted) return false;
		if (theme === "dark") return true;
		if (theme === "light") return false;
		// system → check media + document class (script in theme-provider adds class)
		return (
			document.documentElement.classList.contains("dark") ||
			window.matchMedia("(prefers-color-scheme: dark)").matches
		);
	}, [theme, mounted]);

	// Keep in sync with system changes when theme === 'system' (optional, not required for binary toggle)
	React.useEffect(() => {
		if (theme !== "system") return;
		const m = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => {
			// force re-render by toggling mounted? use dummy state
			setMounted((v) => !v);
			// revert
			setTimeout(() => setMounted((v) => !v), 0);
		};
		m.addEventListener("change", handler);
		return () => m.removeEventListener("change", handler);
	}, [theme]);

	const toggle = () => {
		// Binary flip — never sets 'system' anymore (matches project request)
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<motion.button
			type="button"
			onClick={toggle}
			aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			aria-pressed={isDark}
			title={isDark ? "Light" : "Dark"}
			className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground hover:border-foreground hover:bg-secondary hover:text-secondary-foreground pressable cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background will-change-transform"
			whileHover={
				shouldReduce ? undefined : { scale: 1.04, rotate: isDark ? -6 : 6 }
			}
			whileTap={shouldReduce ? undefined : { scale: 0.93 }}
			transition={{ type: "spring", stiffness: 420, damping: 22 }}
		>
			<span className="sr-only">Toggle theme</span>
			{/* Animated icon swap — Jakub §5: opacity + scale + blur */}
			<AnimatePresence mode="wait" initial={false}>
				{isDark ? (
					<motion.span
						key="moon"
						initial={
							shouldReduce
								? { opacity: 0 }
								: { opacity: 0, scale: 0.72, filter: "blur(4px)", rotate: -18 }
						}
						animate={
							shouldReduce
								? { opacity: 1 }
								: { opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }
						}
						exit={
							shouldReduce
								? { opacity: 0 }
								: { opacity: 0, scale: 0.72, filter: "blur(4px)", rotate: 18 }
						}
						transition={{
							type: "spring",
							duration: 0.38,
							bounce: 0,
						}}
						className="absolute inset-0 grid place-items-center"
						aria-hidden
					>
						<Moon size={16} strokeWidth={2} />
					</motion.span>
				) : (
					<motion.span
						key="sun"
						initial={
							shouldReduce
								? { opacity: 0 }
								: { opacity: 0, scale: 0.72, filter: "blur(4px)", rotate: 18 }
						}
						animate={
							shouldReduce
								? { opacity: 1 }
								: { opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }
						}
						exit={
							shouldReduce
								? { opacity: 0 }
								: { opacity: 0, scale: 0.72, filter: "blur(4px)", rotate: -18 }
						}
						transition={{
							type: "spring",
							duration: 0.38,
							bounce: 0,
						}}
						className="absolute inset-0 grid place-items-center"
						aria-hidden
					>
						<Sun size={16} strokeWidth={2} />
					</motion.span>
				)}
			</AnimatePresence>

			{/* Subtle accent ring on hover — CSS only, no motion borderColor (hsl(var) not animatable) */}
			<span
				className="pointer-events-none absolute inset-0 rounded-full border border-transparent group-hover:border-border transition-colors duration-200"
				aria-hidden
			/>
		</motion.button>
	);
}
