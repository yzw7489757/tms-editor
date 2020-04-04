export const getNext = (el: HTMLElement):Element|null  => el.nextElementSibling;

export const getPre = (el: HTMLElement):Element|null => el.previousElementSibling;
export const getParent = (el: HTMLElement):ParentNode|null => el.parentNode;
export const getnotSingleOfParent = (element:HTMLElement):ParentNode|null => {
  const hasNext = getNext(element);
  return hasNext && hasNext.parentNode;
};
// 向上查找节点 class版本
export const upwardSearchEl = (target:HTMLElement, className:string) => {
  let targetEl = target;
  while (target.parentNode !== document.body) {
    targetEl = targetEl.parentNode as HTMLElement;
    if (targetEl.classList.contains(className)) {
      return targetEl;
    }
  }
  return null;
};
