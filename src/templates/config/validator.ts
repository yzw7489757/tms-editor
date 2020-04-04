import configList from './index';
/**
 * 这里只是做了个简单的校验，防止用户篡改组件属性，
 * 用户的行为光前端防止是没用的，防得了君子防不了小人。
 * 更安全的方法是配合服务器进行hash验证。
 * 以及表示某些组件是否下架，在不在有效期内。
 * @export 验证函数
 * @param {*} componentInfo
 */
interface ComInfo {
  componentId:number;
  componentName:string;
  uniqueKey:number;

  [key:string]:number|string
}

export default function validator(componentInfo:ComInfo) {
  const { componentId } = componentInfo;

  const findItem:any = configList.find(item => item.componentId === componentId);

  if (findItem === undefined) {
    // 该组件id不存在
    return false;
  }

  // 校对传入组件的各项属性是否与组件库相同
  const result = Object.keys(componentInfo).every(key => (
    componentInfo[key] === findItem[key]
  ));

  return result;
}
