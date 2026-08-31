import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	MotionConfig,
	motion,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "motion/react";
import {
	ArrowRight,
	Camera,
	Compass,
	MessageCircle,
	Sparkle,
	Sparkles,
} from "lucide-react";
import * as React from "react";
import { ModeToggle } from "#/components/mode-toggle.tsx";
import { MagneticButton } from "#/components/motion/MagneticButton.tsx";
import {
	Reveal,
	RevealGroup,
	RevealItem,
} from "#/components/motion/Reveal.tsx";
import { currentUserQueryOptions } from "#/lib/query.options.ts";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(
			currentUserQueryOptions,
		);
		if (user) {
			throw redirect({ to: "/feed" });
		}
	},
	component: Home,
});

function Header() {
	const [scrolled, setScrolled] = React.useState(false);
	React.useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 16);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	const shouldReduce = useReducedMotion();

	return (
		<motion.header
			className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-colors duration-200 will-change-transform ${
				scrolled
					? "bg-background/95 border-border shadow-[0_1px_0_0_hsl(var(--border)),0_8px_24px_-16px_hsl(var(--foreground)/0.14)]"
					: "bg-background/80 border-border"
			}`}
			initial={false}
			animate={{
				height: scrolled ? 56 : 64,
			}}
			transition={{ type: "spring", stiffness: 380, damping: 32 }}
			style={{ transformOrigin: "top" } as React.CSSProperties}
		>
			<div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-full flex items-center justify-between">
				<Link
					to={"/"}
					data-testid="landing-logo"
					className="flex items-center gap-2 group"
					aria-label="Zivra home"
				>
					<motion.div
						className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center pressable"
						whileHover={shouldReduce ? undefined : { rotate: 6, scale: 1.06 }}
						whileTap={shouldReduce ? undefined : { scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 18 }}
					>
						<motion.div
							animate={shouldReduce ? undefined : { rotate: [0, 0, 0] }}
							transition={{ duration: 6, repeat: Infinity, repeatDelay: 2.5 }}
						>
							<Sparkle
								size={16}
								strokeWidth={2}
								className="text-accent-foreground"
							/>
						</motion.div>
					</motion.div>
					<span className="font-display text-xl font-bold tracking-tight">
						Zivra<span className="text-accent">.</span>
					</span>
				</Link>

				<nav
					className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium"
					aria-label="Primary"
				>
					<a
						href="#features"
						className="nav-link hover:text-foreground transition-colors duration-200 cursor-pointer"
					>
						Features
					</a>
					<a
						href="#manifesto"
						className="nav-link hover:text-foreground transition-colors duration-200 cursor-pointer"
					>
						Manifesto
					</a>
					<a
						href="#voices"
						className="nav-link hover:text-foreground transition-colors duration-200 cursor-pointer"
					>
						Voices
					</a>
				</nav>

				<div className="flex items-center gap-3">
					<ModeToggle />
					<Link
						to="/signin"
						data-testid="landing-signin-btn"
						className="hidden sm:inline-flex items-center px-4 h-10 rounded-full text-sm font-semibold border border-border hover:border-foreground pressable cursor-pointer"
					>
						Sign in
					</Link>
					<Link
						to="/signup"
						data-testid="landing-signup-btn"
						className="group inline-flex items-center gap-1.5 px-4 h-10 rounded-full text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 hover:text-background pressable cursor-pointer"
					>
						Sign up{" "}
						<ArrowRight
							size={14}
							strokeWidth={2}
							className="cta-arrow"
							aria-hidden
						/>
					</Link>
				</div>
			</div>
		</motion.header>
	);
}

function HeroImages() {
	const shouldReduce = useReducedMotion();
	const ref = React.useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [-8, 8]), {
		stiffness: 90,
		damping: 20,
	});
	const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [-14, 14]), {
		stiffness: 90,
		damping: 20,
	});

	return (
		<div ref={ref} className="grid grid-cols-2 gap-3">
			<motion.div
				className="col-span-2 aspect-[4/5] rounded-2xl overflow-hidden border border-border will-change-transform"
				initial={shouldReduce ? false : { clipPath: "inset(0 0 100% 0)" }}
				whileInView={shouldReduce ? undefined : { clipPath: "inset(0 0 0 0)" }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 0.82, ease: [0.77, 0, 0.175, 1] }}
				style={shouldReduce ? undefined : { y: y1 as unknown as number }}
				whileHover={shouldReduce ? undefined : { scale: 1.015 }}
			>
				<img
					src="https://images.pexels.com/photos/31000908/pexels-photo-31000908.jpeg?w=800"
					alt="Editorial collage"
					className="w-full h-full object-cover"
					loading="eager"
					fetchPriority="high"
				/>
			</motion.div>

			<motion.div
				className="aspect-square rounded-2xl overflow-hidden border border-border will-change-transform"
				initial={shouldReduce ? false : { clipPath: "inset(0 0 100% 0)" }}
				whileInView={shouldReduce ? undefined : { clipPath: "inset(0 0 0 0)" }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{
					duration: 0.82,
					ease: [0.77, 0, 0.175, 1],
					delay: 0.08,
				}}
				style={shouldReduce ? undefined : { y: y2 as unknown as number }}
				whileHover={shouldReduce ? undefined : { scale: 1.018 }}
			>
				<img
					src="https://images.pexels.com/photos/6159262/pexels-photo-6159262.jpeg?w=600"
					alt="Studio still life"
					className="w-full h-full object-cover"
					loading="lazy"
				/>
			</motion.div>

			<motion.div
				className="aspect-square rounded-2xl overflow-hidden border border-border will-change-transform"
				initial={shouldReduce ? false : { clipPath: "inset(0 0 100% 0)" }}
				whileInView={shouldReduce ? undefined : { clipPath: "inset(0 0 0 0)" }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{
					duration: 0.82,
					ease: [0.77, 0, 0.175, 1],
					delay: 0.16,
				}}
				style={shouldReduce ? undefined : { y: y1 as unknown as number }}
				whileHover={shouldReduce ? undefined : { scale: 1.018 }}
			>
				<img
					src="https://images.pexels.com/photos/35161204/pexels-photo-35161204.jpeg?w=600"
					alt="Architectural detail"
					className="w-full h-full object-cover"
					loading="lazy"
				/>
			</motion.div>
		</div>
	);
}

function Home() {
	const marqueeWords = [
		"Editorial",
		"·",
		"Unfiltered",
		"·",
		"Slow social",
		"·",
		"Made by hand",
		"·",
		"For the makers",
		"·",
	];

	return (
		<MotionConfig
			// Jakub polish: spring bounce 0 unless playful moment; Motion respects prefers-reduced-motion automatically
			transition={{ type: "spring", bounce: 0, duration: 0.45 }}
			reducedMotion="user"
		>
			<div className="min-h-screen bg-background text-foreground overflow-x-clip">
				<Header />

				{/* Hero — staged entrance, blur+ y + opacity (cookbook §1), fill-mode both via motion.
				    Tightened vertical rhythm: pt accounts for fixed header (56/64) + 28, reduced pb, removed lg:mt-24 offset */}
				<section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-6 sm:px-10">
					<div className="max-w-[1400px] mx-auto">
						<div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
							<div className="col-span-12 lg:col-span-8">
								<Reveal delay={0.06} y={8} duration={0.42}>
									<p className="overline text-accent mb-5">
										Issue 07 — Feb 2026
									</p>
								</Reveal>

								<Reveal delay={0.12} y={14} duration={0.62}>
									<h1 className="font-display font-black text-[64px] sm:text-[96px] lg:text-[140px] leading-[0.9] tracking-tight">
										Social,
										<br />
										<span className="italic font-light">but slower.</span>
										<br />
										{/* Jhey hint — Louder gets subtle ink shimmer only when motion allowed, done via CSS var to stay GPU cheap */}
										<motion.span
											className="text-accent inline-block"
											initial={{ opacity: 0, filter: "blur(6px)" }}
											animate={{ opacity: 1, filter: "blur(0px)" }}
											transition={{
												delay: 0.42,
												duration: 0.55,
												ease: [0.16, 1, 0.3, 1],
											}}
										>
											Louder
										</motion.span>{" "}
										too.
									</h1>
								</Reveal>

								<Reveal delay={0.28} duration={0.48}>
									<p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
										Pulse is a social network for people who make things —
										photos, essays, small moments. No algorithms shouting at
										you. Just the good stuff, from people you actually care
										about.
									</p>
								</Reveal>

								<Reveal delay={0.36} duration={0.42}>
									<div className="mt-8 flex flex-wrap items-center gap-3">
										<MagneticButton
											as={Link}
											to="/signup"
											data-testid="hero-signup-btn"
											className="group inline-flex items-center gap-2 px-7 h-14 rounded-full bg-foreground text-background font-display font-semibold text-base hover:bg-foreground/90 hover:text-background pressable cursor-pointer"
											strength={0.14}
										>
											Get on Pulse{" "}
											<ArrowRight
												size={18}
												strokeWidth={2}
												className="cta-arrow"
												aria-hidden
											/>
										</MagneticButton>
										<Link
											to="/signin"
											data-testid="hero-signin-btn"
											className="group inline-flex items-center px-7 h-14 rounded-full border border-foreground/30 font-display font-semibold text-base hover:border-foreground hover:bg-secondary pressable cursor-pointer"
										>
											I already have an account
										</Link>
									</div>
								</Reveal>
							</div>

							<div className="col-span-12 lg:col-span-4 lg:mt-2">
								<HeroImages />
							</div>
						</div>
					</div>
				</section>

				{/* Marquee — continuous but pausable, decorative so fully removed under reduced motion via CSS media query */}
				<section
					className="border-y border-border py-6 overflow-hidden bg-secondary"
					aria-label="Brand words"
				>
					<div className="animate-marquee flex whitespace-nowrap font-display text-2xl sm:text-3xl font-semibold tracking-tight will-change-transform select-none">
						{[...Array(4)].map((_, k) => (
							<div
								key={k}
								className="flex items-center gap-6 mr-6"
								aria-hidden={k !== 0}
							>
								{marqueeWords.map((w, i) => (
									<span
										key={`${k}-${i}`}
										className={w === "·" ? "text-accent" : ""}
									>
										{w}
									</span>
								))}
							</div>
						))}
					</div>
				</section>

				{/* Features — scroll reveals + card hover polish (Jakub §3 shadows) */}
				<section id="features" className="py-24 px-6 sm:px-10">
					<div className="max-w-[1400px] mx-auto">
						<RevealGroup className="grid grid-cols-12 gap-6 mb-12" amount={0.2}>
							<RevealItem className="col-span-12 lg:col-span-7">
								<p className="overline text-muted-foreground mb-4">
									What&apos;s inside
								</p>
								<h2 className="font-display font-bold text-5xl sm:text-6xl tracking-tight leading-[1]">
									Everything you need. Nothing that wastes your day.
								</h2>
							</RevealItem>
						</RevealGroup>

						<RevealGroup
							className="grid grid-cols-12 gap-6"
							stagger={0.06}
							amount={0.15}
						>
							<RevealItem className="col-span-12 md:col-span-6 lg:col-span-5 lg:row-span-2">
								<FeatureCard
									className="min-h-[380px] h-full"
									icon={Camera}
									title="Stories that don't disappear"
									body="Save the good ones. Archive publicly or keep them for yourself. Your call."
									image="https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?w=800"
								/>
							</RevealItem>
							<RevealItem className="col-span-12 md:col-span-6 lg:col-span-7">
								<FeatureCard
									icon={Compass}
									title="A discover feed that respects your time"
									body="Editorial picks curated weekly — not endless doom-scroll."
								/>
							</RevealItem>
							<RevealItem className="col-span-12 md:col-span-6 lg:col-span-4">
								<FeatureCard
									icon={MessageCircle}
									title="DMs that feel like letters"
									body="Slower rhythm. No read-receipts unless you say so."
								/>
							</RevealItem>
							<RevealItem className="col-span-12 md:col-span-6 lg:col-span-3">
								<FeatureCard
									className="bg-accent text-accent-foreground border-accent"
									icon={Sparkles}
									title="Pulse Pro"
									body="Unlimited archives, custom themes, no third-party tracking. Ever."
									accent
								/>
							</RevealItem>
						</RevealGroup>
					</div>
				</section>

				{/* Manifesto — stagger list + border draw (30-50ms per ux guidelines) */}
				<section
					id="manifesto"
					className="py-24 px-6 sm:px-10 border-t border-border"
				>
					<div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
						<Reveal
							className="col-span-12 lg:col-span-4"
							y={10}
							duration={0.4}
							amount={0.3}
						>
							<p className="overline text-accent mb-4">Manifesto</p>
							<h2 className="font-display font-bold text-4xl tracking-tight">
								Six things we believe.
							</h2>
						</Reveal>

						<RevealGroup
							className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8"
							stagger={0.045}
							delayChildren={0.06}
							amount={0.2}
						>
							{[
								["01", "Feeds should serve you, not eat you."],
								["02", "Small numbers are still numbers."],
								["03", "Your data belongs to you."],
								["04", "Notifications are a privilege."],
								["05", "The best social is the one you close."],
								["06", "Design is a form of care."],
							].map(([n, t]) => (
								<RevealItem
									key={n}
									className="manifesto-rule border-t border-border pt-4 will-change-transform"
								>
									<motion.p
										className="font-mono-alt text-xs text-accent mb-2"
										initial={{ opacity: 0 }}
										whileInView={{ opacity: 1 }}
										viewport={{ once: true }}
										transition={{ duration: 0.3, delay: 0.05 }}
									>
										{n}
									</motion.p>
									<p className="font-display text-xl tracking-tight leading-snug">
										{t}
									</p>
								</RevealItem>
							))}
						</RevealGroup>
					</div>
				</section>

				{/* Voices — magnetic CTA, scale+blur enter from trigger origin */}
				<section
					id="voices"
					className="py-24 px-6 sm:px-10 border-t border-border"
				>
					<div className="max-w-[1400px] mx-auto text-center">
						<Reveal y={8} duration={0.4} amount={0.35}>
							<p className="overline text-accent mb-4">Ready?</p>
						</Reveal>
						<Reveal y={12} duration={0.5} delay={0.06} amount={0.3}>
							<h2 className="font-display font-black text-5xl sm:text-7xl tracking-tight leading-[1] max-w-3xl mx-auto">
								Come make the internet feel like{" "}
								<motion.span
									className="italic font-light inline-block"
									initial={{ opacity: 0, filter: "blur(6px)", y: 6 }}
									whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
									viewport={{ once: true, amount: 0.6 }}
									transition={{
										type: "spring",
										duration: 0.6,
										bounce: 0,
										delay: 0.12,
									}}
								>
									yours
								</motion.span>{" "}
								again.
							</h2>
						</Reveal>

						<Reveal delay={0.14} duration={0.42} amount={0.2}>
							<div className="mt-10 flex justify-center gap-3 flex-wrap">
								<MagneticButton
									as={Link}
									to="/signup"
									data-testid="cta-signup-btn"
									className="group inline-flex items-center gap-2 px-8 h-14 rounded-full bg-accent text-accent-foreground font-display font-semibold hover:opacity-90 pressable cursor-pointer"
									strength={0.16}
								>
									Create your Pulse{" "}
									<ArrowRight
										size={18}
										strokeWidth={2}
										className="cta-arrow"
										aria-hidden
									/>
								</MagneticButton>
								<Link
									to="/signin"
									data-testid="cta-signin-btn"
									className="group inline-flex items-center px-8 h-14 rounded-full border border-border font-display font-semibold hover:border-foreground pressable cursor-pointer"
								>
									Sign in
								</Link>
							</div>
						</Reveal>
					</div>
				</section>

				<motion.footer
					className="border-t border-border py-10 px-6 sm:px-10"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
						<p>© 2026 Pulse — a slower internet.</p>
						<div className="flex gap-6">
							<a
								href="#"
								className="nav-link hover:text-foreground transition-colors duration-200 cursor-pointer"
							>
								Privacy
							</a>
							<a
								href="#"
								className="nav-link hover:text-foreground transition-colors duration-200 cursor-pointer"
							>
								Terms
							</a>
							<a
								href="#"
								className="nav-link hover:text-foreground transition-colors duration-200 cursor-pointer"
							>
								Contact
							</a>
						</div>
					</div>
				</motion.footer>
			</div>
		</MotionConfig>
	);
}

export interface FeatureCardProps {
	className?: string;
	icon: React.ComponentType<{
		size?: number | string;
		strokeWidth?: number | string;
		className?: string;
	}>;
	title: React.ReactNode;
	body: React.ReactNode;
	image?: string;
	accent?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
	className = "",
	icon: Icon,
	title,
	body,
	image,
	accent,
}) => {
	const shouldReduce = useReducedMotion();
	return (
		<motion.div
			className={`feature-card group relative overflow-hidden rounded-3xl border border-border p-8 flex flex-col justify-between cursor-default ${className}`}
			whileHover={
				shouldReduce
					? undefined
					: {
							y: -2,
							transition: { type: "spring", stiffness: 380, damping: 22 },
						}
			}
			whileTap={shouldReduce ? undefined : { scale: 0.985 }}
			style={{ transformOrigin: "center bottom" } as React.CSSProperties}
		>
			{image && (
				<>
					<motion.img
						src={image}
						alt=""
						className="absolute inset-0 h-full w-full object-cover opacity-90 will-change-transform"
						whileHover={shouldReduce ? undefined : { scale: 1.04 }}
						transition={{ type: "spring", duration: 0.6, bounce: 0 }}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
				</>
			)}
			<div className={`relative ${image ? "text-white" : ""}`}>
				<motion.div
					initial={shouldReduce ? false : { scale: 0.9, opacity: 0 }}
					whileInView={shouldReduce ? undefined : { scale: 1, opacity: 1 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{
						type: "spring",
						duration: 0.42,
						bounce: 0,
						delay: 0.08,
					}}
				>
					<Icon
						size={22}
						strokeWidth={1.75}
						className={
							image
								? "text-white"
								: accent
									? "text-accent-foreground"
									: "text-accent"
						}
					/>
				</motion.div>
			</div>
			<div className={`relative ${image ? "text-white" : ""}`}>
				<h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight leading-tight mb-2">
					{title}
				</h3>
				<p
					className={`text-sm leading-relaxed ${image ? "text-white/85" : accent ? "text-accent-foreground/85" : "text-muted-foreground"}`}
				>
					{body}
				</p>
			</div>
			{/* Subtle sheen on hover — oklch-safe gradient, cheap to animate via opacity */}
			<motion.div
				className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				style={{
					background:
						"linear-gradient(105deg, transparent 40%, hsl(var(--foreground)/0.06) 50%, transparent 60%)",
				}}
				aria-hidden
			/>
		</motion.div>
	);
};
