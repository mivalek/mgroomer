import { action, useSubmission } from "@solidjs/router";
import "./FlagRec.css";

const flagAction = action(async (id: string, flag: boolean) => {
  "use server";
  const resp = await fetch(`${process.env.API}/files/${id}/flag`, {
    method: "post",
    headers: {Authorization: process.env.API_KEY},
    body: JSON.stringify({ id, flag }),
  });
  if (resp.ok) {
    const body = (await resp.json()) as string;
    return { message: body };
  }
  throw Error("Something went wrong...");
}, "flagAction");

export default function FlagRec(props: {
  id: string;
  isFlagged: boolean;
  isMine: boolean;
  addToMyFlags: (id: string, remove?: boolean) => void;
}) {
  const submission = useSubmission(flagAction);
  const shouldRemove = () => props.isFlagged && props.isMine;

  return (
    <form action={flagAction.with(props.id, !props.isMine)} method="post">
      <button type="submit" class="flag-btn" disabled={submission.pending}>
        {shouldRemove() ? "Unflag" : "Report"}
      </button>
    </form>
  );
}
