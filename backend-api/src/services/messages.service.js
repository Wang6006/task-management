const knex = require("../database/knex");
const ApiError = require("../api-error");

function messageRepository() {
  return knex("MESSAGE");
}

async function fetchMessages(task_id = null) {
  let query = messageRepository()
    .select("MESSAGE.*", "USER.USER_Username as sender_username")
    .leftJoin("USER", "MESSAGE.MESSAGE_SenderId", "USER.USER_Id")
    .orderBy("messages_createdate", "asc");

  if (task_id) {
    query = query.where("message_taskid", task_id);
  }

  return await query;
}
async function createMessage(data) {
  const [inserted] = await messageRepository()
    .insert({
      MESSAGE_SenderId: data.sender_id,
      MESSAGE_ReceivedId: data.receiver_id,
      MESSAGE_Content: data.content,
      message_taskid: data.task_id,
    })
    .returning([
      "MESSAGE_ID",
      "MESSAGE_SenderId",
      "MESSAGE_ReceivedId",
      "MESSAGE_Content",
      "message_taskid",
    ]);

  if (!inserted) {
    throw new ApiError(500, "Failed to create message");
  }

  return inserted;
}
module.exports = {
  fetchMessages,
  createMessage,
};
