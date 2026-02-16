import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';

class S3 {
  private static s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: 'eu-central-003',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!
    }
  });

  public static async putFile(key: string, buffer: Buffer) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: 'virtuex',
        Key: key,
        Body: buffer
      })
    );
  }

  public static async rmFile(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: 'virtuex',
        Key: key
      })
    );
  }
}

export default S3;
