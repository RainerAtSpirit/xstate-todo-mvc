import React, { useEffect, useRef, FunctionComponent } from "react";
import { useMachine } from "./useMachine";
import { todoMachine } from "./todoMachine";
import cn from "classnames";

interface TodoProps {
	todo: any
	onChange: any
	onDelete: any
}

export const Todo: FunctionComponent<TodoProps> = ({ todo, onChange, onDelete }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, send] = useMachine(
    todoMachine.withConfig(
      {
        actions: {
          focusInput() {
            setTimeout(() => {
              inputRef.current && inputRef.current.select();
            }, 0);
          },
          notifyDeleted(ctx) {
            onDelete(ctx.id);
          },
          notifyChanged(ctx) {
            onChange({
              id: ctx.id,
              title: ctx.title,
              completed: ctx.completed
            });
          }
        }
      },
      todo // extended state
    )
  );

  useEffect(
    () => {
      if (todo.completed !== completed) {
        // "Completed" changed externally... ugh.
        // React needs Actors.
        send("TOGGLE_COMPLETE");
      }
    },
    [todo]
  );

  const { completed, title } = state.context;

  return (
    <li
      className={cn({
        editing: state.matches("editing"),
        completed: completed
      })}
      data-todo-state={completed ? "completed" : "active"}
      key={todo.id}
    >
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          onChange={_ => {
            send("TOGGLE_COMPLETE");
          }}
          value={completed}
          checked={completed}
        />
        <label
          onDoubleClick={e => {
            send("EDIT");
          }}
        >
          {title}
        </label>{" "}
        <button className="destroy" onClick={() => send("DELETE")} />
      </div>
      <input
        className="edit"
        value={title}
        onBlur={_ => send("BLUR")}
        onChange={e => send({ type: "CHANGE", value: e.target.value })}
        onKeyPress={e => {
          if (e.key === "Enter") {
            send("COMMIT");
          }
        }}
        onKeyDown={e => {
          if (e.key === "Escape") {
            send("CANCEL");
          }
        }}
        ref={inputRef}
      />
    </li>
  );
}
