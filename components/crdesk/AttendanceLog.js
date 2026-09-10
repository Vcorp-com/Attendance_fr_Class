"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { periodName, periodLabel } from "@/lib/periods";

// Google Sheets sometimes exports times as "1899-12-30T04:01:50.000Z"
// This function strips away the date and just returns the hour and minute (e.g. "04:01")
function cleanTime(t) {
	if (!t) return "";
	if (typeof t === "string" && t.includes("1899-12-30")) {
		const match = t.match(/T(\d{2}:\d{2})/);
		if (match) return match[1];
	}
	return t;
}

export default function AttendanceLog({
	periods,
	attendance,
	crDate,
	setCrDate,
	pin,
	reloadAttendance,
	setMsg,
}) {
	const [clearing, setClearing] = useState(false);

	function handleExportCsv() {
		let csv = "Period,RollNo,Name,Time\n";
		periods.forEach((p) => {
			const name = periodName(p);
			const label = periodLabel(p);
			const list = attendance[name] || [];
			list.forEach((r) => {
				// Clean the time before exporting it to CSV
				const timeCleaned = cleanTime(r.time);
				csv += `"${label.replace(/"/g, '""')}","${r.roll}","${r.name.replace(
					/"/g,
					'""',
				)}","${timeCleaned}"\n`;
			});
		});
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `attendance-${crDate}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function handleClearDay() {
		if (!confirm(`Clear ALL attendance for ${crDate}? This cannot be undone.`))
			return;
		setClearing(true);
		const res = await apiPost({ action: "resetDay", date: crDate, pin });
		setClearing(false);
		if (res && res.ok) {
			await reloadAttendance(); // pull the now-empty day back down
			setMsg({ type: "ok", text: `Cleared attendance for ${crDate}.` });
		} else {
			setMsg({
				type: "err",
				text: (res && res.error) || "Could not clear.",
			});
		}
	}

	return (
		<>
			<div className="section-title">ATTENDANCE LOG</div>

			<div className="field">
				<label>Date</label>
				<input
					type="date"
					value={crDate}
					onChange={(e) => setCrDate(e.target.value)}
				/>
			</div>

			{periods.length === 0 ? (
				<div className="empty-note">
					Add periods above to start seeing logs.
				</div>
			) : (
				<table className="att-table">
					<thead>
						<tr>
							<th style={{ width: "20%" }}>Period</th>
							<th style={{ width: "10%" }}>Count</th>
							<th>Roll · Name (Time)</th>
						</tr>
					</thead>
					<tbody>
						{periods.map((p) => {
							const name = periodName(p);
							const list = attendance[name] || [];
							return (
								<tr key={name}>
									<td>{periodLabel(p)}</td>
									<td className="count">{list.length}</td>
									<td>
										{list.length === 0 ? (
											<span className="empty-note" style={{ padding: 0 }}>
												— none yet —
											</span>
										) : (
											<div
												style={{
													display: "flex",
													flexDirection: "column",
													gap: 6,
												}}
											>
												{list.map((r, i) => (
													<div
														key={`${r.roll}-${i}`}
														style={{
															display: "flex",
															gap: 8,
															paddingBottom: 6,
															borderBottom:
																i === list.length - 1
																	? "none"
																	: "1px dashed #d8cfb5",
														}}
													>
														<span
															style={{
																fontFamily: "var(--font-mono), monospace",
																color: "var(--blue)",
																width: 75,
																flexShrink: 0,
															}}
														>
															{r.roll}
														</span>
														<span style={{ flex: 1 }}>{r.name}</span>
														<span
															style={{
																color: "var(--ink-soft)",
																fontFamily: "var(--font-mono), monospace",
																fontSize: 11.5,
															}}
														>
															{cleanTime(r.time)}
														</span>
													</div>
												))}
											</div>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}

			<div style={{ display: "flex", gap: 8, marginTop: 12 }}>
				<button
					className="btn btn-secondary"
					onClick={handleExportCsv}
					disabled={periods.length === 0}
				>
					Export CSV
				</button>
				<button
					className="btn btn-danger"
					onClick={handleClearDay}
					disabled={periods.length === 0 || clearing}
				>
					{clearing ? "Clearing..." : "Clear this day"}
				</button>
			</div>
		</>
	);
}
