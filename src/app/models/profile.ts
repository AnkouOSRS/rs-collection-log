import {Category} from "./category";
import {DiaryRegion} from "./diary-region";

export class Profile {
  name: string;
  categories: Category[] = [];
  ironmanType: number = 0;
  qp: string = '0';
  diaries: DiaryRegion[];
}
