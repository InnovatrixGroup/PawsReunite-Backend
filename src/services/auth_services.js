const { User } = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const crypto = require("crypto");

// Import the dotenv module to load environment variables
const dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();

// a function to hash the user's password
const hashPassword = async (password) => {
  // Generate a random string and jumble it up X amount of times, where X is saltRounds.
  let saltToAdd = await bcrypt.genSalt(saltRounds);
  // Hash the password and attach the salt to it.
  let hashedPassword = await bcrypt.hash(password, saltToAdd);
  return hashedPassword;
};

async function validateHashedData(providedUnhashedData, storedHashedData) {
  return await bcrypt.compare(providedUnhashedData, storedHashedData);
}

// --------------------------------------
// ----- Encryption & decryption functionality
let encAlgorithm = "aes-256-cbc";
let encPrivateKey = crypto.scryptSync(process.env.ENC_KEY, "SpecialSalt", 32);
let encIV = crypto.scryptSync(process.env.ENC_KEY, "SpecialSalt", 16);
let cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
let decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);

// Convert a given string into an encrypted string.
function encryptString(data) {
  cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
  return cipher.update(data, "utf8", "hex") + cipher.final("hex");
}

// Turn the encrypted data back into a plaintext string.
function decryptString(data) {
  decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);
  return decipher.update(data, "hex", "utf8") + decipher.final("utf8");
}

// Assumes an encrypted string is a JSON object.
// Decrypts that string and turns it into a regular JavaScript object.
function decryptObject(data) {
  return JSON.parse(decryptString(data));
}

// --------------------------------------
// ----- JWT functionality
function generateJWT(payloadObj) {
  return jwt.sign(payloadObj, process.env.JWT_SECRET, { expiresIn: "1d" });
}

async function generateUserJWT(userDetails) {
  // Encrypt the payload so that it's not plaintext when viewed outside of this app.
  let encryptedUserData = encryptString(JSON.stringify(userDetails));
  // The expiresIn option only works if the payload is an object, not a string.
  return generateJWT({ data: encryptedUserData });
}

async function verifyUserJWT(userJWT) {
  // Verify that the JWT is still valid.
  let userJwtVerified = jwt.verify(userJWT, process.env.JWT_SECRET, { complete: true });

  // Decrypt the encrypted payload.
  let decryptedJwtPayload = decryptString(userJwtVerified.payload.data);
  let userData = JSON.parse(decryptedJwtPayload);

  // Find the user mentioned in the JWT.
  let targetUser = await User.findById(userData.userId).exec();
  // console.log(targetUser);
  // If user exists, return a fresh JWT.
  if (targetUser) {
    let newJWT = generateJWT({ data: userJwtVerified.payload.data });
    return { targetUser, newJWT };
  } else {
    // Otherwise, user details are invalid and they don't get a new token.
    // When a frontend receives this error, it should redirect to a sign-in page.
    throw new Error({ message: "Invalid user token." });
  }
}

module.exports = {
  hashPassword,
  validateHashedData,
  encryptString,
  decryptString,
  decryptObject,
  generateJWT,
  generateUserJWT,
  verifyUserJWT
};
