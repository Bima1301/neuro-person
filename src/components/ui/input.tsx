import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
	prefixIcon?: React.ReactNode;
	suffixIcon?: React.ReactNode;
	mainClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{ className, type, prefixIcon, suffixIcon, mainClassName, ...props },
		ref,
	) => {
		const hasPrefix = !!prefixIcon;
		const hasSuffix = !!suffixIcon;

		return (
			<div className={cn("relative flex w-full items-center", mainClassName)}>
				{hasPrefix && (
					<div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
						{prefixIcon}
					</div>
				)}
				<input
					type={type}
					ref={ref}
					data-slot="input"
					className={cn(
						"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm px-3",
						hasPrefix && "pl-10",
						hasSuffix && "pr-10",
						"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
						"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
						className,
					)}
					{...props}
				/>
				{hasSuffix && (
					<div className="absolute right-3 flex items-center">{suffixIcon}</div>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
