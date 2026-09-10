import { Space_Mono, Libre_Franklin } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-space-mono",
});

const libreFranklin = Libre_Franklin({
	weight: ["400", "500", "600", "700", "800"],
	subsets: ["latin"],
	variable: "--font-libre-franklin",
});

export const metadata = {
	title: "Attendance App",
	description: "Class attendance tracker",
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			className={`${spaceMono.variable} ${libreFranklin.variable}`}
		>
			<body>{children}</body>
		</html>
	);
}
