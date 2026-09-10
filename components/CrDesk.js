"use client";

import { useState, useEffect, useCallback } from "react";
import { getAttendance, getRoster } from "@/lib/api";
import ClassNameEditor from "./crdesk/ClassNameEditor";
import PeriodsEditor from "./crdesk/PeriodsEditor";
import AttendanceLog from "./crdesk/AttendanceLog";
import RosterEditor from "./crdesk/RosterEditor";
import ClassSchedule from "./crdesk/ClassSchedule";
// Placeholder — final piece
// import ShareQr from "./crdesk/ShareQr";

export default function CrDesk({
	courseName,
	setCourseName,
	periods,
	setPeriods,
	pin,
	crDate,
	setCrDate,
	crSubview,
	setCrSubview,
	scheduleViewName,
	setScheduleViewName,
	selectedPeriod,
	setSelectedPeriod,
	setUnlocked,
	setPin,
	setView,
	setMsg,
}) {
	const [attendance, setAttendance] = useState({});
	const [roster, setRoster] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadAttendance = useCallback(async () => {
		const data = await getAttendance(crDate);
		setAttendance(data || {});
	}, [crDate]);

	const loadRoster = useCallback(async () => {
		const data = await getRoster();
		setRoster(data || []);
	}, []);

	useEffect(() => {
		setLoading(true);
		Promise.all([loadAttendance(), loadRoster()]).finally(() =>
			setLoading(false),
		);
	}, [loadAttendance, loadRoster]);

	function handleLock() {
		setUnlocked(false);
		setPin(null);
		setScheduleViewName(null);
		setMsg(null);
		setView("log");
	}

	if (loading) {
		return (
			<div style={{ padding: "40px 0", textAlign: "center", color: "#6b6455" }}>
				Loading CR Desk <span className="loading-dot"></span>
			</div>
		);
	}

	return (
		<>
			<div style={{ marginTop: -8, marginBottom: 4 }}>
				<span className="stamp">UNLOCKED</span>
			</div>

			<ClassNameEditor
				courseName={courseName}
				setCourseName={setCourseName}
				pin={pin}
				setMsg={setMsg}
			/>

			<PeriodsEditor
				periods={periods}
				setPeriods={setPeriods}
				pin={pin}
				selectedPeriod={selectedPeriod}
				setSelectedPeriod={setSelectedPeriod}
				scheduleViewName={scheduleViewName}
				setScheduleViewName={setScheduleViewName}
				setMsg={setMsg}
			/>

			<AttendanceLog
				periods={periods}
				attendance={attendance}
				crDate={crDate}
				setCrDate={setCrDate}
				pin={pin}
				reloadAttendance={loadAttendance}
				setMsg={setMsg}
			/>

			<RosterEditor
				roster={roster}
				crSubview={crSubview}
				setCrSubview={setCrSubview}
				pin={pin}
				reloadRoster={loadRoster}
				setMsg={setMsg}
			/>

			<ClassSchedule
				periods={periods}
				setPeriods={setPeriods}
				attendance={attendance}
				crDate={crDate}
				courseName={courseName}
				scheduleViewName={scheduleViewName}
				setScheduleViewName={setScheduleViewName}
				pin={pin}
				setMsg={setMsg}
			/>

			<div className="section-title">SHARE WITH CLASS</div>
			<div className="empty-note">ShareQr coming next…</div>

			<div style={{ marginTop: 18 }}>
				<button className="btn-ghost" onClick={handleLock}>
					Lock CR Desk
				</button>
			</div>
		</>
	);
}
