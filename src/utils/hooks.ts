import { bindActionCreators } from 'redux';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
  useMemo, useRef, useEffect, useState,
} from 'react';
import isEqual from 'react-fast-compare';
import { debounce, throttle } from './index';

const isObjectOrArray = (t: object | any[]): boolean => t && typeof t === 'object';
type ActionCreator = (...arg: any[]) => any

interface Actions {
  type: string,
  payload: any
}
export function useActions<AC extends ActionCreator>(actions: AC[],deps: any[]) {
  const dispatch = useDispatch();
  return useMemo(() => {
    if (Array.isArray(actions)) {
      return actions.map(a => bindActionCreators(a, dispatch));
    }
    return bindActionCreators(actions, dispatch);
  }, deps ? [dispatch, ...deps] : deps);
}
export function useReduxAction<AC extends ActionCreator>(actions: AC) {
  const dispatch = useDispatch()

  return useMemo(
    () => (...args: AC extends ((...args: infer Args) => any) ? Args : any[]) => {
      dispatch(actions(...(args as any[])))
    },
    [actions],
  )
}
type Result<S> = S extends (...args: any[]) => infer R ? R : any
export function useShallowEqualSelector<
S extends (state: any) => any,
R extends Result<S>
>(selector: S, isDeep = false) {
  return useSelector(selector, isDeep ? isEqual : shallowEqual) as R;
}

export function useDidUpdate(fn: () => void, deps: any[]) {
  const refTimes = useRef(0);
  useEffect(() => {
    if (refTimes.current++ > 0) {
      if (typeof fn === 'function') fn();
    }
  }, deps);
}

/**
 *
 * 防抖函数，包含是否初次执行
 * @export
 * @param {*} fn 防抖函数
 * @param {*} deps 参数
 * @param {number} [times=300] 阈值
 * @param {boolean} [immediately=true] 是否初始化立刻执行
 */
export function useDebounce(fn: Function, deps: any[], times = 300, immediately = true) {
  const { current: runner } = useRef(debounce((...args: any[]) => fn.apply(null, args as []), times));
  const effect = immediately ? useEffect : useDidUpdate;
  effect(() => {
    runner(...deps);
  }, deps);
}

export function useThrottle(fn: Function, deps: any[], times = 300) {
  const { current: runner } = useRef(
    throttle(() => fn.apply(null, deps),times));
  useEffect(() => {
    runner();
  }, deps);
}

/**
 * 挂载时hooks
 * @param {*} fn
 */
export const useMount = (fn: () => void) => {
  useEffect(() => {
    fn();
  }, []);
};
export const useUnmount = (fn: () => void) => {
  useEffect(() => fn(), []);
};

/**
 * 节流函数，等电梯，电梯15秒一轮，进人不重置。
 * @param {*} fn 被节流函数
 * @param {*} args 依赖更新参数
 * @param {number} [timing=300] 节流阀时间
 * @returns 节流值
 */
export const useThrottleFn = <T>(fn: (...args: any[]) => T, timing = 300, args: any[]) => {
  // const [state, setState] = useState(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const lastArgs = useRef(null) as any; // 最近一次参数
  const hasChanged = useRef(false) as any; // 是否有更新

  useEffect(() => {
    if (!timeout.current) {
      // setState(fn(...args));
      const timeoutHandler = () => {
        if (hasChanged.current) {
          // 有更新，立即更新并再启动一次，否则放弃更新
          hasChanged.current = false;
          // setState(fn(...lastArgs.current));
          fn(...lastArgs.current);
          timeout.current = setTimeout(timeoutHandler, timing);
        } else {
          timeout.current = undefined;
        }
      };
      timeout.current = setTimeout(timeoutHandler, timing);
    } else {
      lastArgs.current = args; // 更新最新参数
      hasChanged.current = true; // 有更新任务
    }
    useUnmount(() => {
      if (timeout.current !== undefined) clearTimeout(timeout.current);
    });
  }, args);
  // return state;
};


/**
 * Hook版本 WhyDidYouUpdate
 *
 * @export
 * @param {*} name 打印名称
 * @param {*} props 比对props
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const latestProps = useRef(props)

  useEffect(() => {
    // if (!process.env.) return

    const allKeys = Object.keys({ ...latestProps.current, ...props })

    const changesObj: Record<
      string,
      { from: any; to: any; isDeepEqual: boolean }
    > = {}
    allKeys.forEach(key => {
      if (latestProps.current[key] !== props[key]) {
        changesObj[key] = {
          from: latestProps.current[key],
          to: props[key],
          isDeepEqual: isEqual(latestProps.current[key], props[key]),
        }
      }
    })

    if (Object.keys(changesObj).length) {
      // tslint:disable-next-line no-console
      console.log('[why-did-you-update]', name, changesObj)
    }

    latestProps.current = props
  }, Object.values(props))
}


export const useDeepEffect = (effect: () => void, deps: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!deps || !deps.length) {
      console.warn('`useDeepEffect` should not be used with no dependencies. Use React.useEffect instead.');
    }

    if (!deps.every(isObjectOrArray)) {
      console.warn(
        '`useDeepEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.',
      );
    }
  }
  const ref = useRef(undefined) as any;
  if (!isEqual(deps, ref.current)) {
    ref.current = deps;
  }
  useEffect(effect, ref.current);
};


export const useDeepMemo = (effect: () => void, deps: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!deps || !deps.length) {
      console.warn('`useDeepMemo` should not be used with no dependencies. Use React.useMemo instead.');
    }

    if (!deps.every(isObjectOrArray)) {
      console.warn(
        '`useDeepMemo` should not be used with dependencies that are all primitive values. Use React.useMemo instead.',
      );
    }
  }
  const ref = useRef(undefined) as any;
  if (!isEqual(deps, ref.current)) {
    ref.current = deps;
  }
  return useMemo(effect, ref.current);
};
