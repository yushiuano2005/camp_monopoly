import mongoose from "mongoose";
const Schema = mongoose.Schema;
const EventSchema = new Schema({
  id: Number,
  title: String,
  description: String,
  note: String,
  branches: [
    {
      id: String,
      title: String,
      description: String,
    },
  ],
  selectedBranch: { type: String, default: "" },
});

const Event = mongoose.model("Event", EventSchema);
export default Event;
