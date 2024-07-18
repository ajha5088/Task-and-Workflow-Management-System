const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskVersionSchema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  title: String,
  assignedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
  },
  dueDate: Date,
  dependecyId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

const TaskVersion = mongoose.model('TaskVersion', taskVersionSchema);

module.exports = TaskVersion;
