"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import {
	periodName,
	periodTimes,
	periodLabel,
	periodMode,
	isPeriodOpenNow,
} from "@/lib/periods";
import { buildAttendanceDocHtml, downloadHtmlAsDocx } from "@/lib/docx";

// Google Sheets sometimes returns times as "1899-12-30T04:01:50.000Z"
// Strip that down to just "04:01"
function cleanTime(t) {
	if (!t) return "";
	if (typeof t === "string" && t.includes("T")) {
		// Handles both "1899-12-30T04:01:50.000Z" and normal ISO timestamps
		const match = t.match(/T(\d{2}:\d{2})/);
		if (match) return match[1];
	}
	// Already a short time like "04:01" or "4:01 AM"
	return t;
}

// Clean times inside a list before Word export too
function cleanedList(list) {
	return (list || []).map((r) => ({
		...r,
		time: cleanTime(r.time),
	}));
}

export default function ClassSchedule({
	periods,
	setPeriods,
	attendance,
	crDate,
	courseName,
	scheduleViewName,
	setScheduleViewName,
	pin,
	setMsg,
}) {
	const [savingMode, setSavingMode] = useState(null);

	async function handleSetMode(name, mode) {
		setSavingMode(name);
		const res = await apiPost({
			action: "setPeriodMode",
			name,
			mode,
			pin,
		});
		setSavingMode(null);
		if (res && res.ok) {
			setPeriods(res.periods);
			const labels = {
				auto: "Auto (follows schedule)",
				open: "Force Open",
				closed: "Force Locked",
			};
			setMsg({ type: "ok", text: `${name} set to ${labels[mode]}.` });
		} else {
			setMsg({
				type: "err",
				text: (res && res.error) || "Could not update.",
			});
		}
	}

	function handleToggleView(name) {
		setScheduleViewName(scheduleViewName === name ? null : name);
	}

	function handleDownloadDocx() {
		if (!scheduleViewName) return;
		const p = periods.find((pp) => periodName(pp) === scheduleViewName);
		const list = cleanedList(attendance[scheduleViewName] || []);
		const label = p ? periodLabel(p) : scheduleViewName;
		const html = buildAttendanceDocHtml(courseName, label, crDate, list);
		const filename =
			scheduleViewName.replace(/[^a-z0-9]+/gi, "_") +
			"_" +
			crDate +
			"_attendance.docx";
		downloadHtmlAsDocx(html, filename);
	}

	function ModeButton({ name, currentMode, targetMode, label }) {
		const active = currentMode === targetMode;
		return (
			<button
				className={`btn btn-sm ${active ? "btn-primary" : "btn-secondary"}`}
				style={active ? undefined : { opacity: 0.75 }}
				disabled={savingMode === name}
				onClick={() => handleSetMode(name, targetMode)}
			>
				{label}
			</button>
		);
	}

	// Preview panel under the schedule table
	let preview = null;
	if (scheduleViewName) {
		const p = periods.find((pp) => periodName(pp) === scheduleViewName);
		if (p) {
			const list = attendance[scheduleViewName] || [];
			preview = (
				<div
					style={{
						background: "#fffefb",
						border: "1.5px solid #cfc6ab",
						borderRadius: 6,
						padding: 14,
						marginTop: 10,
					}}
				>
					<h4
						style={{
							margin: "0 0 10px",
							fontFamily: "var(--font-mono), monospace",
							fontSize: 13,
							lineHeight: 1.4,
						}}
					>
						{periodLabel(p)} — {crDate}
					</h4>

					{list.length === 0 ? (
						<div className="empty-note">
							No one has been marked present for this class on this date.
						</div>
					) : (
						<div style={{ display: "flex", flexDirection: "column" }}>
							{/* Column headers — hidden on very small screens via wrapping naturally */}
							<div
								style={{
									display: "flex",
									gap: 8,
									padding: "4px 0 8px",
									borderBottom: "2px solid var(--ink)",
									fontFamily: "var(--font-mono), monospace",
									fontSize: 10.5,
									color: "var(--ink-soft)",
								}}
							>
								<span style={{ width: 24, flexShrink: 0 }}>#</span>
								<span style={{ width: 72, flexShrink: 0 }}>Roll</span>
								<span style={{ flex: 1 }}>Name</span>
								<span style={{ width: 44, flexShrink: 0, textAlign: "right" }}>
									Time
								</span>
							</div>

							{list.map((r, i) => (
								<div
									key={`${r.roll}-${i}`}
									style={{
										display: "flex",
										gap: 8,
										alignItems: "baseline",
										padding: "8px 0",
										borderBottom:
											i === list.length - 1 ? "none" : "1px dashed #d8cfb5",
										fontSize: 13,
									}}
								>
									<span
										style={{
											width: 24,
											flexShrink: 0,
											fontFamily: "var(--font-mono), monospace",
											color: "var(--gold)",
											fontSize: 12,
										}}
									>
										{i + 1}
									</span>
									<span
										style={{
											width: 72,
											flexShrink: 0,
											fontFamily: "var(--font-mono), monospace",
											fontSize: 12,
											color: "var(--blue)",
											wordBreak: "break-all",
										}}
									>
										{r.roll}
									</span>
									<span
										style={{
											flex: 1,
											minWidth: 0,
											wordBreak: "break-word",
										}}
									>
										{r.name}
									</span>
									<span
										style={{
											width: 44,
											flexShrink: 0,
											textAlign: "right",
											fontFamily: "var(--font-mono), monospace",
											fontSize: 11.5,
											color: "var(--ink-soft)",
										}}
									>
										{cleanTime(r.time)}
									</span>
								</div>
							))}
						</div>
					)}

					<button
						className="btn btn-secondary"
						style={{ marginTop: 12, width: "100%" }}
						disabled={list.length === 0}
						onClick={handleDownloadDocx}
					>
						⬇ Download as Word (.docx)
					</button>
				</div>
			);
		}
	}

	return (
		<>
			<div className="section-title">CLASS SCHEDULE</div>

			{periods.length === 0 ? (
				<div className="empty-note">
					No classes scheduled yet — add one under PERIODS above.
				</div>
			) : (
				<div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
					<table className="att-table" style={{ minWidth: 420 }}>
						<thead>
							<tr>
								<th>Class</th>
								<th>Start</th>
								<th>End</th>
								<th>Mode</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{periods.map((p) => {
								const name = periodName(p);
								const t = periodTimes(p);
								const mode = periodMode(p);
								const liveOpen = isPeriodOpenNow(p);
								return (
									<tr key={name}>
										<td>
											{name}
											<br />
											<span
												style={{
													fontSize: 10.5,
													color: liveOpen ? "var(--cover-dark)" : "var(--red)",
												}}
											>
												{liveOpen ? "🔓 open now" : "🔒 closed now"}
											</span>
										</td>
										<td>{t.start || "—"}</td>
										<td>{t.end || "—"}</td>
										<td style={{ whiteSpace: "nowrap" }}>
											<ModeButton
												name={name}
												currentMode={mode}
												targetMode="auto"
												label="Auto"
											/>{" "}
											<ModeButton
												name={name}
												currentMode={mode}
												targetMode="open"
												label="Open"
											/>{" "}
											<ModeButton
												name={name}
												currentMode={mode}
												targetMode="closed"
												label="Lock"
											/>
										</td>
										<td>
											<button
												className="btn btn-secondary btn-sm"
												onClick={() => handleToggleView(name)}
											>
												{scheduleViewName === name ? "Hide" : "View"}
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{preview}

			<p
				style={{
					fontSize: 11.5,
					color: "var(--ink-soft)",
					marginTop: 8,
				}}
			>
				Tap &quot;View&quot; on a class to see who was present on the date
				selected above, then download it as a Word document.
			</p>
		</>
	);
}
