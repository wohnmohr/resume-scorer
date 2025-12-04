"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
	onFileSelect: (file: File) => void;
	disabled?: boolean;
}

export default function FileUploader({
	onFileSelect,
	disabled = false,
}: FileUploaderProps) {
	const [isDragActive, setIsDragActive] = useState(false);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0) {
				onFileSelect(acceptedFiles[0]);
			}
		},
		[onFileSelect]
	);

	const { getRootProps, getInputProps, isDragReject } = useDropzone({
		onDrop,
		accept: {
			"application/pdf": [".pdf"],
		},
		multiple: false,
		disabled,
		onDragEnter: () => setIsDragActive(true),
		onDragLeave: () => setIsDragActive(false),
	});

	return (
		<div
			{...getRootProps()}
			className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
        ${
					isDragActive
						? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-cyan-50 shadow-lg"
						: isDragReject
						? "border-rose-500 bg-gradient-to-r from-rose-50 to-orange-50"
						: "border-slate-300 hover:border-indigo-400"
				}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
		>
			<input {...getInputProps()} />
			<div className="space-y-4">
				<div
					className={`mx-auto w-14 h-14 ${
						isDragActive ? "text-indigo-600" : "text-slate-400"
					}`}
				>
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
				</div>
				<div>
					<p className="text-lg text-white font-semibold text-slate-900">
						{isDragActive ? "Drop your resume here" : "Upload your resume"}
					</p>
					<p className="text-sm text text-slate-600 mt-2">
						Drag and drop your PDF resume here, or click to browse
					</p>
					<p className="text-xs text-white mt-1">Only PDF files are accepted</p>
				</div>
			</div>
		</div>
	);
}
