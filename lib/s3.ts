// S3 client for uploading/downloading resumes

// VERCEL Deployment
    // AWS S3 will automatically load AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
    // https://vercel.com/templates/next.js/aws-s3-image-upload-nextjs


import { S3Client } from "@aws-sdk/client-s3";

export const S3_BUCKET = process.env.S3_BUCKET;

// AWS SDK will auto-read AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
export const s3 = new S3Client({ 
    region: process.env.AWS_REGION || "us-east-2",
});


