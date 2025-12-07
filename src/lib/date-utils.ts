/**
 * Utility functions for consistent date handling across the application.
 * All dates are normalized to UTC midnight to avoid timezone issues.
 */

/**
 * Normalizes a date string (YYYY-MM-DD) or Date object to UTC midnight.
 * This ensures consistent date comparison in the database.
 *
 * @param date - Date string in format "YYYY-MM-DD" or a Date object
 * @returns Date object normalized to UTC midnight
 *
 * @example
 * normalizeDateToUTC("2024-01-15") // Returns Date at 2024-01-15T00:00:00.000Z
 * normalizeDateToUTC(new Date()) // Returns current date at UTC midnight
 */
export function normalizeDateToUTC(date: string | Date): Date {
	if (typeof date === "string") {
		// If it's already in ISO format with time, use it directly
		if (date.includes("T")) {
			return new Date(date);
		}
		// Otherwise, append UTC midnight
		return new Date(date + "T00:00:00.000Z");
	}
	// If it's a Date object, convert to ISO string and normalize
	const dateStr = date.toISOString().split("T")[0];
	return new Date(dateStr + "T00:00:00.000Z");
}

/**
 * Normalizes the current date to UTC midnight.
 * Useful for queries that need "today" in UTC.
 * NOTE: This uses UTC timezone, which may differ from local timezone.
 * For local timezone, use normalizeTodayLocalToUTC() instead.
 *
 * @returns Date object representing today at UTC midnight
 *
 * @example
 * normalizeTodayToUTC() // Returns today's date at UTC midnight
 */
export function normalizeTodayToUTC(): Date {
	const today = new Date();
	const dateStr = today.toISOString().split("T")[0];
	return new Date(dateStr + "T00:00:00.000Z");
}

/**
 * Normalizes today's date in local timezone to UTC midnight.
 * This ensures that "today" is determined by the user's local timezone,
 * not UTC. Useful for queries where we want to match the user's perception of "today".
 *
 * @returns Date object representing today (in local timezone) at UTC midnight
 *
 * @example
 * // If it's 00:14 on Jan 29 in WIB (UTC+7), this returns Jan 29 at UTC midnight
 * normalizeTodayLocalToUTC()
 */
export function normalizeTodayLocalToUTC(): Date {
	const today = new Date();
	// Get local date components
	const year = today.getFullYear();
	const month = today.getMonth() + 1; // getMonth() returns 0-11
	const day = today.getDate();
	
	// Create UTC date from local date components
	return createUTCDate(year, month, day);
}

/**
 * Normalizes a date range (start and end dates) to UTC midnight.
 *
 * @param startDate - Start date string (YYYY-MM-DD) or Date object
 * @param endDate - End date string (YYYY-MM-DD) or Date object
 * @returns Object with normalized start and end dates
 *
 * @example
 * normalizeDateRangeToUTC("2024-01-01", "2024-01-31")
 */
export function normalizeDateRangeToUTC(
	startDate: string | Date,
	endDate: string | Date,
): { start: Date; end: Date } {
	return {
		start: normalizeDateToUTC(startDate),
		end: normalizeDateToUTC(endDate),
	};
}

/**
 * Creates a date at UTC midnight from year, month, and day.
 * Month is 1-indexed (1 = January, 12 = December).
 *
 * @param year - Year (e.g., 2024)
 * @param month - Month (1-12)
 * @param day - Day of month (1-31)
 * @returns Date object at UTC midnight
 *
 * @example
 * createUTCDate(2024, 1, 15) // Returns 2024-01-15T00:00:00.000Z
 */
export function createUTCDate(year: number, month: number, day: number): Date {
	return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Gets the start of a month in UTC.
 *
 * @param year - Year (e.g., 2024)
 * @param month - Month (1-12)
 * @returns Date object representing the first day of the month at UTC midnight
 */
export function getMonthStartUTC(year: number, month: number): Date {
	return createUTCDate(year, month, 1);
}

/**
 * Gets the end of a month in UTC.
 *
 * @param year - Year (e.g., 2024)
 * @param month - Month (1-12)
 * @returns Date object representing the last day of the month at UTC midnight
 */
export function getMonthEndUTC(year: number, month: number): Date {
	return createUTCDate(year, month + 1, 0);
}

/**
 * Iterates through dates in a range, calling a callback for each date.
 * All dates are normalized to UTC midnight.
 *
 * @param startDate - Start date string (YYYY-MM-DD) or Date object
 * @param endDate - End date string (YYYY-MM-DD) or Date object
 * @param callback - Function to call for each date
 *
 * @example
 * iterateDateRange("2024-01-01", "2024-01-31", (date) => {
 *   console.log(date);
 * });
 */
export function iterateDateRange(
	startDate: string | Date,
	endDate: string | Date,
	callback: (date: Date) => void,
): void {
	const start = normalizeDateToUTC(startDate);
	const end = normalizeDateToUTC(endDate);

	for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
		callback(new Date(d));
	}
}

/**
 * Gets yesterday's date normalized to UTC midnight.
 *
 * @returns Date object representing yesterday at UTC midnight
 *
 * @example
 * getYesterdayUTC() // Returns yesterday's date at UTC midnight
 */
export function getYesterdayUTC(): Date {
	const today = normalizeTodayToUTC();
	const yesterday = new Date(today);
	yesterday.setUTCDate(yesterday.getUTCDate() - 1);
	return yesterday;
}

