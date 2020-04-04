import Sortable from 'sortablejs';
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**                                                                                     *
 * @description sortable 实例
 * @author YuanZiWen
 * @since 2019-10-01
 *                                                                                      */
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const defaultOption = {
  dragoverBubble: false,
  animation: 150,
  removeCloneOnHide: true,
};

const generatorSort = (el:HTMLDivElement, option:any) => new Sortable(el, ({ ...defaultOption, ...option}));


export default generatorSort;
