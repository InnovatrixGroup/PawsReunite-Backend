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
    title: "Johnny Missing",
    species: "Dog",
    breed: "Samoyed",
    color: "White",
    description:
      "Johnny is a friendly and energetic Samoyed who went missing on July 10, 2023. He is a male dog with a white coat and a white patch on his chest. Max is around 2 years old and has a medium build. He is wearing a red collar with a tag that has his name and our contact information. If you see Max or have any information about his whereabouts, please contact us immediately. We miss him dearly, and any help in finding him would be greatly appreciated. Max is a beloved member of our family, and we are anxious to have him back home with us.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/samoyed1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/samoyed2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/samoyed3.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/samoyed4.jpg"
    ],
    suburb: "MOSMAN 2088",
    contactInfo: "0433512626",
    status: "lost",
    userId: null
  },
  {
    title: "Urgent: Missing Dog",
    species: "Dog",
    breed: "Pug",
    color: "Black",
    description:
      "Our beloved Pug named Max went missing on July 10th, 2023, in the Elmwood Avenue area of Anytown. Max is a friendly and well-trained dog with a golden coat and a distinctive white patch on his chest. He is medium-sized and approximately 2 years old. Max was last seen wearing a blue collar with an identification tag.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/pug1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/pug2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/pug3.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/pug4.jpg"
    ],
    suburb: "LINDFIELD 2070",
    contactInfo: "+61(02)8867 8576",
    status: "lost",
    userId: null
  },
  {
    title: "Max",
    species: "Dog",
    breed: "Labrador",
    color: "Cream",
    description:
      "Today, while walking in our neighborhood, I stumbled upon a lost dog that matches the description of a Labrador with a beautiful cream-colored coat. Please contact me as soon as possible!!",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Labrador1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Labrador2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Labrador3.jpg"
    ],
    suburb: "TOORAK 3142",
    contactInfo: "0488329486",
    status: "found",
    userId: null
  },
  {
    title: "Mimi",
    species: "Dog",
    breed: "Pug",
    color: "Brown",
    description:
      "We need your help in locating a beloved family member who has gone missing! Our adorable brown Pug, Mimi, has disappeared, leaving her heartbroken owners desperately searching for her safe return. Mimi is not just a pet; she is a cherished member of our family. She's incredibly friendly, affectionate, and always wears the cutest little smile. Mimi loves belly rubs, playing fetch, and snuggling up on the couch for some quality cuddle time.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/pug5.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/pug6.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/pug7.jpg"
    ],
    suburb: "RICHMOND 2753",
    contactInfo: "0432374657",
    status: "lost",
    userId: null
  },
  {
    title: "Felix",
    species: "Dog",
    breed: "Poodle",
    color: "Other",
    description: "Please contact me if your lost pet matches the description of this Poodle.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Poodle1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Poodle2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Poodle3.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Poodle4.jpg"
    ],
    suburb: "MOSMAN 2088",
    contactInfo: "0435719283",
    status: "found",
    userId: null
  },
  {
    title: "Missing Cat",
    species: "Cat",
    breed: "Bengal",
    color: "Multi",
    description:
      "Our beloved cat, with a striking Bengal tiger-like color, has gone missing, and we desperately need your immediate assistance in locating our precious feline friend. This situation is urgent, and we are reaching out to the community for help. Our missing cat is a Bengal tiger-colored beauty with mesmerizing patterns on her fur. She has captivating green eyes that will capture your heart in an instant. She means the world to us, and we are deeply worried about her well-being.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Bengal1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Bengal2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Bengal3.jpg"
    ],
    suburb: "MOSMAN 2088",
    contactInfo: "+61 0463746567",
    status: "lost",
    userId: null
  },
  {
    title: "Betty",
    species: "Cat",
    breed: "Ragdoll",
    color: "White",
    description:
      "Our precious Ragdoll cat has gone missing, and we are in dire need of your help to bring our beloved feline friend back home. We are deeply worried and anxious, and we kindly request your assistance in locating our cherished companion.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Ragdoll1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Ragdoll2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Ragdoll3.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Ragdoll4.jpg"
    ],
    suburb: "MASCOT 2020",
    contactInfo: "0414887567",
    status: "lost",
    userId: null
  },
  {
    title: "Lina",
    species: "Dog",
    breed: "Dachshund",
    color: "Black",
    description:
      "Lina is a small black Dachshund with a heartwarming personality. Her wagging tail and soulful eyes can melt anyone's heart. She's not just a pet; she's a cherished member of our family, and her absence is deeply felt. We are offering a substantial reward as a token of our gratitude to anyone who assists in bringing Lina back to us. Your help and kindness will be forever appreciated. If you have any information or have found a dog matching Lina's description, please don't hesitate to contact us.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Dachshund1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Dachshund2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Dachshund3.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Dachshund4.jpg"
    ],
    suburb: "SYDNEY 2000",
    contactInfo: "(02) 8948 3827",
    status: "lost",
    userId: null
  },
  {
    title: "Found Cat",
    species: "Cat",
    breed: "Siamese",
    color: "Multi",
    description:
      "We are thrilled to learn that a Siamese cat has been found! We believe this may be our beloved feline friend. We are eager to be reunited with our cherished companion and express our utmost gratitude to you for discovering her. To ensure that this Siamese cat is indeed our missing pet, we kindly request that you provide us with some verification or proof of ownership. ",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Siamese1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Siamese2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Siamese3.jpg"
    ],
    suburb: "MASCOT 2020",
    contactInfo: "0414887567",
    status: "found",
    userId: null
  },
  {
    title: "Missing Bird",
    species: "Bird",
    breed: "Parrot",
    color: "Multi",
    description:
      "Our missing parrot is a vibrant multi-rainbow colored beauty with a playful and friendly demeanor. Their striking appearance makes them easily recognizable and unforgettable.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Parrot1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Parrot2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Parrot3.jpg"
    ],
    suburb: "SYDNEY 2000",
    contactInfo: "0414887567",
    status: "lost",
    userId: null
  },
  {
    title: "Rabbit Missing",
    species: "Rabbit",
    breed: "Other",
    color: "Grey",
    description:
      "grey rabbit has gone missing, and we are desperately seeking your help to bring our furry friend back home. This situation is urgent, and we are reaching out to the community for assistance.",
    photos: [
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Rabbit1.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Rabbit2.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Rabbit3.jpg",
      "https://pawsreunite.s3.ap-southeast-2.amazonaws.com/Rabbit4.jpg"
    ],
    suburb: "SYDNEY 2000",
    contactInfo: "(02) 8999 3847",
    status: "lost",
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
  },
  {
    content: "I know your house will seem empty without your sweet pet.",
    userId: null,
    createdAt: Date.now()
  },
  {
    content: "I'm here for you if you need anything.",
    userId: null,
    createdAt: Date.now()
  },
  {
    content:
      "Know that cute loved you from the tip of their wet nose to the end of their furry tail.",
    userId: null,
    createdAt: Date.now()
  },
  {
    content:
      "No one could have loved their animal more than you did. How lucky they were to find you.",
    userId: null,
    createdAt: Date.now()
  },
  {
    content:
      "Try not to cry because they are gone. Smile because you had the chance to know such a sweet kitty.",
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
      post.userId = usersCreated[Math.floor(Math.random() * usersCreated.length)].id;
      // post.userId = usersCreated[2].id;
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
