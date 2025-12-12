const knex = require("../database/knex");

function taskRepository() {
  return knex("TASKS");
}

async function calculateEfficiency() {
  // Example logic: % of completed tasks / total tasks
  const [total] = await taskRepository().count("* as total");
  const [completed] = await taskRepository()
    .where("status", "completed")
    .count("* as completed");

  const totalTasks = parseInt(total.total, 10);
  const completedTasks = parseInt(completed.completed, 10);

  const efficiency = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  return {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    efficiency: Number(efficiency.toFixed(2)),
  };
}

module.exports = {
  calculateEfficiency,
};
