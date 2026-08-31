import {
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
} from "motion/react";
import * as React from "react";

export function MagneticButton({
	children,
	className,
	strength = 0.18,
	as: As = "a",
	...props
}: {
	children: React.ReactNode;
	className?: string;
	strength?: number;
	// biome-ignore lint/suspicious/noExplicitAny: polymorphic Link props
	as?: React.ElementType<any>;
	// biome-ignore lint/suspicious/noExplicitAny: allow TanStack Link 'to' etc
} & Record<string, any>) {
	const shouldReduce = useReducedMotion();
	const ref = React.useRef<HTMLElement>(null);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const sx = useSpring(x, { stiffness: 300, damping: 30 });
	const sy = useSpring(y, { stiffness: 300, damping: 30 });

	if (shouldReduce) {
		const Comp = As as React.ElementType;
		return (
			<Comp ref={ref} className={className} {...props}>
				{children}
			</Comp>
		);
	}

	const onMove = (e: React.MouseEvent) => {
		const el = ref.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const cx = r.left + r.width / 2;
		const cy = r.top + r.height / 2;
		x.set((e.clientX - cx) * strength);
		y.set((e.clientY - cy) * strength);
	};
	const onLeave = () => {
		x.set(0);
		y.set(0);
	};

	const MotionComp = motion.create(As as React.ElementType);
	return (
		<MotionComp
			ref={ref}
			className={className}
			onMouseMove={onMove}
			onMouseLeave={onLeave}
			style={{ x: sx, y: sy }}
			whileTap={{ scale: 0.97 }}
			transition={{ type: "spring", duration: 0.22, bounce: 0 }}
			{...(props as object)}
		>
			{children}
		</MotionComp>
	);
}
