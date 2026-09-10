"use client";

export default function Header({ title, subLabel, activeTab, onTabChange }) {
	return (
		<>
			<header className="reg-header">
				<div className="title-block">
					<h1>{title}</h1>
					<div className="sub">{subLabel}</div>
				</div>
				<div className="tabs">
					<button
						className={`tab-btn ${activeTab === "log" ? "active" : ""}`}
						onClick={() => onTabChange("log")}
					>
						LOG
					</button>
					<button
						className={`tab-btn ${activeTab === "cr" ? "active" : ""}`}
						onClick={() => onTabChange("cr")}
					>
						CR DESK
					</button>
				</div>
			</header>
			<hr className="divider" />
		</>
	);
}
