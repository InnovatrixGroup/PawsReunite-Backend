const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();

const storage = multer.memoryStorage({
  destination: function (request, file, callback) {
    callback(null, "");
  }
});

const fileFilter = (request, file, callback) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    callback(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

const uploadFilesToS3 = async (files) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}-${file.originalname}`,
        Body: file.buffer
      };

      const command = new PutObjectCommand(params);
      const data = await s3Client.send(command);
      return params.Key;
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map((key) => {
      const bucketUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/`;
      return bucketUrl + key;
    });
    return urls;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  upload,
  uploadFilesToS3
};
