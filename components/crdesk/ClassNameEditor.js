"use client";

import { useState, useEffect } from "react";
import { apiPost } from "@/lib/api";

export default function ClassNameEditor({
	courseName,
	setCourseName,
	pin,
	setMsg,
}) {
	// Local copy of the input value — separate from courseName so
	// the user can type without instantly overwriting the "official" name
	const [value, setValue] = useState(courseName);
	const [saving, setSaving] = useState(false);

	// If courseName changes elsewhere (e.g. reloaded from server), sync it in
	useEffect(() => {
		setValue(courseName);
	}, [courseName]);

	async function handleSave() {
		const val = value.trim();
		if (!val) return;
		setSaving(true);
		const res = await apiPost({
			action: "setClassName",
			className: val,
			pin,
		});
		setSaving(false);
		if (res && res.ok) {
			setCourseName(val); // update parent state — the header re-renders instantly
			setMsg({ type: "ok", text: "Class name saved." });
		} else {
			setMsg({
				type: "err",
				text: (res && res.error) || "Could not save.",
			});
		}
	}

	return (
		<div className="field">
			<label>Class name (shown to everyone)</label>
			<div className="row2">
				<input
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
				<button
					className="btn btn-secondary"
					onClick={handleSave}
					disabled={saving}
				>
					{saving ? "Saving..." : "Save"}
				</button>
			</div>
		</div>
	);
}
