// Importing the Mongoose library
const mongoose = require("mongoose");

// Importing the dbConnect and dbClose functions from the "database.js" file
const { dbConnect, dbClose } = require("./database");

// Importing the User, Post, Role, and Comment models from their respective files
const { User } = require("./models/UserModel");
const { Post } = require("./models/PostModel");
const { Role } = require("./models/RoleModel");
const { Comment } = require("./models/CommentModel");

// Importing the dotenv library for environment variable management
const dotenv = require("dotenv");
dotenv.config();

const { hashPassword } = require("./services/auth_services");

// Array of role objects to be inserted into the database
const roles = [
  {
    name: "regular",
    description:
      "A regular user can view, create and read data. They can edit and delete only their own data."
  },
  {
    name: "admin",
    description:
      "An admin user has full access and permissions to do anything and everything within this API."
  },
  {
    name: "banned",
    description: "A banned user can read data, but cannot do anything else."
  }
];

// Array of user objects to be inserted into the database
const users = [
  {
    username: "tom",
    email: "tom@gmail.com",
    password: "123456",
    role: null
  },
  {
    username: "eddy",
    email: "eddy@gmail.com",
    password: "123456",
    role: null
  },
  {
    username: "ji",
    email: "ji@gmail.com",
    password: "123456",
    role: null
  }
];

// Array of post objects to be inserted into the database
const posts = [
  {
    title: "Johnny",
    species: "dog",
    breed: "German Specie",
    color: "cream",
    description:
      "Max is a friendly and energetic Labrador Retriever who went missing on July 10, 2023. He is a male dog with a golden coat and a white patch on his chest. Max is around 2 years old and has a medium build. He is wearing a red collar with a tag that has his name and our contact information. If you see Max or have any information about his whereabouts, please contact us immediately. We miss him dearly, and any help in finding him would be greatly appreciated. Max is a beloved member of our family, and we are anxious to have him back home with us.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/cat1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/cat2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/dog2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/dog1.jpg"
    ],
    suburb: "2000",
    contactInfo: "0433512626",
    status: "lost",
    userId: null
  },
  {
    title: "peter",
    species: "cat",
    breed: "German Specie",
    color: "white",
    description:
      "Our beloved Labrador Retriever named Max went missing on July 10th, 2023, in the Elmwood Avenue area of Anytown. Max is a friendly and well-trained dog with a golden coat and a distinctive white patch on his chest. He is medium-sized and approximately 2 years old. Max was last seen wearing a blue collar with an identification tag.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/dog1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/dog2.jpg"
    ],
    suburb: "2012",
    contactInfo: "0433512626",
    status: "found",
    userId: null
  }
];

// Array of comment objects to be inserted into the database
const comments = [
  {
    content: "i found this dog",
    userId: null,
    createdAt: Date.now()
  },
  {
    content: "hopefully she can back home soon",
    userId: null,
    createdAt: Date.now()
  },
  {
    content: "this dog",
    userId: null,
    createdAt: Date.now()
  }
];

let databaseURL = "";
// Switch statement to determine the database URL based on the NODE_ENV environment variable
switch (process.env.NODE_ENV.toLowerCase()) {
  case "prod":
  case "production":
    databaseURL = process.env.DATABASE_URL;
    break;
  case "development":
  case "dev":
    databaseURL = "mongodb://127.0.0.1:27017/PawsReunite";
    break;
  case "test":
    databaseURL = "mongodb://127.0.0.1:27017/PawsReunite_Test";
    break;
  default:
    console.error("Incorrect JS environment specified, database will not be connected.");
    break;
}

// Connecting to the database using the dbConnect function and the determined databaseURL
dbConnect(databaseURL)
  .then(() => console.log("Database connected!"))
  .catch((error) =>
    console.log(`
  Some error occurred connecting to the database! It was: 
  ${error}
`)
  )
  .then(async () => {
    // Checking if the WIPE environment variable is set to "true"
    if (process.env.WIPE == "true") {
      // Getting a list of all collections in the database
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionName = collections.map((collection) => collection.name);

      // Drop all collections before seeding
      await Promise.all(collectionName.map((name) => mongoose.connection.db.dropCollection(name)));
      console.log("Old DB data deleted.");
    }
  })
  .then(async () => {
    // Inserting the roles into the Role collection and storing the created roles
    const rolesCreated = await Role.insertMany(roles);

    // assigning roles to users, first two user are regular, last one is admin
    users[0].roleId = rolesCreated[0].id;
    users[1].roleId = rolesCreated[0].id;
    users[2].roleId = rolesCreated[1].id;
    for (const user of users) {
      user.password = await hashPassword(user.password);
    }
    const usersCreated = await User.insertMany(users);

    for (const post of posts) {
      // Assigning a random user ID to each post from the created users
      // post.userId = usersCreated[Math.floor(Math.random() * usersCreated.length)].id;
      post.userId = usersCreated[2].id;
    }
    const postsCreated = await Post.insertMany(posts);

    for (const comment of comments) {
      // Assigning a random user ID and post ID to each comment from the created users and posts
      comment.userId = usersCreated[Math.floor(Math.random() * usersCreated.length)].id;
      comment.postId = postsCreated[Math.floor(Math.random() * postsCreated.length)].id;
    }
    const commentsCreated = await Comment.insertMany(comments);

    console.log(
      "New DB data created.\n" +
        JSON.stringify(
          {
            roles: rolesCreated,
            users: usersCreated,
            posts: postsCreated,
            comments: commentsCreated
          },
          null,
          4
        )
    );
  })
  .then(() => {
    // Closing the database connection using the dbClose function
    dbClose();
    console.log("DB seed connection closed");
  });
