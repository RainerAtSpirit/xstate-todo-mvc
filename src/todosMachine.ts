import { Machine, actions } from "xstate";
import {v4 as uuid} from "uuid";
const { assign } = actions;

export interface TodoMachineContext {
	id: string | undefined
	title: string | undefined
	completed: boolean
	prevTitle: string
}

const createTodo = (title: string) => {
  return {
    id: uuid(),
    title: title,
    completed: false
  };
};

interface TodosMachineSchema {
	states: {
		all : {}
		active: {}
		completed: {}
	}
}

type TodosMachineEvent =
	| {type: "NEWTODO.CHANGE", value: string}
	| {type: "NEWTODO.COMMIT", value: string}
	| {type: "TODO.COMMIT", todo: TodoMachineContext}
	| {type: "TODO.DELETE", id: string}
	| {type: "SHOW.all"}
	| {type: "SHOW.active"}
	| {type: "SHOW.completed"}
	| {type: "MARK.completed"}
	| {type: "MARK.active"}
	| {type: "CLEAR_COMPLETED"}

interface TodosMachineContext {
	todo: string
	todos: any[]
}

export const todosMachine = Machine<TodosMachineContext, TodosMachineSchema, TodosMachineEvent>({
  id: "todos",
  context: {
    todo: "", // new todo
    todos: []
  },
  initial: "all",
  states: {
    all: {},
    active: {},
    completed: {}
  },
  on: {
    "NEWTODO.CHANGE": {
      actions: assign({
        todo: (ctx: any, e: any) => e.value
      })
    },
    "NEWTODO.COMMIT": {
      actions: [
        assign({
          todo: "", // clear todo
          todos: (ctx: any, e: any) => ctx.todos.concat(createTodo(e.value.trim()))
        }),
        "persist"
      ],
      cond: (ctx: any, e: any) => e.value.trim().length
    },
    "TODO.COMMIT": {
      actions: [
        assign({
          todos: (ctx: any, e: any) =>
            ctx.todos.map((todo: TodoMachineContext) => (todo.id === e.todo.id ? e.todo : todo))
        }),
        "persist"
      ]
    },
    "TODO.DELETE": {
      actions: assign({
        todos: (ctx: any, e: any) => {
          return ctx.todos.filter((todo: TodoMachineContext) => todo.id !== e.id);
        }
      })
    },
    "SHOW.all": ".all",
    "SHOW.active": ".active",
    "SHOW.completed": ".completed",
    "MARK.completed": {
      actions: assign({
        todos: (ctx: any) => ctx.todos.map((todo: TodoMachineContext) => ({ ...todo, completed: true }))
      })
    },
    "MARK.active": {
      actions: assign({
        todos: (ctx: any) => ctx.todos.map((todo: TodoMachineContext) => ({ ...todo, completed: false }))
      })
    },
    CLEAR_COMPLETED: {
      actions: assign({
        todos: (ctx: any) => ctx.todos.filter((todo: TodoMachineContext) => !todo.completed)
      })
    }
  }
});
