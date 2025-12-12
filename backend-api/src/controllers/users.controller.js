const userService = require('../services/users.service');
const JSend = require('../jsend');
const ApiError = require('../api-error');


async function getAllUsers(req, res, next) {
    try {
        const users = await userService.getAllUsers(req.query);
        return res.json(JSend.success(users));
    } catch (error) {
        next(error);
    }
}


async function searchUsersOrTasks(req, res, next) {
    try {
        const results = await userService.searchUsersOrTasks(req.query);
        return res.json(JSend.success(results));
    } catch (error) {
        next(error);
    }
}


async function getUserById(req, res, next) {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return res.json(JSend.success(user));
    } catch (error) {
        next(error);
    }
}


async function updateUser(req, res, next) {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        if (!updatedUser) {
            throw new ApiError(404, 'User not found or update failed');
        }
        return res.json(JSend.success(updatedUser));
    } catch (error) {
        next(error);
    }
}

async function deleteUser(req, res, next) {
    try {
        const deleted = await userService.deleteUser(req.params.id);
        if (!deleted) {
            throw new ApiError(404, 'User not found');
        }
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}


async function getUserStats(req, res, next) {
    try {
        const stats = await userService.getUserStats(req.params.id);
        return res.json(JSend.success(stats));
    } catch (error) {
        next(error);
    }
}

async function getUsersByRole(req, res, next) {
    try {
        const users = await userService.getUsersByRole(req.params.role);
        return res.json(JSend.success(users));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUsers,
    searchUsersOrTasks,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
    getUsersByRole,
};
