import { useState } from "react";
import Header from "../sections/header";
import AttendanceList from "../sections/attendance-list";

export default function AttendanceContainer() {
	const now = new Date();
	const [filter, setFilter] = useState<{
		month?: string;
		year?: string;
	}>({
		month: (now.getMonth() + 1).toString().padStart(2, '0'),
		year: now.getFullYear().toString(),
	});

	return (
		<div className="flex flex-col min-h-full">
			<Header
				filter={filter}
				setFilter={setFilter}
			/>
			<AttendanceList
				filter={filter}
			/>
		</div>
	);
}

