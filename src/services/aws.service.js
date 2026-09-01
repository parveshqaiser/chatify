import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export const generateUploadUrl = async (fileName, contentType) => {

    let key = `files/${Date.now()}-${fileName}`;

    let command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    let uploadUrl = await getSignedUrl(r2, command, {
        expiresIn: 60 * 10,
    });

    let publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;

    // https://pub-b7983adc23f54a9a8a147fcfe82e2e16.r2.dev/files/1788019950614-Cover%20Letter.pdf


    return {uploadUrl,key, publicUrl};
};
