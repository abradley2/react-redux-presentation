const compose = (...fns) => (...args) => fns.reduce((acc, fn) => fn(...acc), args);

export const combinReducers = map => (...args) => Object.keys(map).reduce((state, key) => {
  return Object.assign(state, { [key]: map[key](...args) });
}, {});

export function createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function') return createStore(reducer, null, preloadedState);

  let state = preloadedState;
  return {
    getState: () => state,
    dispatch: (action) => {
      state = reducer(state, action);
    }
  };
}
