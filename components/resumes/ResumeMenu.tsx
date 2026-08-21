import {Download, Eye, RefreshCw, Trash2, History,} from "lucide-react";

interface ResumeMenuProps {
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
    onResumeView?: () => void;
    onResumeDownload?: () => void;
    onReplace?: () => void;
    onVersionHistory?: () => void;
    onDelete: () => void;
}

export function ResumeMenu({
                               menuOpen,
                               setMenuOpen,
                               onResumeView,
                               onResumeDownload,
                                onReplace,
                                onVersionHistory,
                               onDelete,
                           }: ResumeMenuProps) {
    if (!menuOpen) return null;

    return (
        <>
            {/* Invisible backdrop to dismiss menu on outside click */}
            <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
            />

            {/* Dropdown Menu Container */}
            <div className="absolute right-0 top-full z-40 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {onResumeView && (
                    <button
                        type="button"
                        onClick={() => {
                            setMenuOpen(false);
                            onResumeView();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800/80 hover:text-white"
                    >
                        <Eye className="size-4 shrink-0 text-amber-400" />
                        <span className="whitespace-nowrap">View document</span>
                    </button>
                )}

                {onResumeDownload && (
                    <button
                        type="button"
                        onClick={() => {
                            setMenuOpen(false);
                            onResumeDownload();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800/80 hover:text-white"
                    >
                        <Download className="size-4 shrink-0 text-amber-400" />
                        <span className="whitespace-nowrap">Download original</span>
                    </button>
                )}

                {onReplace && (
                    <button
                        type="button"
                        onClick={() => {
                            setMenuOpen(false);
                            onReplace();
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                        <RefreshCw className="size-4 text-amber-400" />
                        <span className="whitespace-nowrap">Replace resume</span>
                    </button>
                )}

                {onVersionHistory && (
                    <button
                        type="button"
                        onClick={() => {
                            setMenuOpen(false);
                            onVersionHistory();
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                        <History className="size-4 text-zinc-400" />
                        Version history
                    </button>
                )}

                {(onResumeView || onResumeDownload || onReplace) && (
                    <div className="my-1 border-t border-zinc-800/80" />
                )}

                <button
                    type="button"
                    onClick={() => {
                        setMenuOpen(false);
                        onDelete();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                >
                    <Trash2 className="size-4 shrink-0 text-rose-400" />
                    <span className="whitespace-nowrap">Delete resume</span>
                </button>
            </div>
        </>
    );
}