import { useState, useMemo, useEffect } from "react";
import { interpret } from "xstate";

export function useMachine(machine, options = {}) {
  const [current, setCurrent] = useState(machine.initialState);

  const service = useMemo(
    () =>
      interpret(machine, { execute: false })
        .onTransition(state => {
          options.log && console.log("CONTEXT:", state.context);
          setCurrent(state);
        })
        .onEvent(e => options.log && console.log("EVENT:", e)),
    []
  );

  useEffect(
    () => {
      service.execute(current);
    },
    [current]
  );

  useEffect(() => {
    service.start();

    return () => service.stop();
  }, []);

  return [current, service.send];
}
