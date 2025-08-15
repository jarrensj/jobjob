import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { s3, S3_BUCKET} from "@/lib/s3";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";


function keyFor(userId: string) {
  return `${userId}/resume.pdf`;
}

function s3Ready() {
  return Boolean(process.env.AWS_ACCESS_KEY_ID && 
    process.env.AWS_SECRET_ACCESS_KEY && 
    process.env.AWS_REGION && 
    process.env.S3_BUCKET);
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  if (!s3Ready()) {
    return Response.json(
      { message: "S3 not configured yet. Add AWS_* and S3_BUCKET env vars." },
      { status: 501 }
    );
  }

  // const { searchParams } = new URL(req.url);
  // const contentType = searchParams.get("type") || "application/pdf";
  // if (contentType !== "application/pdf") {
  //   return new Response("Only PDF resumes are allowed.", { status: 400 });
  // }
  // const Key = keyFor(userId);

  // 5‑minute presigned POST, PDF only, max 5 GB
  const { url, fields } = await createPresignedPost(s3, {
    Bucket: S3_BUCKET ?? '',
    Key: keyFor(userId),
    Expires: 300,
  });

  return Response.json({ url, fields });

}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  if (!s3Ready()) {
    return Response.json(
      { message: "S3 not configured yet. Add AWS_* and S3_BUCKET env vars." },
      { status: 501 }
    );
  }

  const Key = keyFor(userId);
  try {
    await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key }));
    const get = new GetObjectCommand({ Bucket: S3_BUCKET, Key });
    const url = await getSignedUrl(s3, get, { expiresIn: 60 * 5 });
    return Response.json({ url, key: Key });
  } catch (e) {
    return new Response("Not found", { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  if (!s3Ready()) {
    return Response.json(
      { message: "S3 not configured yet. Add AWS_* and S3_BUCKET env vars." },
      { status: 501 }
    );
  }
  try {
    const Key = keyFor(userId);
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key }));
    return new Response(null, { status: 204 });
  } catch (e) {
    return new Response("Failed to delete resume", { status: 500 });
  }
}
