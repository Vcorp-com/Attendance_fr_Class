export function periodName(p) {
	return typeof p === "string" ? p : (p && p.name) || "";
}

export function periodTimes(p) {
	if (typeof p === "string") return { start: "", end: "" };
	return { start: (p && p.start) || "", end: (p && p.end) || "" };
}

export function periodLabel(p) {
	const name = periodName(p);
	const t = periodTimes(p);
	return t.start && t.end ? `${t.start}–${t.end} · ${name}` : name;
}

export function periodMode(p) {
	if (typeof p === "string") return "open";
	if (p && p.mode) return p.mode;
	if (p && p.open === true) return "open";
	if (p && p.open === false) return "closed";
	return "auto";
}

export function isPeriodOpenNow(p) {
	const mode = periodMode(p);
	if (mode === "open") return true;
	if (mode === "closed") return false;
	const t = periodTimes(p);
	if (!t.start || !t.end) return true;
	const now = new Date();
	const hh = String(now.getHours()).padStart(2, "0");
	const mm = String(now.getMinutes()).padStart(2, "0");
	const nowStr = hh + ":" + mm;
	return nowStr >= t.start && nowStr <= t.end;
}
