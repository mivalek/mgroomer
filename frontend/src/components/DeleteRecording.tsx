import { action, useSubmission } from "@solidjs/router";
import "./DeleteRecording.css";

const deleteRecording = action(async (id: string, formData: FormData) => {
  "use server";
  const resp = await fetch(`${process.env.API}/files/${id}`, {
    method: "DELETE",
    headers: {Authorization: process.env.API_KEY},
    body: JSON.stringify({ id }),
  });
  if (resp.ok) {
    return "Recording deleted";
  }
  throw Error("Something went wrong");
}, "addRecording");

export default function DeleteRecording(props: {
  id: string;
  addToMyRecordings: (id: string, remove: boolean) => void;
}) {
  const submission = useSubmission(deleteRecording);

  return (
    <form action={deleteRecording.with(props.id)} method="post">
      <button type="submit" class="delete-btn" disabled={submission.pending}>
        {submission.pending ? "Deteling..." : "Delete"}
      </button>
    </form>
  );
}
