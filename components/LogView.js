"use client";

import { useState, useEffect, useCallback } from "react";
import { getAttendance, logAttendanceCall } from "@/lib/api";
import { periodName, periodLabel, isPeriodOpenNow } from "@/lib/periods";
import { todayStr } from "@/lib/dates";

// Google Sheets sometimes returns "1899-12-30T04:01:50.000Z" — keep HH:MM only
function cleanTime(t) {
	if (!t) return "";
	if (typeof t === "string" && t.includes("T")) {
		const match = t.match(/T(\d{2}:\d{2})/);
		if (match) return match[1];
	}
	return t;
}

export default function LogView({
	periods,
	selectedPeriod,
	setSelectedPeriod,
	setMsg,
}) {
	const [roll, setRoll] = useState("");
	const [name, setName] = useState("");
	const [attendance, setAttendance] = useState({});
	const [loadingList, setLoadingList] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	// Search box for the marked list
	const [query, setQuery] = useState("");

	const dateStr = todayStr();

	const loadAttendance = useCallback(async () => {
		setLoadingList(true);
		const data = await getAttendance(dateStr);
		setAttendance(data || {});
		setLoadingList(false);
	}, [dateStr]);

	useEffect(() => {
		loadAttendance();
	}, [loadAttendance]);

	// Clear search when the period changes (list is different)
	useEffect(() => {
		setQuery("");
	}, [selectedPeriod]);

	const currentPeriodObj = periods.find(
		(p) => periodName(p) === selectedPeriod,
	);
	const isLocked = currentPeriodObj
		? !isPeriodOpenNow(currentPeriodObj)
		: false;

	const list =
		(attendance && selectedPeriod && attendance[selectedPeriod]) || [];

	// Filter by roll OR name (case-insensitive, partial match)
	const q = query.trim().toLowerCase();
	const filtered = q
		? list.filter(
				(r) =>
					String(r.roll).toLowerCase().includes(q) ||
					String(r.name).toLowerCase().includes(q),
			)
		: list;

	async function handleMark() {
		setSubmitting(true);
		const result = await logAttendanceCall(roll, name, selectedPeriod, dateStr);
		setSubmitting(false);

		if (result.ok) {
			const resolvedName = result.name || name.trim();
			setAttendance((prev) => {
				const next = { ...prev };
				if (!next[selectedPeriod]) next[selectedPeriod] = [];
				next[selectedPeriod] = [
					...next[selectedPeriod],
					{ roll: roll.trim(), name: resolvedName, time: result.time },
				];
				return next;
			});
			setMsg({
				type: "ok",
				text: `${resolvedName} (${roll.trim()}) is marked present. ✓`,
			});
			setRoll("");
			setName("");
		} else {
			setMsg({ type: "err", text: result.error || "Something went wrong." });
		}
	}

	if (periods.length === 0) {
		return (
			<div className="empty-note">
				No periods have been set up yet. Ask your CR to add periods from the CR
				Desk.
			</div>
		);
	}

	return (
		<>
			<div className="field">
				<label>Period</label>
				<select
					id="period-select"
					value={selectedPeriod}
					onChange={(e) => {
						setSelectedPeriod(e.target.value);
						setMsg(null);
					}}
				>
					{periods.map((p) => {
						const val = periodName(p);
						const lockIcon = isPeriodOpenNow(p) ? "🔓" : "🔒";
						return (
							<option key={val} value={val}>
								{lockIcon} {periodLabel(p)}
							</option>
						);
					})}
				</select>
			</div>

			<div className="field">
				<label>Roll number</label>
				<input
					type="text"
					placeholder="e.g. 23CS045"
					autoComplete="off"
					value={roll}
					onChange={(e) => setRoll(e.target.value)}
				/>
			</div>

			<div className="field">
				<label>
					Your name{" "}
					<span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
						(optional after your first time)
					</span>
				</label>
				<input
					type="text"
					placeholder="e.g. Priya Kumar"
					autoComplete="off"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</div>

			<button
				className="btn btn-primary"
				onClick={handleMark}
				disabled={isLocked || submitting}
			>
				{submitting
					? "Marking..."
					: isLocked
						? "🔒 Attendance closed for this class"
						: "Mark me present"}
			</button>

			{isLocked && (
				<p
					style={{
						fontSize: 12,
						color: "var(--ink-soft)",
						marginTop: 6,
					}}
				>
					Your CR hasn&apos;t opened attendance for this class yet. Try again
					once it starts, or ask them to unlock it.
				</p>
			)}

			<div className="roll-list">
				<h3>
					<span>
						MARKED — {selectedPeriod || ""}{" "}
						<button
							className="btn-ghost"
							style={{ fontSize: 11 }}
							onClick={(e) => {
								e.preventDefault();
								loadAttendance();
							}}
						>
							↻ refresh
						</button>
					</span>
					<span>{q ? `${filtered.length} / ${list.length}` : list.length}</span>
				</h3>

				{/* Search bar — only useful once people are on the list */}
				{list.length > 0 && (
					<div className="field" style={{ marginTop: 8, marginBottom: 8 }}>
						<input
							type="text"
							placeholder="Search name or roll no…"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							autoComplete="off"
							aria-label="Search marked students"
						/>
					</div>
				)}

				{loadingList ? (
					<div className="empty-note">
						Loading <span className="loading-dot"></span>
					</div>
				) : list.length === 0 ? (
					<div className="empty-note">
						No one has logged in for this period yet.
					</div>
				) : filtered.length === 0 ? (
					<div className="empty-note">
						No match for &quot;{query.trim()}&quot;.
					</div>
				) : (
					filtered.map((r, i) => (
						<div className="roll-row" key={`${r.roll}-${i}`}>
							<div className="n">
								<span className="idx">{i + 1}</span>
								<span className="rno">{r.roll}</span>
								<span>{r.name}</span>
							</div>
							<span className="time">{cleanTime(r.time)}</span>
						</div>
					))
				)}
			</div>
		</>
	);
}
