import {
	motion,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "motion/react";
import * as React from "react";

export function ParallaxImage({
	src,
	alt = "",
	className,
	wrapperClassName,
	parallax = 18,
	scaleOnHover = 1.04,
}: {
	src: string;
	alt?: string;
	className?: string;
	wrapperClassName?: string;
	parallax?: number;
	scaleOnHover?: number;
}) {
	const shouldReduce = useReducedMotion();
	const ref = React.useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const y = useTransform(scrollYProgress, [0, 1], [-parallax, parallax]);
	const smoothY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.6 });

	if (shouldReduce) {
		return (
			<div ref={ref} className={wrapperClassName}>
				<img src={src} alt={alt} className={className} loading="lazy" />
			</div>
		);
	}

	return (
		<motion.div
			ref={ref}
			className={wrapperClassName}
			initial={{ clipPath: "inset(0 0 100% 0)" }}
			whileInView={{ clipPath: "inset(0 0 0 0)" }}
			viewport={{ once: true, amount: 0.25 }}
			transition={{
				duration: 0.82,
				ease: [0.77, 0, 0.175, 1],
			}}
			style={{ willChange: "clip-path" }}
		>
			<motion.div
				style={{ y: smoothY }}
				whileHover={{ scale: scaleOnHover }}
				transition={{ type: "spring", duration: 0.45, bounce: 0 }}
				className="h-full w-full will-change-transform"
			>
				<img
					src={src}
					alt={alt}
					className={className}
					loading="lazy"
					draggable={false}
				/>
			</motion.div>
		</motion.div>
	);
}
