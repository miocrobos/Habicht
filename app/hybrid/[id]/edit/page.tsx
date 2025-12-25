"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { PaintBucket, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BACKGROUND_OPTIONS = [
	{ id: "solid-blue", name: "Blau", style: "#2563eb" },
	{ id: "solid-green", name: "Grün", style: "#16a34a" },
	{ id: "solid-purple", name: "Lila", style: "#9333ea" },
	{ id: "solid-orange", name: "Orange", style: "#f97316" },
	{ id: "solid-pink", name: "Pink", style: "#ec4899" },
	{ id: "solid-yellow", name: "Gelb", style: "#eab308" },
	{ id: "solid-teal", name: "Türkis", style: "#14b8a6" },
	{ id: "solid-indigo", name: "Indigo", style: "#6366f1" },
	{ id: "solid-dark", name: "Dunkel", style: "#1f2937" },
	{ id: "solid-gray", name: "Grau", style: "#6b7280" },
	{ id: "solid-black", name: "Schwarz", style: "#000000" },
	{ id: "solid-red", name: "Rot", style: "#dc2626" },
	{ id: "gradient-sunset", name: "Sunset", style: "linear-gradient(90deg, #ff7e5f, #feb47b)" },
	{ id: "gradient-ocean", name: "Ocean", style: "linear-gradient(90deg, #43cea2, #185a9d)" },
	{ id: "gradient-rainbow", name: "Rainbow", style: "linear-gradient(90deg, #ff9966, #ff5e62, #00c3ff, #ffff1c)" },
];

const ColorPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
	<input
		type="color"
		value={value}
		onChange={e => onChange(e.target.value)}
		className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full cursor-pointer"
		aria-label="Custom Color Picker"
		style={{ background: value }}
	/>
);

export default function EditHybridProfilePage({ params }: { params: { id: string } }) {
	const { t } = useLanguage();
	const router = useRouter();
	const { data: session, status } = useSession();
	const [formData, setFormData] = useState<any>(null);
	const [backgroundImage, setBackgroundImage] = useState("");
	// showZoom: false | 'background' | 'profile'
	const [showZoom, setShowZoom] = useState<false | 'background' | 'profile'>(false);
	const [customColor, setCustomColor] = useState("#2563eb");
	const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);

	useEffect(() => {
		if (formData) {
			setBackgroundImage(formData.backgroundImage || "");
			setCustomColor(formData.customColor || "#2563eb");
			if (formData.backgroundGradient) {
				const found = BACKGROUND_OPTIONS.find(bg => bg.id === formData.backgroundGradient);
				if (found) setSelectedBg(found);
			}
		}
	}, [formData]);

	const handleResetBackground = () => {
		setBackgroundImage("");
		setCustomColor("#2563eb");
		setSelectedBg(BACKGROUND_OPTIONS[0]);
		setFormData((prev: any) => ({ ...prev, backgroundImage: "", customColor: "#2563eb", backgroundGradient: BACKGROUND_OPTIONS[0].id }));
	};

	const previewStyle = {
		background: backgroundImage
			? `url(${backgroundImage}) center/cover no-repeat`
			: selectedBg.id === "custom" ? customColor : selectedBg.style,
		position: "relative" as const,
		minHeight: "180px",
		borderRadius: "1rem",
		overflow: "hidden",
		// Make the overlay more transparent
	};

	// Example: load hybrid data (replace with your actual data loading logic)
	useEffect(() => {
		// ...fetch and setFormData logic here...
	}, []);

	return (
		<>
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<PaintBucket className="w-6 h-6 text-habicht-600" /> {t('editProfile.backgroundLabel')}
				</h2>
				<div className="mb-4 flex flex-wrap gap-3 items-center">
					{BACKGROUND_OPTIONS.map(bg => (
						<button
							key={bg.id}
							type="button"
							onClick={() => {
								setSelectedBg(bg);
								setFormData((prev: any) => ({ ...prev, backgroundGradient: bg.id }));
							}}
							className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-150 ${selectedBg?.id === bg.id ? "border-habicht-600 scale-110" : "border-gray-300 dark:border-gray-600"}`}
							style={{ background: bg.style }}
							aria-label={t(`backgroundOptions.${bg.id}`) || bg.name}
						>
							{selectedBg?.id === bg.id && <span className="text-white text-lg font-bold">✓</span>}
						</button>
					))}
					<ColorPicker value={customColor} onChange={v => {
						setCustomColor(v);
						setSelectedBg({ id: "custom", name: "Custom", style: v });
						setFormData((prev: any) => ({ ...prev, customColor: v, backgroundGradient: "custom" }));
					}} />
				</div>
				<div className="mb-4 flex gap-3">
					<button
						type="button"
						className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
						onClick={handleResetBackground}
					>
						<RefreshCcw className="w-4 h-4" /> {t('editProfile.resetBackground')}
					</button>
				</div>
				<div className="mt-4">
					<div style={previewStyle} className="relative w-full h-40 flex items-center justify-center">
						<div className="absolute inset-0 bg-black/10 dark:bg-black/20" style={{ pointerEvents: "none" }} />
						<span className="relative z-10 text-white text-lg font-semibold drop-shadow-lg">{t('editProfile.livePreview')}</span>
					</div>
				</div>
			</div>

		</>
	);
}
