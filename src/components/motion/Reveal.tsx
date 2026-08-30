import { motion, useReducedMotion, type Variants } from "framer-motion";
import type * as React from "react";

// Jakub recipe: opacity + y 12 + blur 4 -> sharp, spring bounce 0
const revealVariants: Variants = {
	hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { type: "spring", duration: 0.45, bounce: 0 },
	},
};

const staggerContainer: Variants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.06,
			delayChildren: 0.06,
		},
	},
};

export function Reveal({
	children,
	delay = 0,
	duration = 0.45,
	y = 12,
	blur = 4,
	as: As = "div",
	className,
	amount = 0.2,
	once = true,
	...props
}: {
	children: React.ReactNode;
	delay?: number;
	duration?: number;
	y?: number;
	blur?: number;
	as?: React.ElementType;
	className?: string;
	amount?: number | "some" | "all";
	once?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
	const shouldReduce = useReducedMotion();
	if (shouldReduce) {
		const Comp = As as React.ElementType;
		return (
			<Comp className={className} {...props}>
				{children}
			</Comp>
		);
	}
	const variants: Variants = {
		hidden: { opacity: 0, y, filter: `blur(${blur}px)` },
		visible: {
			opacity: 1,
			y: 0,
			filter: "blur(0px)",
			transition: { type: "spring", duration, bounce: 0, delay },
		},
	};
	const MotionComp = motion(As as React.ElementType);
	return (
		<MotionComp
			className={className}
			initial="hidden"
			whileInView="visible"
			viewport={{ once, amount }}
			variants={variants}
			{...(props as object)}
		>
			{children}
		</MotionComp>
	);
}

export function RevealGroup({
	children,
	className,
	stagger = 0.07,
	delayChildren = 0.04,
	amount = 0.18,
	once = true,
}: {
	children: React.ReactNode;
	className?: string;
	stagger?: number;
	delayChildren?: number;
	amount?: number | "some" | "all";
	once?: boolean;
}) {
	const shouldReduce = useReducedMotion();
	if (shouldReduce) {
		return <div className={className}>{children}</div>;
	}
	return (
		<motion.div
			className={className}
			initial="hidden"
			whileInView="visible"
			viewport={{ once, amount }}
			variants={{
				hidden: {},
				visible: {
					transition: { staggerChildren: stagger, delayChildren },
				},
			}}
		>
			{children}
		</motion.div>
	);
}

export function RevealItem({
	children,
	className,
	y = 12,
	duration = 0.42,
}: {
	children: React.ReactNode;
	className?: string;
	y?: number;
	duration?: number;
}) {
	const shouldReduce = useReducedMotion();
	if (shouldReduce) {
		return <div className={className}>{children}</div>;
	}
	return (
		<motion.div
			className={className}
			variants={{
				hidden: { opacity: 0, y, filter: "blur(4px)" },
				visible: {
					opacity: 1,
					y: 0,
					filter: "blur(0px)",
					transition: { type: "spring", duration, bounce: 0 },
				},
			}}
		>
			{children}
		</motion.div>
	);
}

// Keep legacy export names for familiarity with search results
export const fadeUpVariants = revealVariants;
export const staggerVariants = staggerContainer;
