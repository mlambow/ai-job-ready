import { NextRequest, NextResponse } from "next/server";
import {verifyFirebaseToken} from "@/lib/firebase/verify-token";
import {
    completeResumeVersionProcessing, failResumeVersionProcessing,
    getResumeById,
    getResumeVersionById,
    markResumeVersionProcessing
} from "@/lib/firebase/admin-resumes";
import {downloadResumeFile} from "@/lib/appwrite/storage";
import {extractResumeText} from "@/lib/resumes/extractText";

export async function POST(request: NextRequest, {params}: { params: Promise<{ resumeId: string; }>; },){
  let resumeId: string | null = null;
  let userId: string | null = null;
  let versionId: string | null = null;

  try {
      //Authenticate the user

      const decodedToken = await verifyFirebaseToken(request)
      userId = decodedToken?.uid;

      //Get resume ID
      const routeParams = await params;

      resumeId = routeParams.resumeId;

      //Get the parent resume
      const resume = await getResumeById(userId, resumeId);
      if (!resume) {
          return NextResponse.json({
              error: "Resume not found"
          }, {
              status: 404
          })
      }

      versionId = resume.currentVersionId

      //Get the current version
      const version = await getResumeVersionById(userId, resumeId, versionId);
      if(!version) {
          return NextResponse.json({
              error: "Version not found"
          }, {
              status: 404
          })
      }

      //Mark resume as processing
      await markResumeVersionProcessing(userId, resumeId, versionId);

      //Download the file
      const file = await downloadResumeFile(version.fileId);

      //Extract text
      const extractedText = await extractResumeText(file, version.fileType);

      //Complete processing and save text
      await completeResumeVersionProcessing(userId, resumeId, versionId, extractedText);

      return NextResponse.json({
          message: "Resume processed successfully.",
          resumeId: resumeId,
          versionId: versionId
      });
  } catch (error) {
      console.error("Resume processing error", error);

      //Failed processing
      if(userId && resumeId && versionId){
          await failResumeVersionProcessing(userId, resumeId, versionId);
      }

      return NextResponse.json({
          error: error instanceof Error ? error.message : "Failed to process resume",
      }, {
          status: 500
      })
  }
}