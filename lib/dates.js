// "YYYY-MM-DD"
export function todayStr() {
	const d = new Date();
	return (
		d.getFullYear() +
		"-" +
		String(d.getMonth() + 1).padStart(2, "0") +
		"-" +
		String(d.getDate()).padStart(2, "0")
	);
}

// Returns something like "Thu, Sep 10, 2026 · 3:45 PM" — today's date plus
// the current time, for display under the class name.
export function nowLabel() {
	const now = new Date();
	const datePart = now.toLocaleDateString(undefined, {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
	});
	const timePart = now.toLocaleTimeString(undefined, {
		hour: "numeric",
		minute: "2-digit",
	});
	return `${datePart} · ${timePart}`;
}
