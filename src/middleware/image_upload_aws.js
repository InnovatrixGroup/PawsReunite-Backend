// Importing the Multer library, which is used for handling file uploads in Node.js.
const multer = require("multer");

// Importing the necessary components from the @aws-sdk/client-s3 package. These components are used for interacting with the Amazon S3 service for file storage.
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Importing the uuid package, which is used for generating unique IDs for the files that are uploaded to the Amazon S3 service.
const { v4: uuidv4 } = require("uuid");

// Importing the dotenv library for environment variable management.
const dotenv = require("dotenv");
dotenv.config();

// Configuring the Multer storage engine to store uploaded files in memory. The memoryStorage function is used to specify this storage option.
const storage = multer.memoryStorage({
  destination: function (request, file, callback) {
    callback(null, "");
  }
});

// Configuring the Multer file filter to only accept JPEG and PNG files. The fileFilter function is used to specify this filter option.
const fileFilter = (request, file, callback) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    callback(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

// Configuring the Multer upload middleware to use the storage and file filter options that were configured above.
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Creating a new S3Client instance, which is used for interacting with the Amazon S3 service.
const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

// Defining a function that uploads an array of files to the Amazon S3 service. This function is used in the PostController.js file.
// This function handles the uploading of files to Amazon S3 and returns an array of URLs for the uploaded files.
const uploadFilesToS3 = async (files) => {
  try {
    // Using the map method on the files array to create an array of promises. Each promise represents the upload of a single file to Amazon S3. The promises are created using async/await syntax.
    // The uploadPromises array is then passed to the Promise.all method, which resolves all of the promises in the array. The results of the promises are stored in the results array.
    const uploadPromises = files.map(async (file) => {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}-${file.originalname}`,
        Body: file.buffer
      };

      // Creating a new PutObjectCommand instance, which is used to upload a file to the Amazon S3 service. The PutObjectCommand instance is configured with the parameters that are required to upload a file to Amazon S3.
      const command = new PutObjectCommand(params);

      // The send method of the S3Client instance is used to send the PutObjectCommand to the Amazon S3 service. The send method returns a promise that resolves to an object containing information about the uploaded file.
      const data = await s3Client.send(command);
      return params.Key;
    });

    // Using Promise.all to wait for all the upload promises to resolve. This line ensures that all files have finished uploading before proceeding.
    const results = await Promise.all(uploadPromises);

    // Creating an array urls by mapping over the results array, which contains the uploaded file keys. This line constructs the public URLs for the uploaded files using the S3 bucket URL and the file keys.
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
