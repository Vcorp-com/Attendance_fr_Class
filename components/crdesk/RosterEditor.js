"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

export default function RosterEditor({
	roster,
	crSubview,
	setCrSubview,
	pin,
	reloadRoster,
	setMsg,
}) {
	const isOpen = crSubview === "roster";

	return (
		<>
			<div className="section-title">
				ROLL NUMBER ROSTER
				<button
					className="btn-ghost"
					style={{ marginLeft: 8 }}
					onClick={() => setCrSubview(isOpen ? "periods" : "roster")}
				>
					{isOpen ? "hide" : "show / edit"}
				</button>
			</div>

			{isOpen && (
				<>
					{roster.length === 0 ? (
						<div className="empty-note">
							No one has logged in yet, so there&apos;s nothing to register.
							Roll numbers get added automatically the first time each student
							logs in.
						</div>
					) : (
						<>
							<p style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
								Each roll number is locked to the name it first logged in with.
								Fix a typo or free up a mistyped roll number here.
							</p>
							<table className="roster-table">
								<thead>
									<tr>
										<th>Roll No</th>
										<th>Registered Name</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{roster.map((r) => (
										<RosterRow
											key={r.roll}
											roll={r.roll}
											name={r.name}
											pin={pin}
											reloadRoster={reloadRoster}
											setMsg={setMsg}
										/>
									))}
								</tbody>
							</table>
						</>
					)}

					<p
						style={{
							fontSize: 11.5,
							color: "var(--ink-soft)",
							marginTop: 8,
						}}
					>
						Every entry is also a row in your Google Sheet&apos;s
						&quot;Attendance&quot; and &quot;Roster&quot; tabs — open them
						anytime for a backup.
					</p>
				</>
			)}
		</>
	);
}

// Each row has its own input state — that way editing one name
// doesn't cause every other row to re-render on every keystroke.
function RosterRow({ roll, name, pin, reloadRoster, setMsg }) {
	const [value, setValue] = useState(name);
	const [saving, setSaving] = useState(false);
	const [removing, setRemoving] = useState(false);

	async function handleSave() {
		const newName = value.trim();
		if (!newName) return;
		setSaving(true);
		const res = await apiPost({
			action: "updateRoster",
			roll,
			name: newName,
			pin,
		});
		setSaving(false);
		setMsg(
			res && res.ok
				? { type: "ok", text: `Roster updated for ${roll}.` }
				: {
						type: "err",
						text: (res && res.error) || "Could not update.",
					},
		);
		if (res && res.ok) await reloadRoster();
	}

	async function handleRemove() {
		if (
			!confirm(
				`Remove roll number ${roll} from the roster? It can be registered again with any name after this.`,
			)
		)
			return;
		setRemoving(true);
		const res = await apiPost({ action: "removeRoster", roll, pin });
		setRemoving(false);
		setMsg(
			res && res.ok
				? { type: "ok", text: `Removed ${roll} from roster.` }
				: {
						type: "err",
						text: (res && res.error) || "Could not remove.",
					},
		);
		if (res && res.ok) await reloadRoster();
	}

	return (
		<tr>
			<td>
				<span
					className="rno"
					style={{
						fontFamily: "var(--font-mono), monospace",
						fontSize: 12,
						color: "var(--blue)",
					}}
				>
					{roll}
				</span>
			</td>
			<td>
				<input
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
			</td>
			<td className="roster-actions">
				<button
					className="btn btn-secondary btn-sm"
					onClick={handleSave}
					disabled={saving}
				>
					{saving ? "…" : "Save"}
				</button>
				<button
					className="btn btn-danger btn-sm"
					onClick={handleRemove}
					disabled={removing}
				>
					✕
				</button>
			</td>
		</tr>
	);
}
