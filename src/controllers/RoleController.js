
const {Role} = require("../models/RoleModel")
const {User} = require("../models/UserModel")

// Async function to retrieve all roles
const getAllRoles = async (request, response) => {
  try{
    const allRoles = await Role.find({}).exec();
    response.json({
      data: allRoles
    })
  }catch(error){
    response.json({
      error: error.message
    })
  }
}

// Async function to retrieve users with a specific role
const getUsersWithRole = async (request, response) => {
  try{
    const role = await Role.findOne({name: request.params.roleName}).exec();
    const users = await User.find({roleId: role}).exec();
    response.json({
      data: users
    })
  }catch(error){
    response.json({
      error: error.message
    })
  }

}

module.exports = { getAllRoles, getUsersWithRole }