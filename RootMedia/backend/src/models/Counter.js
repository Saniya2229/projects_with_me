import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Atomically generates sequential Task IDs like TSK-001, TSK-002, ...
 */
export async function getNextTaskId() {
  const counter = await Counter.findByIdAndUpdate(
    'taskId',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TSK-${String(counter.seq).padStart(3, '0')}`;
}

export default Counter;

