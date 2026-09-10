"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

export default function PinGate({
	pinSetOnServer,
	setPinSetOnServer,
	setPin,
	setUnlocked,
	setView,
	msg,
	setMsg,
}) {
	const [value, setValue] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit() {
		const val = value.trim();
		if (!val || val.length < 4) {
			setMsg({ type: "err", text: "PIN must be at least 4 digits." });
			return;
		}

		setSubmitting(true);

		if (!pinSetOnServer) {
			// First run on this sheet: save the PIN on the server, then unlock
			const res = await apiPost({ action: "setPin", pin: val });
			setSubmitting(false);

			if (res && res.ok) {
				setPin(val);
				setPinSetOnServer(true);
				setUnlocked(true);
				setMsg(null);
				setView("cr");
			} else {
				setMsg({
					type: "err",
					text: (res && res.error) || "Could not save PIN.",
				});
			}
		} else {
			// PIN already exists: verify it against the server
			const res = await apiPost({ action: "checkPin", pin: val });
			setSubmitting(false);

			if (res && res.ok) {
				setPin(val);
				setUnlocked(true);
				setMsg(null);
				setView("cr");
			} else {
				setMsg({ type: "err", text: "Wrong PIN." });
			}
		}
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
	}

	return (
		<div className="pin-gate">
			<div className="lock">🔒</div>

			<p style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>
				{pinSetOnServer
					? "Enter the CR PIN to continue."
					: "Set a PIN to protect the CR Desk. Only share this with yourself."}
			</p>

			<input
				type="password"
				inputMode="numeric"
				maxLength={6}
				placeholder="••••"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				autoFocus
			/>

			{msg && (
				<div
					className={`msg ${msg.type}`}
					style={{ maxWidth: 220, margin: "0 auto 12px" }}
				>
					{msg.text}
				</div>
			)}

			<button
				className="btn btn-primary"
				style={{ maxWidth: 220 }}
				onClick={handleSubmit}
				disabled={submitting}
			>
				{pinSetOnServer ? "Unlock" : "Set PIN"}
			</button>

			<div style={{ marginTop: 14 }}>
				<button
					className="btn-ghost"
					onClick={() => {
						setView("log");
						setMsg(null);
					}}
				>
					Back to attendance log
				</button>
			</div>
		</div>
	);
}
