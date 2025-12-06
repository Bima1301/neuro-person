import * as React from "react";

import { cn } from "@/lib/utils";

interface InputMaskProps
	extends Omit<React.ComponentProps<"input">, "onChange"> {
	inputType?: "currency" | "phone";
	onChange?: (
		e: React.ChangeEvent<HTMLInputElement>,
		rawValue: string | number,
	) => void;
}

function InputMask({
	className,
	type,
	inputType,
	onChange,
	value,
	...props
}: InputMaskProps) {
	const [displayValue, setDisplayValue] = React.useState("");

	// Format currency: 2500 -> Rp 2.500
	const formatCurrency = React.useCallback(
		(value: string): { formatted: string; raw: string } => {
			// Remove all non-digit characters
			const raw = value.replace(/\D/g, "");

			if (!raw) {
				return { formatted: "", raw: "" };
			}

			// Format with thousand separator
			const formatted = `Rp ${parseInt(raw, 10).toLocaleString("id-ID")}`;

			return { formatted, raw };
		},
		[],
	);

	// Format phone: 85853 -> +62 858-5300-0000
	const formatPhone = React.useCallback(
		(value: string): { formatted: string; raw: string } => {
			// Remove all non-digit characters except leading +
			let cleaned = value.replace(/[^\d+]/g, "");

			// Remove +62 prefix if it exists to get raw number
			let raw = cleaned.replace(/^\+?62/, "");

			// Remove leading 0 if exists
			if (raw.startsWith("0")) {
				raw = raw.substring(1);
			}

			if (!raw) {
				return { formatted: "", raw: "" };
			}

			// Limit to 12 digits (Indonesian phone numbers)
			raw = raw.substring(0, 12);

			// Format: +62 xxxx-xxxx-xxxx
			let formatted = "+62";

			if (raw.length > 0) {
				formatted += ` ${raw.substring(0, 4)}`;
			}
			if (raw.length > 4) {
				formatted += `-${raw.substring(4, 8)}`;
			}
			if (raw.length > 8) {
				formatted += `-${raw.substring(8, 12)}`;
			}

			return { formatted: formatted.trim(), raw };
		},
		[],
	);

	// Update display value when external value changes
	React.useEffect(() => {
		if (value !== undefined) {
			const stringValue = String(value);

			if (inputType === "currency") {
				const { formatted } = formatCurrency(stringValue);
				setDisplayValue(formatted);
			} else if (inputType === "phone") {
				const { formatted } = formatPhone(stringValue);
				setDisplayValue(formatted);
			} else {
				setDisplayValue(stringValue);
			}
		}
	}, [value, inputType, formatPhone, formatCurrency]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;

		if (inputType === "currency") {
			const { formatted, raw } = formatCurrency(inputValue);
			setDisplayValue(formatted);

			// Create a new event with formatted value
			const newEvent = {
				...e,
				target: {
					...e.target,
					value: formatted,
				},
			} as React.ChangeEvent<HTMLInputElement>;

			// Convert raw value to number for currency
			const numericValue = raw ? parseInt(raw, 10) : 0;
			onChange?.(newEvent, numericValue);
		} else if (inputType === "phone") {
			const { formatted, raw } = formatPhone(inputValue);
			setDisplayValue(formatted);

			// Create a new event with formatted value
			const newEvent = {
				...e,
				target: {
					...e.target,
					value: formatted,
				},
			} as React.ChangeEvent<HTMLInputElement>;

			onChange?.(newEvent, raw);
		} else {
			setDisplayValue(inputValue);
			onChange?.(e, inputValue);
		}
	};

	return (
		<input
			type="text"
			data-slot="input"
			className={cn(
				"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
				"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
				className,
			)}
			value={displayValue}
			onChange={handleChange}
			{...props}
		/>
	);
}

export { InputMask };
