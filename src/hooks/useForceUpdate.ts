import { useReducer } from 'react';

export default () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
};
