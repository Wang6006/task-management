const { faker } = require('@faker-js/faker');

function createUser() {
  const roles = ['admin', 'manager', 'employee'];
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    USER_Username: faker.internet.username({ firstName, lastName }).toLowerCase(),
    USER_Email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    USER_Password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeigS2t9x9X8w9L7u', // password123
    USER_Role: faker.helpers.arrayElement(roles),
  };
}

function createTask() {
  const taskTitles = [
    'Website Redesign Project',
    'API Development',
    'Database Optimization', 
    'Security Audit',
    'Performance Testing',
    'Code Review',
    'Documentation Update',
    'Bug Fixes',
    'Feature Implementation',
    'System Integration'
  ];

  return {
    title: faker.helpers.arrayElement(taskTitles) + ' - ' + faker.company.buzzPhrase(),
    description: faker.lorem.paragraph(),
    assigned_by: faker.number.int({ min: 1, max: 50 }), // Đảm bảo trong range USER_Id
    assigned_to: faker.number.int({ min: 1, max: 50 }),  // Đảm bảo trong range USER_Id
    due_date: faker.date.future().toISOString().split('T')[0],
    admin_feedback: faker.lorem.sentence(),
    TASK_Status: faker.number.int({ min: 1, max: 7 }), // Đảm bảo trong range STATUS_Id
  };
}

function createTaskAttachment() {
  const extensions = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'txt'];
  const extension = faker.helpers.arrayElement(extensions);
  const fileName = faker.system.commonFileName(extension);
  
  return {
    task_id: faker.number.int({ min: 1, max: 100 }), // Đảm bảo trong range TASK id
    file_name: fileName,
    file_path: `/uploads/tasks/${fileName}`,
    created_at: faker.date.recent().getTime(),
  };
}

function createMessage() {
  return {
    MESSAGE_SenderId: faker.number.int({ min: 1, max: 50 }), // Đảm bảo trong range USER_Id
    MESSAGE_ReceivedId: faker.number.int({ min: 1, max: 50 }), // Đảm bảo trong range USER_Id
    MESSAGE_Content: faker.lorem.sentence(),
  };
}

function createTaskStatusHistory() {
  return {
    task_id: faker.number.int({ min: 1, max: 100 }), // Đảm bảo trong range TASK id
    status: faker.number.int({ min: 1, max: 7 }), // Đảm bảo trong range STATUS_Id
    changed_at: faker.date.recent().toISOString(),
  };
}

exports.seed = async function (knex) {
  try {
    // Clear existing data in correct order (child tables first)
    await knex('TASK_STATUS_HISTORY').del();
    await knex('MESSAGE').del();
    await knex('task_attachments').del();
    await knex('TASK').del();
    await knex('USER').del();
    await knex('STATUS').del();

    // Reset auto-increment sequences (for PostgreSQL)
    await knex.raw('ALTER SEQUENCE IF EXISTS "STATUS_STATUS_Id_seq" RESTART WITH 1');
    await knex.raw('ALTER SEQUENCE IF EXISTS "USER_USER_Id_seq" RESTART WITH 1');
    await knex.raw('ALTER SEQUENCE IF EXISTS "TASK_id_seq" RESTART WITH 1');

    // Insert fixed statuses with explicit IDs
    await knex('STATUS').insert([
      { STATUS_Id: 1, STATUS_Name: 'Pending' },
      { STATUS_Id: 2, STATUS_Name: 'In Progress' },
      { STATUS_Id: 3, STATUS_Name: 'Completed' },
      { STATUS_Id: 4, STATUS_Name: 'Cancelled' },
      { STATUS_Id: 5, STATUS_Name: 'On Hold' },
      { STATUS_Id: 6, STATUS_Name: 'Review' },
      { STATUS_Id: 7, STATUS_Name: 'Testing' }
    ]);

    // Insert admin user first with explicit ID
    await knex('USER').insert({
      USER_Id: 1,
      USER_Username: 'admin',
      USER_Email: 'admin@taskmanager.com',
      USER_Password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeigS2t9x9X8w9L7u',
      USER_Role: 'admin'
    });

    // Insert fake users with explicit IDs
    const users = Array(49).fill().map((_, index) => ({
      USER_Id: index + 2,
      ...createUser()
    }));
    await knex('USER').insert(users);

    // Insert fake tasks with explicit IDs
    const tasks = Array(100).fill().map((_, index) => ({
      id: index + 1,
      ...createTask()
    }));
    await knex('TASK').insert(tasks);

    // Insert fake attachments
    const attachments = Array(150).fill().map((_, index) => ({
      id: index + 1,
      ...createTaskAttachment()
    }));
    await knex('task_attachments').insert(attachments);

    // Insert fake messages
    const messages = Array(200).fill().map((_, index) => ({
      MESSAGE_ID: index + 1,
      ...createMessage()
    }));
    await knex('MESSAGE').insert(messages);

    // Insert fake status history
    const statusHistory = Array(300).fill().map((_, index) => ({
      id: index + 1,
      ...createTaskStatusHistory()
    }));
    await knex('TASK_STATUS_HISTORY').insert(statusHistory);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
};