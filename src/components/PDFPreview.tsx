"use client";

import { useEffect, useState } from "react";

interface PDFPreviewProps {
	file: File;
	isOpen: boolean;
	onClose: () => void;
}

export default function PDFPreview({ file, isOpen, onClose }: PDFPreviewProps) {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		// Create object URL for the PDF file
		const url = URL.createObjectURL(file);
		setPdfUrl(url);

		// Cleanup function
		return () => {
			URL.revokeObjectURL(url);
		};
	}, [file, isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-200">
				{/* Modal Header */}
				<div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/30">
					<h3 className="text-lg font-semibold text-slate-900">PDF Preview</h3>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-100 rounded-lg p-1"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Modal Content */}
				<div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)] bg-slate-50">
					{pdfUrl && (
						<div className="space-y-4">
							<div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
								<div className="p-2 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-200">
									<p className="text-sm text-slate-600 font-medium">
										PDF Preview
									</p>
								</div>
								<div className="h-96">
									<iframe
										src={pdfUrl}
										className="w-full h-full border-0"
										title="PDF Preview"
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
