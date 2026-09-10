"use client";

import { useState, useEffect } from "react";
import { apiGet, isConfigured } from "@/lib/api";
import { periodName } from "@/lib/periods";
import { todayStr, nowLabel } from "@/lib/dates";
import Header from "@/components/Header";
import LogView from "@/components/LogView";
import PinGate from "@/components/PinGate";
import CrDesk from "@/components/CrDesk";

export default function Home() {
	// Which screen is showing: 'log' | 'pin' | 'cr'
	const [view, setView] = useState("log");

	// Data loaded from the Google Sheet on first load
	const [courseName, setCourseName] = useState("My Class");
	const [periods, setPeriods] = useState([]);
	const [selectedPeriod, setSelectedPeriod] = useState("");
	const [pinSetOnServer, setPinSetOnServer] = useState(false);
	const [loading, setLoading] = useState(true);

	// CR Desk session state
	const [pin, setPin] = useState(null);
	const [unlocked, setUnlocked] = useState(false);
	const [crDate, setCrDate] = useState(todayStr());
	const [crSubview, setCrSubview] = useState("periods");
	const [scheduleViewName, setScheduleViewName] = useState(null);

	// One status banner shown under the header (success/error)
	const [msg, setMsg] = useState(null);

	useEffect(() => {
		if (!isConfigured) {
			setLoading(false);
			return;
		}
		(async () => {
			const cfg = await apiGet({ action: "getConfig" });
			if (cfg) {
				setCourseName(cfg.className || "My Class");
				setPeriods(cfg.periods || []);
				setPinSetOnServer(!!cfg.pinSet);
				if (cfg.periods && cfg.periods.length)
					setSelectedPeriod(periodName(cfg.periods[0]));
			}
			setLoading(false);
		})();
	}, []);

	function handleTabChange(tab) {
		setMsg(null);
		if (tab === "cr") setView(unlocked ? "cr" : "pin");
		else setView("log");
	}

	if (!isConfigured) {
		return (
			<div className="book">
				<div className="spine-label">CLASS ATTENDANCE REGISTER</div>
				<div className="page">
					<div className="page-inner">
						<div className="setup-banner">
							<b>Setup needed:</b> This site hasn&apos;t been connected to your
							Google Sheet yet. Open <code>lib/api.js</code>, set{" "}
							<code>API_URL</code> to your deployed Apps Script Web App URL,
							then redeploy.
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="book">
				<div className="spine-label">CLASS ATTENDANCE REGISTER</div>
				<div className="page">
					<div
						className="page-inner"
						style={{ padding: "40px 0", textAlign: "center", color: "#6b6455" }}
					>
						Opening register <span className="loading-dot"></span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="book">
			<div className="spine-label">CLASS ATTENDANCE REGISTER</div>
			<div className="page">
				<div className="page-inner">
					<Header
						title={courseName}
						subLabel={view === "log" ? nowLabel() : "CR Desk"}
						activeTab={view === "log" ? "log" : "cr"}
						onTabChange={handleTabChange}
					/>
					{msg && view !== "pin" && (
						<div className={`msg ${msg.type}`}>{msg.text}</div>
					)}

					{view === "log" && (
						<LogView
							periods={periods}
							selectedPeriod={selectedPeriod}
							setSelectedPeriod={setSelectedPeriod}
							msg={msg}
							setMsg={setMsg}
						/>
					)}
					{view === "pin" && (
						<PinGate
							pinSetOnServer={pinSetOnServer}
							setPinSetOnServer={setPinSetOnServer}
							setPin={setPin}
							setUnlocked={setUnlocked}
							setView={setView}
							msg={msg}
							setMsg={setMsg}
						/>
					)}
					{view === "cr" && (
						<CrDesk
							courseName={courseName}
							setCourseName={setCourseName}
							periods={periods}
							setPeriods={setPeriods}
							pin={pin}
							crDate={crDate}
							setCrDate={setCrDate}
							crSubview={crSubview}
							setCrSubview={setCrSubview}
							scheduleViewName={scheduleViewName}
							setScheduleViewName={setScheduleViewName}
							selectedPeriod={selectedPeriod}
							setSelectedPeriod={setSelectedPeriod}
							setUnlocked={setUnlocked}
							setPin={setPin}
							setView={setView}
							msg={msg}
							setMsg={setMsg}
						/>
					)}
				</div>
			</div>
			<div className="footer-note">
				Tap &quot;CR Desk&quot; to manage periods, roster, and the QR code.
			</div>
		</div>
	);
}
