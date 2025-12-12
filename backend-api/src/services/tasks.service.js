const knex = require("../database/knex");
const Paginator = require("./paginator");
const deleteFile = require("../utils/deleteFile");

function taskRepository() {
  return knex("TASK");
}

function statusRepository() {
  return knex("STATUS");
}

function taskStatusHistoryRepository() {
  return knex("TASK_STATUS_HISTORY");
}

function taskAttachmentsRepository() {
  return knex("task_attachments");
}

/**
 * Read task data for database operations
 * @param {Object} payload
 * @returns {Object}
 */
function readTaskData(payload) {
  return {
    ...(payload.title && { title: payload.title }),
    ...(payload.description && { description: payload.description }),

    ...((payload.assignedTo || payload.assigned_to) && {
      assigned_to: payload.assignedTo || payload.assigned_to,
    }),
    ...((payload.dueDate || payload.due_date) && {
      due_date: payload.dueDate || payload.due_date,
    }),
    ...(payload.adminFeedback && { admin_feedback: payload.adminFeedback }),
    ...((payload.status || payload.TASK_Status) && {
      TASK_Status: typeof (payload.status || payload.TASK_Status) === 'string'
        ? statusStringToNumber(payload.status || payload.TASK_Status)
        : (payload.status || payload.TASK_Status),
    }),
  };
}

/**
 * Create a new task
 * @param {Object} payload
 * @param {number} assignedBy
 * @returns {Promise<Object>}
 */
async function createTask(payload, assignedBy) {
  const taskData = readTaskData(payload);
  taskData.assigned_by = assignedBy;
  taskData.TASK_Status = taskData.TASK_Status || 1; // Default to first status (pending)
  taskData.admin_feedback = taskData.admin_feedback || "";

  // Generate new task ID
  const [maxId] = await taskRepository().max("id as maxId");
  taskData.id = (maxId.maxId || 0) + 1;

  const [task] = await taskRepository().insert(taskData).returning("*");

  // Log status history
  await logStatusChange(task.id, task.TASK_Status);

  return await getTaskById(task.id);
}

/**
 * Get tasks with filters and pagination
 * @param {Object} query
 * @returns {Promise<Object>}
 */
async function getTasks(query = {}) {
  const {
    page = 1,
    limit = 10,
    status,
    assignedTo,
    assignedBy,
    search,
  } = query;

  const paginator = new Paginator(page, limit);

  // Main query for tasks with joins and select
  let queryBuilder = taskRepository()
    .select(
      "TASK.*",
      "creator.USER_Username as creator_name",
      "assignee.USER_Username as assignee_name",
      "STATUS.STATUS_Name as status_name"
    )
    .leftJoin("USER as creator", "TASK.assigned_by", "creator.USER_Id")
    .leftJoin("USER as assignee", "TASK.assigned_to", "assignee.USER_Id")
    .leftJoin("STATUS", "TASK.TASK_Status", "STATUS.STATUS_Id")
    .orderBy("TASK.id", "desc");

  // Apply filters to main query
  if (status) {
    queryBuilder = queryBuilder.where("TASK.TASK_Status", status);
  }
  if (assignedTo) {
    queryBuilder = queryBuilder.where("TASK.assigned_to", assignedTo);
  }
  if (assignedBy) {
    queryBuilder = queryBuilder.where("TASK.assigned_by", assignedBy);
  }
  if (search) {
    queryBuilder = queryBuilder.where(function () {
      this.where("TASK.title", "ilike", `%${search}%`).orWhere(
        "TASK.description",
        "ilike",
        `%${search}%`
      );
    });
  }

  // Separate count query (no select/join/orderBy)
  let countQuery = taskRepository();
  if (status) countQuery = countQuery.where("TASK.TASK_Status", status);
  if (assignedTo) countQuery = countQuery.where("TASK.assigned_to", assignedTo);
  if (assignedBy) countQuery = countQuery.where("TASK.assigned_by", assignedBy);
  if (search) {
    countQuery = countQuery.where(function () {
      this.where("TASK.title", "ilike", `%${search}%`).orWhere(
        "TASK.description",
        "ilike",
        `%${search}%`
      );
    });
  }
  const [{ count }] = await countQuery.count("TASK.id as count");
  const totalRecords = parseInt(count);

  // Apply pagination
  const tasks = await queryBuilder
    .limit(paginator.limit)
    .offset(paginator.offset);

  return {
    tasks,
    pagination: paginator.getMetadata(totalRecords),
  };
}

/**
 * Get task by ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
async function getTaskById(id) {
  const task = await taskRepository()
    .select(
      "TASK.*",
      "creator.USER_Username as creator_name",
      "assignee.USER_Username as assignee_name",
      "STATUS.STATUS_Name as status_name"
    )
    .leftJoin("USER as creator", "TASK.assigned_by", "creator.USER_Id")
    .leftJoin("USER as assignee", "TASK.assigned_to", "assignee.USER_Id")
    .leftJoin("STATUS", "TASK.TASK_Status", "STATUS.STATUS_Id")
    .where("TASK.id", id)
    .first();

  if (task) {
    // Get attachments
    const attachments = await taskAttachmentsRepository()
      .where("task_id", id)
      .select("*");

    task.attachments = attachments;
  }

  return task;
}

/**
 * Update task
 * @param {number} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function updateTask(id, payload) {
  const updateData = readTaskData(payload);

  // Get current task to compare status
  const currentTask = await taskRepository().where("id", id).first();

  await taskRepository().where("id", id).update(updateData);

  // Log status change if status was updated
  if (
    updateData.TASK_Status &&
    updateData.TASK_Status !== currentTask.TASK_Status
  ) {
    await logStatusChange(id, updateData.TASK_Status);
  }

  return await getTaskById(id);
}

/**
 * Delete task
 * @param {number} id
 * @returns {Promise<number>}
 */
async function deleteTask(id) {
  // Delete related data first
  await taskAttachmentsRepository().where("task_id", id).del();
  await taskStatusHistoryRepository().where("task_id", id).del();

  return await taskRepository().where("id", id).del();
}

/**
 * Update task status
 * @param {number} id
 * @param {number} statusId
 * @returns {Promise<Object>}
 */
async function updateTaskStatus(id, statusId) {
  await taskRepository().where("id", id).update({ TASK_Status: statusId });

  // Log status change
  await logStatusChange(id, statusId);

  return await getTaskById(id);
}

/**
 * Get task statistics
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
async function getTaskStats(filters = {}) {
  let queryBuilder = taskRepository();

  // Apply filters
  if (filters.assignedTo) {
    queryBuilder = queryBuilder.where("assigned_to", filters.assignedTo);
  }

  if (filters.assignedBy) {
    queryBuilder = queryBuilder.where("assigned_by", filters.assignedBy);
  }

  const [stats] = await queryBuilder.select(
    knex.raw("COUNT(*) as total_tasks"),
    knex.raw('COUNT(CASE WHEN "TASK_Status" = 1 THEN 1 END) as pending_tasks'),
    knex.raw(
      'COUNT(CASE WHEN "TASK_Status" = 2 THEN 1 END) as in_progress_tasks'
    ),
    knex.raw(
      'COUNT(CASE WHEN "TASK_Status" = 3 THEN 1 END) as completed_tasks'
    ),
    knex.raw(
      'COUNT(CASE WHEN due_date < NOW() AND "TASK_Status" != 3 THEN 1 END) as overdue_tasks'
    )
  );

  return {
    totalTasks: parseInt(stats.total_tasks),
    pendingTasks: parseInt(stats.pending_tasks),
    inProgressTasks: parseInt(stats.in_progress_tasks),
    completedTasks: parseInt(stats.completed_tasks),
    overdueTasks: parseInt(stats.overdue_tasks),
  };
}

/**
 * Get tasks due soon (next 7 days)
 * @param {number} userId
 * @returns {Promise<Array>}
 */
async function getTasksDueSoon(userId) {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const tasks = await taskRepository()
    .select(
      "TASK.*",
      "creator.USER_Username as creator_name",
      "STATUS.STATUS_Name as status_name"
    )
    .leftJoin("USER as creator", "TASK.assigned_by", "creator.USER_Id")
    .leftJoin("STATUS", "TASK.TASK_Status", "STATUS.STATUS_Id")
    .where("TASK.assigned_to", userId)
    .where("TASK.TASK_Status", "!=", 3) // Not completed
    .where("TASK.due_date", "<=", sevenDaysFromNow)
    .where("TASK.due_date", ">=", new Date())
    .orderBy("TASK.due_date", "asc");

  return tasks;
}

/**
 * Log status change in history
 * @param {number} taskId
 * @param {number} statusId
 * @returns {Promise<void>}
 */
async function logStatusChange(taskId, statusId) {
  // Generate new history ID
  const [maxId] = await taskStatusHistoryRepository().max("id as maxId");
  const newId = (maxId.maxId || 0) + 1;

  await taskStatusHistoryRepository().insert({
    id: newId,
    task_id: taskId,
    status: statusId,
    changed_at: new Date(),
  });
}

/**
 * Get task status history
 * @param {number} taskId
 * @returns {Promise<Array>}
 */
async function getTaskStatusHistory(taskId) {
  return await taskStatusHistoryRepository()
    .select("TASK_STATUS_HISTORY.*", "STATUS.STATUS_Name as status_name")
    .leftJoin("STATUS", "TASK_STATUS_HISTORY.status", "STATUS.STATUS_Id")
    .where("task_id", taskId)
    .orderBy("changed_at", "desc");
}

/**
 * Add task attachment
 * @param {number} taskId
 * @param {Object} fileData
 * @returns {Promise<Object>}
 */
async function addTaskAttachment(taskId, fileData) {
  if (!fileData?.originalname || !fileData?.path) {
    throw new Error("Missing file name or file path");
  }

  const [maxId] = await taskAttachmentsRepository().max("id as maxId");
  const newId = (maxId?.maxId || 0) + 1;

  const attachmentData = {
    id: newId,
    task_id: taskId,
    file_name: fileData.originalname,
    file_path: fileData.path,
    created_at: new Date(),
  };

  const [attachment] = await taskAttachmentsRepository()
    .insert(attachmentData)
    .returning("*");

  // Update the task's status to "submitted"
  await taskRepository().where("id", taskId).update({
    TASK_Status: 2,
  });
  return attachment;
}

/**
 * Delete task attachment
 * @param {number} attachmentId
 * @returns {Promise<number>}
 */
async function deleteTaskAttachment(attachmentId) {
  const attachment = await taskAttachmentsRepository()
    .where("id", attachmentId)
    .first();

  if (!attachment) {
    throw new Error("Attachment not found");
  }

  await deleteFile(attachment.file_path);

  return taskAttachmentsRepository().where("id", attachmentId).del();
}
/**
 * Get all available statuses
 * @returns {Promise<Array>}
 */
async function getAllStatuses() {
  return await statusRepository().select("*").orderBy("STATUS_Id");
}

async function getTaskAttachmentById(id) {
  return await taskAttachmentsRepository().where("id", id).first();
}

function statusStringToNumber(status) {
  if (status === 'pending') return 1;
  if (status === 'in-progress') return 2;
  if (status === 'completed') return 3;
  if (status === 'deleted') return 4; // nếu có trạng thái deleted
  return 1;
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskStats,
  getTasksDueSoon,
  getTaskStatusHistory,
  addTaskAttachment,
  deleteTaskAttachment,
  getAllStatuses,
  getTaskAttachmentById,
};
