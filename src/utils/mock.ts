import { Random } from 'mockjs';

export const makeImg = (text = '', size = '400x250'):string => Random.dataImage(size, text);
export const makeUrl = ():string => `http://www.${Random.domain()}`;
export const makeText = (maxLength = 999):string => Random.cparagraph().slice(0, maxLength);
export const makeName = ():string => Random.name();
export const makeCName = ():string => Random.cname();
export const makeAddress = ():string => Random.county(true);
export const makeGuid = ():string => Random.guid();
export const makeId = ():string => Random.id();
export const makePrice = ():number => Random.float(60, 100, 2, 2);
