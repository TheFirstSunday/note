import { useMemo, useRef, useState } from 'react';
import { parse, stringify } from 'qs';
import { useHistory, useLocation } from 'react-router-dom';
import type { ParseOptions, StringifyOptions } from 'query-string';

export interface Options {
  navigateMode?: 'push' | 'replace';
  parseOptions?: ParseOptions;
  stringifyOptions?: StringifyOptions;
}

type UrlState = Record<string, any>;

const parseConfig = {
  skipNulls: true,
  ignoreQueryPrefix: true,
};

export default <S extends UrlState = UrlState>(
  initialState?: S | (() => S),
  options?: Options,
) => {
  type State = Partial<{ [key in keyof S]: any }>;

  const { navigateMode = 'push' } = options || {};
  const location = useLocation();
  const history = useHistory();

  const [, update] = useState(false);

  const initialStateRef = useRef(typeof initialState === 'function' ? initialState() : initialState || {});

  const queryFromUrl = useMemo(() => parse(location.search, parseConfig), [location.search]);

  const targetQuery = useMemo(
    () => ({
      ...initialStateRef.current,
      ...queryFromUrl,
    }),
    [queryFromUrl],
  );

  const setState = (s: React.SetStateAction<State>) => {
    const newQuery = typeof s === 'function' ? s(targetQuery) : s;

    // 1. 如果 setState 后，search 没变化，就需要 update 来触发一次更新。
    // 2. update 和 history 的更新会合并，不会造成多次更新
    update((v) => !v);
    history[navigateMode]({
      hash: location.hash,
      search: stringify({ ...queryFromUrl, ...newQuery }, parseConfig) || '?',
    });
  };

  return [targetQuery, setState];
};
