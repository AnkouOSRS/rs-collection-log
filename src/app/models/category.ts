import {Item} from "./item";

export class Category {
  name: string;
  items: Item[];
  x?: number;
  kc?: number;
  locked?: boolean = true;
}
