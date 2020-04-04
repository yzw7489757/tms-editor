/* eslint-disable no-unused-vars */
const { toString } = Object.prototype;
const { slice } = Array.prototype;
/**
 *
 * 主要用于处理 元素拖动排序
 * 更改排序并未是简单的替换 12345 会变成 51234,
 * @export moveItem
 * @param {*} arr 数据源
 * @param {*} fromIndex 位移的起点
 * @param {*} toIndex 位移终点
 * @returns 位移后的数组
 */
export function moveItem<T>(arr:T[], fromIndex:number, toIndex:number):T[] {
  const { length } = arr;
  let i = -1;
  while (++i < length) {
    const item = arr[i];
    if (i === fromIndex) {
      arr.splice(i, 1);
      arr.splice(toIndex, 0, item);
      break;
    }
  }
  return arr;
}
export function debounce(func:Function, wait:number) {
  let lastCallTime:number;
  let lastArgs:any[]|undefined;
  let lastThis:any;
  let timerId:number|undefined;

  function startTimer(timerExpiredFunc:()=>void, waiting:number):number {
    return window.setTimeout(timerExpiredFunc, waiting);
  }
  function invokeFunc() {
    const args:any = lastArgs;
    const currentThis = lastThis;
    const result = func.apply(currentThis, args);
    // eslint-disable-next-line no-multi-assign
    lastArgs = lastThis = timerId = undefined;
    return result;
  }
  function shouldInvoke(time:number) {
    return lastCallTime !== undefined && (time - lastCallTime >= wait);
  }
  function remainingWait(time:number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeWaiting = wait - timeSinceLastCall;
    return timeWaiting;
  }
  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return invokeFunc();
    }
    timerId = startTimer(timerExpired, wait);
  }
  function debounced(...args:any[]) {
    const time = Date.now();
    lastArgs = args;
    lastThis = null;
    lastCallTime = time;
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, remainingWait(time));
    }
  }
  return debounced;
}
export function isPlainObject(obj:any):boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}

export const isOriginal = (o:any):boolean=> (typeof o === 'object' ? !o : typeof o !== 'function');

export function throttle<Return>(func:(...params: any[]) => Return, wait:number) {
  let canRun = true;
  return (...args:[]) => {
    if (!canRun) return;
    canRun = false;
    setTimeout(() => {
      func.apply(null, args);
      canRun = true;
    }, wait);
  };
}

export function generatorUniqueKey() {
  return Math.random().toString(36).substr(0, 7).split('')
    .join('.');
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item:any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two or more objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target:any, ...sources:any[]):any{
  if (!sources.length) return target;
  const source = sources.shift();
  const hasOwnPerproty = Object.prototype.hasOwnProperty;

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (hasOwnPerproty.call(source, key)) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  }

  return mergeDeep(target, ...sources);
}
export const strToNum = (val:string) => (typeof val === 'number' ? val : Number(val));

type CurryFunction<Return> = (...newParams: any[]) => Return | CurryFunction<Return>

/**
 * 极简科里化函数
 * @param {*} fn
 * @returns result or iterator
 */
export function highCurry<Return>(fn:Function):CurryFunction<Return> {
  const judge = (...args:any[]) => (args.length === fn.length ? fn(...args) :( arg:any[] )=> judge(...args, arg));
  return judge;
};

export const simpleCurry = <Return>(fn:Function, ...args:any[]):CurryFunction<Return> => (
  fn.length <= args.length
    ? fn(...args)
    : simpleCurry.bind(null, fn, ...args)
);

// 小型的curry函数，只收集2次。但是却可以循环调用第一次
// 用函数包裹原函数，然后给原函数传入之前的参数
const subCurry = (fn:Function, ...args:any[]) => (...args2:[]) => fn.apply(null, args.concat(args2));
/**
 * 科里化函数
 * const fn = curry(function(a,b,c){},?3)
 * fn(1)(2)(3)
 * @param {*} fn
 * @param {*} length
 * @returns
 */
export const curry = <Return>(fn:Function, lengt?:number):CurryFunction<Return> => {
  if (typeof fn !== 'function') {
    throw new Error(`curry argument must be a function, but actually is a ${toString.call(fn)}`);
  }
  // 获取所需参数
  const argsLength = length || fn.length;

  return (...args:any[]):CurryFunction<Return> => {
    // 如果参数不够
    if (args.length < argsLength) {
      // 重新收集参数
      const combined:any[] = [].slice.apply(args)

      // 拿到 (...args2) => fn.apply(this, [...args, ...args2]);
      const newSubCurry = subCurry(fn,combined);
      // 剩余参数长度
      const surplusArgs = argsLength - args.length;

      // 再调用一次
      return curry(newSubCurry, surplusArgs);
    }
    return fn.apply(null, args);
  };
};
