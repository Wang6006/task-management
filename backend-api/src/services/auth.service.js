const knex = require('../database/knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../api-error');

function userRepository() {
    return knex('USER');
}

function readUserData(payload) {
    return {
        ...(payload.username && { USER_Username: payload.username }),
        ...(payload.email && { USER_Email: payload.email }),
        ...(payload.password && { USER_Password: payload.password }),
        ...(payload.role && { USER_Role: payload.role }),
    };
}

async function register(payload) {
    const userData = readUserData(payload);

    userData.USER_Password = await bcrypt.hash(userData.USER_Password, 10);
    userData.USER_Role = userData.USER_Role || 'user';

    const [max] = await userRepository().max('USER_Id as maxId');
    userData.USER_Id = (max.maxId || 0) + 1;

    const [user] = await userRepository()
        .insert(userData)
        .returning(['USER_Id', 'USER_Username', 'USER_Role']);

    return {
        userId: String(user.USER_Id),
        username: user.USER_Username,
        role: user.USER_Role,
    };
}

async function login(username, password) {
    const user = await userRepository()
        .where('USER_Username', username)
        .orWhere('USER_Email', username)
        .first();

    if (!user) {
        throw new ApiError(403, 'Invalid username or email');
    }

    const valid = await bcrypt.compare(password, user.USER_Password);
    if (!valid) {
        throw new ApiError(403, 'Invalid password');
    }

    const token = jwt.sign(
        {
            userId: user.USER_Id,
            username: user.USER_Username,
            role: user.USER_Role,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );

    return {
        userId: String(user.USER_Id),
        token,
        role: user.USER_Role,
    };
}

async function isUsernameExists(username) {
    const user = await userRepository().where('USER_Username', username).first();
    return !!user;
}

async function isEmailExists(email) {
    const user = await userRepository().where('USER_Email', email).first();
    return !!user;
}

module.exports = {
    login,
    register,
    isUsernameExists,
    isEmailExists,
};
