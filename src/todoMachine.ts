import { assign, Machine, StateSchema } from "xstate";

export interface TodoMachineContext {
	id: string
	title: string
	completed: boolean
	prevTitle: string
}

interface TodoMachineSchema extends StateSchema {
	states: {
		reading: {
			states: {
				unknown: {},
				pending: {},
				completed: {},
				hist: {}
			}
		},
		editing: {},
		deleted: {}
	}
}

type TodoMachineEvent = { type: "TOGGLE_COMPLETE"}
	| { type: "DELETE"}
	| { type: "EDIT"}
	| { type: "CHANGE"; value: string}
	| { type: "COMMIT"}
	| { type: "BLUR"}
	| { type: "CANCEL"}

export const todoMachine = Machine<TodoMachineContext, TodoMachineSchema, TodoMachineEvent>({
  id: "todo",
  initial: "reading",
  context: {
    id: "",
    title: "",
		prevTitle: "",
		completed: false
  },
  on: {
    TOGGLE_COMPLETE: {
      target: ".reading.completed",
      actions: [assign({ completed: true }), "notifyChanged"]
    },
    DELETE: "deleted"
  },
  states: {
    reading: {
      initial: "unknown",
      states: {
        unknown: {
          on: {
            "": [
              { target: "completed", cond: ctx => ctx.completed },
              { target: "pending" }
            ]
          }
        },
        pending: {},
        completed: {
          on: {
            TOGGLE_COMPLETE: {
              target: "pending",
              actions: [assign({ completed: false }), "notifyChanged"]
            }
          }
        },
        hist: {
          type: "history"
        }
      },
      on: {
        EDIT: {
          target: "editing",
          actions: "focusInput"
        }
      }
    },
    editing: {
      onEntry: assign({ prevTitle: (ctx: { title: any; }) => ctx.title }),
      on: {
        CHANGE: {
          actions: [
						// no TS inference for ctx and event when using the object notation
						// assign({title: (ctx, event) => event.value}),
						// ctx and event are correctly infered
						assign((ctx, event) => ({
						title: event.value
					}))
				]
        },
        COMMIT: [
          {
            target: "reading.hist",
            actions: "notifyChanged",
            cond: ctx => ctx.title.trim().length > 0
          },
          { target: "deleted" }
        ],
        BLUR: {
          target: "reading",
          actions: "notifyChanged"
        },
        CANCEL: {
          target: "reading",
          actions: assign({ title: (ctx: { prevTitle: any; }) => ctx.prevTitle })
        }
      }
    },
    deleted: {
      onEntry: "notifyDeleted"
    }
  }
});
