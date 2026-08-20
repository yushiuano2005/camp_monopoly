import mongoose from "mongoose";
const Schema = mongoose.Schema;
const EventSchema = new Schema({
  id: Number,
  title: String,
  description: String,
  note: String,
  announcement: { type: String, default: "" },
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
