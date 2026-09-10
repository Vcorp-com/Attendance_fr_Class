const API_URL =
	"https://script.google.com/macros/s/AKfycbwkNti4d15HG8tFrW92ZeqK2YLKXqjsNhIOF6e71AxMa36r7KXB0__IaDXlly3oZfL2/exec";

export const isConfigured =
	API_URL && API_URL.indexOf("https://script.google.com") === 0;

export async function apiGet(params) {
	try {
		const url = API_URL + "?" + new URLSearchParams(params).toString();
		const res = await fetch(url);
		return await res.json();
	} catch (e) {
		return null;
	}
}

export async function apiPost(payload) {
	try {
		const res = await fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "text/plain;charset=utf-8" },
			body: JSON.stringify(payload),
		});
		return await res.json();
	} catch (e) {
		return {
			ok: false,
			error: "Could not reach the server. Check your internet connection.",
		};
	}
}

export async function getAttendance(dateStr) {
	const data = await apiGet({ action: "getAttendance", date: dateStr });
	return data && !data.error ? data : {};
}

export async function getRoster() {
	const data = await apiGet({ action: "getRoster" });
	return Array.isArray(data) ? data : [];
}

export async function logAttendanceCall(roll, name, period, dateStr) {
	roll = roll.trim();
	name = name.trim();
	if (!roll) return { ok: false, error: "Enter your roll number." };
	if (!period) return { ok: false, error: "Pick a period first." };
	return await apiPost({
		action: "logAttendance",
		roll,
		name,
		period,
		date: dateStr,
	});
}
