const knex = require("../database/knex");

function userRepository() {
  return knex("USER");
}

function taskRepository() {
  return knex("TASK");
}

function messageRepository() {
  return knex("MESSAGE");
}

/**
 * Get all users with pagination
 * @param {Object} query
 * @returns {Promise<Object>}
 */
async function getAllUsers(query = {}) {
  const { page = 1, limit = 10, role, search } = query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let queryBuilder = userRepository().select(
    "USER_Id",
    "USER_Username",
    "USER_Email",
    "USER_Role"
  );

  if (role) {
    queryBuilder = queryBuilder.where("USER_Role", role);
  }

  if (search) {
    queryBuilder = queryBuilder.where(function () {
      this.where("USER_Username", "ilike", `%${search}%`).orWhere(
        "USER_Email",
        "ilike",
        `%${search}%`
      );
    });
  }

  // Count total records (no select/order needed)
  const totalQuery = queryBuilder.clone().clearSelect().clearOrder();
  const [{ count }] = await totalQuery.count("* as count");
  const totalRecords = parseInt(count);

  // Apply pagination and ordering
  const users = await queryBuilder
    .orderBy("USER_Id", "desc")
    .limit(parseInt(limit))
    .offset(offset);

  const transformedUsers = users.map((user) => ({
    userId: user.USER_Id,
    username: user.USER_Username,
    email: user.USER_Email,
    role: user.USER_Role,
  }));

  return {
    users: transformedUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalRecords,
      totalPages: Math.ceil(totalRecords / parseInt(limit)),
    },
  };
}

/**
 * Get user by ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
async function getUserById(id) {
  const user = await userRepository()
    .select("USER_Id", "USER_Username", "USER_Email", "USER_Role")
    .where("USER_Id", id)
    .first();

  if (user) {
    return {
      userId: user.USER_Id,
      username: user.USER_Username,
      email: user.USER_Email,
      role: user.USER_Role,
    };
  }

  return null;
}

/**
 * Update user profile
 * @param {number} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function updateUser(id, payload) {
  const updateData = {};

  if (payload.email) {
    updateData.USER_Email = payload.email;
  }

  if (payload.role) {
    updateData.USER_Role = payload.role;
  }

  if (payload.username) {
    updateData.USER_Username = payload.username;
  }

  const [updatedUser] = await userRepository()
    .where("USER_Id", id)
    .update(updateData)
    .returning(["USER_Id", "USER_Username", "USER_Email", "USER_Role"]);

  if (updatedUser) {
    return {
      userId: updatedUser.USER_Id,
      username: updatedUser.USER_Username,
      email: updatedUser.USER_Email,
      role: updatedUser.USER_Role,
    };
  }

  return null;
}

/**
 * Delete user
 * @param {number} id
 * @returns {Promise<number>}
 */
async function deleteUser(id) {
  await taskRepository()
    .where("assigned_to", id)
    .orWhere("assigned_by", id)
    .del();

  // Delete messages
  await messageRepository()
    .where("MESSAGE_SenderId", id)
    .orWhere("MESSAGE_ReceivedId", id)
    .del();

  return await userRepository().where("USER_Id", id).del();
}

/**
 * Search users or tasks based on query
 * @param {Object} query
 * @returns {Promise<Object>}
 */
async function searchUsersOrTasks(query) {
  const { query: searchQuery, type = "user", limit = 10 } = query;

  if (type === "user") {
    const users = await userRepository()
      .select("USER_Id", "USER_Username", "USER_Email", "USER_Role")
      .where(function () {
        this.where("USER_Username", "ilike", `%${searchQuery}%`).orWhere(
          "USER_Email",
          "ilike",
          `%${searchQuery}%`
        );
      })
      .limit(parseInt(limit));

    const transformedUsers = users.map((user) => ({
      userId: user.USER_Id,
      username: user.USER_Username,
      email: user.USER_Email,
      role: user.USER_Role,
    }));

    return { users: transformedUsers };
  } else {
    const tasks = await taskRepository()
      .select("id", "title", "description", "TASK_Status as status")
      .where(function () {
        this.where("title", "ilike", `%${searchQuery}%`).orWhere(
          "description",
          "ilike",
          `%${searchQuery}%`
        );
      })
      .limit(parseInt(limit));

    return { tasks };
  }
}

/**
 * Get user statistics
 * @param {number} userId
 * @returns {Promise<Object>}
 */
async function getUserStats(userId) {
  const assignedTasksStats = await taskRepository()
    .where("assigned_to", userId)
    .select(
      knex.raw("COUNT(*) as total_assigned_tasks"),
      knex.raw(
        'COUNT(CASE WHEN "TASK_Status" = 1 THEN 1 END) as pending_tasks'
      ),
      knex.raw(
        'COUNT(CASE WHEN "TASK_Status" = 2 THEN 1 END) as in_progress_tasks'
      ),
      knex.raw(
        'COUNT(CASE WHEN "TASK_Status" = 3 THEN 1 END) as completed_tasks'
      )
    )
    .first();

  const createdTasksStats = await taskRepository()
    .where("assigned_by", userId)
    .count("* as total_created_tasks")
    .first();

  const messageStats = await messageRepository()
    .select(
      knex.raw(
        'COUNT(CASE WHEN "MESSAGE_SenderId" = ? THEN 1 END) as sent_messages',
        [userId]
      ),
      knex.raw(
        'COUNT(CASE WHEN "MESSAGE_ReceivedId" = ? THEN 1 END) as received_messages',
        [userId]
      )
    )
    .where("MESSAGE_SenderId", userId)
    .orWhere("MESSAGE_ReceivedId", userId)
    .first();

  return {
    totalAssignedTasks: parseInt(assignedTasksStats.total_assigned_tasks || 0),
    pendingTasks: parseInt(assignedTasksStats.pending_tasks || 0),
    inProgressTasks: parseInt(assignedTasksStats.in_progress_tasks || 0),
    completedTasks: parseInt(assignedTasksStats.completed_tasks || 0),
    totalCreatedTasks: parseInt(createdTasksStats.total_created_tasks || 0),
    sentMessages: parseInt(messageStats.sent_messages || 0),
    receivedMessages: parseInt(messageStats.received_messages || 0),
  };
}

/**
 * Get users by role
 * @param {string} role
 * @returns {Promise<Array>}
 */
async function getUsersByRole(role) {
  const users = await userRepository()
    .select("USER_Id", "USER_Username", "USER_Email", "USER_Role")
    .where("USER_Role", role);

  return users.map((user) => ({
    userId: user.USER_Id,
    username: user.USER_Username,
    email: user.USER_Email,
    role: user.USER_Role,
  }));
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsersOrTasks,
  getUserStats,
  getUsersByRole,
};
