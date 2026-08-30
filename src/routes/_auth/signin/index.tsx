import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import {
	type ComponentProps,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";
import { getErrorMessage, useSignIn } from "#/lib/auth/auth.hooks.ts";
import { signInSchema } from "#/lib/auth/auth.validator.ts";

export const Route = createFileRoute("/_auth/signin/")({
	component: SignIn,
});

const SIGNIN_STORAGE_KEY = "zivra.signin.identifier";
const LEGACY_CREDENTIALS_KEY = "zivra.signin.credentials";

function safeParseStoredIdentifier(raw: string | null): string | null {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed === "string") return parsed;
		if (parsed && typeof parsed.identifier === "string") return parsed.identifier;

		return null;
	} catch {

		const trimmed = raw.trim();
		return trimmed ? trimmed : null;
	}
}

function SignIn() {
	const [showPwd, setShowPwd] = useState(false);
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [keepSignedIn, setKeepSignedIn] = useState(true);
	const navigate = useNavigate();
	const signIn = useSignIn();

	useEffect(() => {

		let restored = false;

		try {
			const storedPersistent = localStorage.getItem(SIGNIN_STORAGE_KEY);
			const identifierToRestore = safeParseStoredIdentifier(storedPersistent);
			if (identifierToRestore) {
				setIdentifier(identifierToRestore);
				setKeepSignedIn(true);
				restored = true;
			}
		} catch {
			try {
				localStorage.removeItem(SIGNIN_STORAGE_KEY);
			} catch {}
		}

		if (!restored) {
			try {
				const storedSession = sessionStorage.getItem(SIGNIN_STORAGE_KEY);
				const identifierToRestore = safeParseStoredIdentifier(storedSession);
				if (identifierToRestore) {
					setIdentifier(identifierToRestore);
					setKeepSignedIn(false);
				}
			} catch {
				try {
					sessionStorage.removeItem(SIGNIN_STORAGE_KEY);
				} catch {}
			}
		}

		try {
			if (localStorage.getItem(LEGACY_CREDENTIALS_KEY))
				localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
		} catch {}
		try {
			if (sessionStorage.getItem(LEGACY_CREDENTIALS_KEY))
				sessionStorage.removeItem(LEGACY_CREDENTIALS_KEY);
		} catch {}
	}, []);

	const signinValidation = useMemo(
		() =>
			signInSchema.safeParse({
				identifier,
				password,
			}),
		[identifier, password],
	);

	const canSubmit = signinValidation.success && !signIn.isPending;

	const submit: ComponentProps<"form">["onSubmit"] = (e) => {
		e.preventDefault();
		if (signIn.isPending) return;

		if (!signinValidation.success) {
			toast.error(
				signinValidation.error.issues[0]?.message ??
					"Please enter valid sign in details.",
			);
			return;
		}

		signIn.mutate(signinValidation.data, {
			onSuccess: () => {

				const payload = JSON.stringify({ identifier: signinValidation.data.identifier });
				if (keepSignedIn) {
					try {
						localStorage.setItem(SIGNIN_STORAGE_KEY, payload);
					} catch {}
					try {
						sessionStorage.removeItem(SIGNIN_STORAGE_KEY);
					} catch {}

					try {
						localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
					} catch {}
					try {
						sessionStorage.removeItem(LEGACY_CREDENTIALS_KEY);
					} catch {}
				} else {
					try {
						sessionStorage.setItem(SIGNIN_STORAGE_KEY, payload);
					} catch {}
					try {
						localStorage.removeItem(SIGNIN_STORAGE_KEY);
					} catch {}
					try {
						localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
					} catch {}
					try {
						sessionStorage.removeItem(LEGACY_CREDENTIALS_KEY);
					} catch {}
				}

				navigate({ to: "/feed" });
			},
			onError: (error) =>
				toast.error(getErrorMessage(error, "Couldn't sign you in.")),
		});
	};

	return (
		<form onSubmit={submit} className="space-y-5">
			<Field label="Email or username">
				<input
					type="text"
					required
					value={identifier}
					onChange={(e) => setIdentifier(e.target.value)}
					placeholder="ava.reyes or ava@pulse.co"
					className="w-full h-12 px-4 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
				/>
			</Field>
			<Field
				label="Password"
				hint={
					<Link to="/forgot-password" className="text-accent hover:underline">
						Forgot?
					</Link>
				}
			>
				<div className="relative">
					<input
						type={showPwd ? "text" : "password"}
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Your very safe password"
						className="w-full h-12 px-4 pr-12 rounded-lg bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-body text-[15px] transition-colors duration-200"
					/>
					<button
						type="button"
						onClick={() => setShowPwd((v) => !v)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						{showPwd ? (
							<EyeOff size={16} strokeWidth={1.75} />
						) : (
							<Eye size={16} strokeWidth={1.75} />
						)}
					</button>
				</div>
			</Field>

			<label className="flex items-center gap-3 text-sm cursor-pointer select-none">
				<input
					type="checkbox"
					checked={keepSignedIn}
					onChange={(e) => setKeepSignedIn(e.target.checked)}
					className="h-4 w-4 rounded border-border accent-accent"
				/>
				Keep me signed in on this device
			</label>

			<button
				type="submit"
				disabled={!canSubmit}
				className="w-full h-13 py-3.5 rounded-full bg-foreground text-background font-display font-semibold text-base hover:bg-accent hover:text-accent-foreground transition-colors duration-200 flex items-center justify-center gap-2"
			>
				{signIn.isPending ? "Signing in…" : "Sign in"}{" "}
				<ArrowRight size={16} strokeWidth={2} />
			</button>

			<p className="text-center text-sm text-muted-foreground">
				New here?{" "}
				<Link
					to="/signup"
					className="text-foreground font-semibold hover:text-accent transition-colors duration-200"
				>
					Create an account
				</Link>
			</p>
		</form>
	);
}

const Field = ({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: ReactNode;
	children: ReactNode;
}) => (
	<div>
		<div className="flex items-center justify-between mb-2">
			<span className="overline text-muted-foreground">{label}</span>
			{hint}
		</div>
		{children}
	</div>
);
