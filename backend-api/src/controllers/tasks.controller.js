const JSend = require('../jsend');
const taskService = require('../services/tasks.service');

async function createTask(req, res, next) {
    try {
        const { userId } = req.user; 
        const task = await taskService.createTask(req.body, userId);
        return res.status(201).json(JSend.success(task));
    } catch (error) {
        next(error);
    }
}

async function updateTask(req, res, next) {
    try {
        const { taskId } = req.params;
        const updated = await taskService.updateTask(taskId, req.body);
        return res.json(JSend.success(updated));
    } catch (error) {
        next(error);
    }
}

async function deleteTask(req, res, next) {
    try {
        const { taskId } = req.params;
        await taskService.deleteTask(taskId);
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function getTasks(req, res, next) {
    try {
        const result = await taskService.getTasks(req.query);
        return res.json(JSend.success(result));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createTask,
    updateTask,
    deleteTask,
    getTasks
};