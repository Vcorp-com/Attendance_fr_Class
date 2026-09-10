"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { periodName, periodLabel } from "@/lib/periods";

export default function PeriodsEditor({
	periods,
	setPeriods,
	pin,
	selectedPeriod,
	setSelectedPeriod,
	scheduleViewName,
	setScheduleViewName,
	setMsg,
}) {
	// Local state for the "add period" form
	const [newName, setNewName] = useState("");
	const [newStart, setNewStart] = useState("");
	const [newEnd, setNewEnd] = useState("");
	const [adding, setAdding] = useState(false);

	async function handleAdd() {
		const name = newName.trim();
		if (!name) return;
		setAdding(true);
		const res = await apiPost({
			action: "addPeriod",
			name,
			start: newStart,
			end: newEnd,
			pin,
		});
		setAdding(false);
		if (res && res.ok) {
			setPeriods(res.periods);
			// If nothing was selected in LogView yet, default to this new one
			if (!selectedPeriod) setSelectedPeriod(name);
			// Clear the form so the CR can add another
			setNewName("");
			setNewStart("");
			setNewEnd("");
			setMsg({ type: "ok", text: "Class added to schedule." });
		} else {
			setMsg({
				type: "err",
				text: (res && res.error) || "Could not save.",
			});
		}
	}

	async function handleRemove(name) {
		if (
			!confirm(
				`Remove "${name}" from the schedule? This does not delete past attendance records.`,
			)
		)
			return;
		const res = await apiPost({ action: "removePeriod", name, pin });
		if (res && res.ok) {
			setPeriods(res.periods);
			// If the removed one was selected, jump to the first remaining, or clear
			if (selectedPeriod === name) {
				setSelectedPeriod(res.periods.length ? periodName(res.periods[0]) : "");
			}
			if (scheduleViewName === name) setScheduleViewName(null);
			setMsg({ type: "ok", text: "Removed from schedule." });
		} else {
			setMsg({
				type: "err",
				text: (res && res.error) || "Could not save.",
			});
		}
	}

	return (
		<>
			<div className="section-title">PERIODS</div>

			<div className="chip-row">
				{periods.length === 0 ? (
					<span className="empty-note" style={{ padding: 0 }}>
						No periods yet — add one below.
					</span>
				) : (
					periods.map((p) => {
						const name = periodName(p);
						return (
							<div className="chip" key={name}>
								{periodLabel(p)}{" "}
								<button
									onClick={() => handleRemove(name)}
									aria-label={`Remove ${name}`}
								>
									✕
								</button>
							</div>
						);
					})
				)}
			</div>

			<div className="add-period-row" style={{ flexWrap: "wrap" }}>
				<input
					type="text"
					placeholder="e.g. Data Structures"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					style={{ flex: 2, minWidth: 140 }}
				/>
				<input
					type="time"
					value={newStart}
					onChange={(e) => setNewStart(e.target.value)}
					style={{ flex: 1, minWidth: 100 }}
				/>
				<input
					type="time"
					value={newEnd}
					onChange={(e) => setNewEnd(e.target.value)}
					style={{ flex: 1, minWidth: 100 }}
				/>
				<button
					className="btn btn-secondary"
					onClick={handleAdd}
					disabled={adding}
				>
					{adding ? "Adding..." : "Add"}
				</button>
			</div>
		</>
	);
}
