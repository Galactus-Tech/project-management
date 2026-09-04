import React, { useRef, useState } from "react";
import {
    Paperclip,
    FileText,
    Image,
    FileCode,
    FileArchive,
    File,
    Trash2,
    Download,
    UploadCloud,
    ExternalLink
} from "lucide-react";
import { Attachment, Task } from "../../types";
import { useAppDispatch } from "../../app/store";
import { updateTask } from "../../features/workspaceSlice";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface AttachmentListProps {
    task: Task;
    className?: string;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ task, className = "" }) => {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const attachments = task.attachments || [];

    const formatFileSize = (bytes: number): string => {
        if (!bytes || bytes === 0) return "0 B";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (mimeType?: string, name?: string) => {
        const ext = name?.split('.').pop()?.toLowerCase() || '';
        if (mimeType?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
            return <Image className="size-4 text-purple-500 shrink-0" />;
        }
        if (mimeType === 'application/pdf' || ext === 'pdf') {
            return <FileText className="size-4 text-red-500 shrink-0" />;
        }
        if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
            return <FileArchive className="size-4 text-amber-500 shrink-0" />;
        }
        if (['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py'].includes(ext)) {
            return <FileCode className="size-4 text-blue-500 shrink-0" />;
        }
        return <File className="size-4 text-zinc-400 shrink-0" />;
    };

    const saveAttachments = (updatedAttachments: Attachment[]) => {
        const updated: Task = {
            ...task,
            attachments: updatedAttachments,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
    };

    const processFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newAttachments: Attachment[] = Array.from(files).map((file) => {
            const isImg = file.type.startsWith("image/");
            return {
                id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                name: file.name,
                size: file.size,
                type: file.type || "application/octet-stream",
                url: isImg ? URL.createObjectURL(file) : undefined,
                uploadedAt: new Date().toISOString(),
                uploadedBy: {
                    id: "user_1",
                    name: "Alex Smith",
                    email: "alex@example.com",
                },
            };
        });

        saveAttachments([...attachments, ...newAttachments]);
        toast.success(`Uploaded ${newAttachments.length} file${newAttachments.length > 1 ? "s" : ""}`);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const handleDelete = (attachmentId: string) => {
        const updated = attachments.filter((a) => a.id !== attachmentId);
        saveAttachments(updated);
        toast.success("Attachment removed");
    };

    const handleDownload = (att: Attachment) => {
        if (att.url) {
            const a = document.createElement("a");
            a.href = att.url;
            a.download = att.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Mock file download
            const blob = new Blob([`Sample file content for ${att.name}`], { type: att.type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = att.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        toast.success(`Downloaded ${att.name}`);
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                    <Paperclip className="size-3.5 text-zinc-500" />
                    <span>Attachments</span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                        ({attachments.length})
                    </span>
                </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                    isDragging
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30"
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                />
                <div className="flex flex-col items-center justify-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <UploadCloud className="size-5 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Drop files here or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">
                        Supports images, PDFs, archives, and docs
                    </span>
                </div>
            </div>

            {/* List of Attachments */}
            {attachments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                    {attachments.map((att) => (
                        <div
                            key={att.id}
                            className="group flex items-center justify-between gap-2.5 p-2 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
                        >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {getFileIcon(att.type, att.name)}
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-xs">
                                        {att.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                                        <span>{formatFileSize(att.size)}</span>
                                        <span>•</span>
                                        <span>{new Date(att.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDownload(att)}
                                    className="size-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                    title="Download file"
                                >
                                    <Download className="size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(att.id)}
                                    className="size-7 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 opacity-80 group-hover:opacity-100"
                                    title="Delete file"
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
