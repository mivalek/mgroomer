import { createSignal } from "solid-js";
import "./NameForm.css";
import { action } from "@solidjs/router";

const editName = action(async (id: number, formData: FormData) => {
  "use server";
  const displayName = formData.get("displayName") as string;
  await fetch(`${process.env.API}/athletes/${id}`, {
    method: "PUT",
    headers: {Authorization: process.env.API_KEY},
    body: JSON.stringify({ id, displayName }),
  });
}, "editName");

export default function NameForm(props: { id: number; displayName: string }) {
  const [displayName, setDisplayName] = createSignal(props.displayName);
  let btnRef, inputRef;
  return (
    <form action={editName.with(props.id)} method="post">
      <input
        ref={inputRef}
        type="text"
        name="displayName"
        id="display-name"
        onInput={(e) => setDisplayName(e.target.value)}
        value={displayName()}
        onkeydown={(e) => {
          if (e.key !== "Enter") return;
          btnRef!.click();
          e.currentTarget.blur();
          e.target.classList.remove("alert");
          if (displayName() !== props.displayName) {
            e.target.classList.add("success");
          }
        }}
        onFocusOut={(e) => {
          if (displayName() !== props.displayName) {
            e.target.classList.add("alert");
            e.target.classList.remove("success");
          } else {
            e.target.classList.remove("alert");
          }
        }}
      />
      <button ref={btnRef} class="hidden" type="submit">
        ok
      </button>
    </form>
  );
}
