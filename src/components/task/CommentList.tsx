import React, { useState } from "react";
import { format } from "date-fns";
import { MessageSquare, Send, Trash2, User as UserIcon } from "lucide-react";
import { Comment, Task } from "../../types";
import { useAppDispatch } from "../../app/store";
import { updateTask } from "../../features/workspaceSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface CommentListProps {
    task: Task;
    className?: string;
}

export const CommentList: React.FC<CommentListProps> = ({ task, className = "" }) => {
    const dispatch = useAppDispatch();
    const [newComment, setNewComment] = useState("");
    const comments = task.comments || [];

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newComment.trim();
        if (!trimmed) return;

        const comment: Comment = {
            id: `c_${Date.now()}`,
            taskId: task.id,
            userId: "user_1",
            content: trimmed,
            createdAt: new Date().toISOString(),
            user: {
                id: "user_1",
                name: "Alex Smith",
                email: "alex@example.com",
            },
        };

        const updated: Task = {
            ...task,
            comments: [...comments, comment],
            updatedAt: new Date().toISOString(),
        };

        dispatch(updateTask(updated));
        setNewComment("");
        toast.success("Comment added");
    };

    const handleDeleteComment = (commentId: string) => {
        const updated: Task = {
            ...task,
            comments: comments.filter((c) => c.id !== commentId),
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
        toast.success("Comment deleted");
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                    <MessageSquare className="size-3.5 text-zinc-500" />
                    <span>Discussion</span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                        ({comments.length})
                    </span>
                </div>
            </div>

            {/* Comments Stream */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                    <div className="text-center py-6 text-zinc-400 dark:text-zinc-500 text-xs">
                        No comments yet. Start the conversation!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="group flex gap-2.5 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 text-xs"
                        >
                            <Avatar className="size-7 shrink-0">
                                <AvatarImage src={comment.user?.image} alt={comment.user?.name} />
                                <AvatarFallback className="text-[10px] bg-zinc-200 dark:bg-zinc-800">
                                    {comment.user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                                        {comment.user?.name || "User"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-400">
                                            {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity"
                                            title="Delete comment"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 text-xs whitespace-pre-wrap leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handleAddComment} className="space-y-2 pt-1">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a reply or note... (press Post to submit)"
                    className="min-h-16 text-xs resize-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim()}
                        className="h-8 text-xs gap-1.5 px-3"
                    >
                        <Send className="size-3" />
                        Post Comment
                    </Button>
                </div>
            </form>
        </div>
    );
};
