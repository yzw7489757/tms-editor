/* eslint-disable no-param-reassign */
function forEach(array:any[], iteratee:(item:any,index:number)=>void) {
  let index = -1;
  const { length } = array;
  // eslint-disable-next-line no-plusplus
  while (++index < length) {
    iteratee(array[index], index);
  }
  return array;
}

function isObject(target:any) {
  const type = typeof target;
  return target !== null && (type === 'object' || type === 'function');
}

interface CloneContent {
  [index:string]:any
}
export default function clone(target:any, map = new Map()) {
  if (typeof target === 'object') {
    const isArray = Array.isArray(target);
    const cloneTarget: CloneContent = isArray ? [] : {};

    if (map.get(target)) {
      return map.get(target);
    }

    if (!isObject(target)) {
      return target;
    }

    map.set(target, cloneTarget);

    const keys = isArray ? target : Object.keys(target);
    forEach(keys, (value, key) => {
      if (!isArray) {
        // eslint-disable-next-line no-param-reassign
        key = value;
      }
      cloneTarget[key] = clone(target[key], map);
    });

    return cloneTarget;
  }
  return target;
}

export function cloneData(target:any) {
  if (typeof target === 'object') {
    const isArray = Array.isArray(target);
    const cloneTarget:CloneContent = isArray ? [] : {};

    if (!isObject(target)) {
      return target;
    }
    const keys = isArray ? target : Object.keys(target);
    forEach(keys, (value, key) => {
      // target为Object情况下，keys = [arr,obj] ; value为arr,obj, key为index，所以要将两者交替，用value作为key
      // target为Array的情况下,keys = [a,b,c] ; value就是a,b,c，所以可以直接 target[key]
      if (!isArray) { // 如果是对象
        key = value;
      }
      cloneTarget[key] = cloneData(target[key]);
    });

    return cloneTarget;
  }
  return target;
}
