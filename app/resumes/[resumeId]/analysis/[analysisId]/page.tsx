import { Suspense } from "react";
import ResumeAnalysisClient from "@/components/analysis/ResumeAnalysisClient";
import {Loader2} from "lucide-react";


function Loading() {
    return (
        <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-4">
            <Loader2 className="size-8 animate-spin text-amber-400" />
            <p className="text-xs text-zinc-400">
                Loading analysis results...
            </p>
        </div>
    );
}

export default function Page({params}: { params: Promise<{ resumeId: string; analysisId: string;}>; }) {
    return (
        <Suspense fallback={<Loading />}>
            <ResumeAnalysisClient params={params} />
        </Suspense>
    );
}