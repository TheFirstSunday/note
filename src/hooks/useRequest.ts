import { useEffect, useState } from 'react';

export interface Options {
  manual?: boolean;
}

export type Service<TData, TParams extends any[]> = (...args: TParams) => Promise<TData>;

export default function useRequest(request: Service<any, any>, options: Options = {}) {
  const { manual = true } = options;
  const [result, setResult] = useState({ data: undefined, loading: false, error: false });

  const run = async (...args: any[]) => {
    setResult((prev) => ({ ...prev, loading: true }));
    try {
      const data = await request(...args);
      setResult({ data, loading: false, error: false });
      return data;
    } catch (e) {
      setResult((prev) => ({ ...prev, loading: false, error: true }));
      return Promise.reject(e);
    }
  };
  useEffect(() => {
    if (!manual) run();
  }, []);

  return {
    ...result,
    run,
  };
}
