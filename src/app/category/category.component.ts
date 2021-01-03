import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StyleService} from "../services/style/style.service";
import {Category} from "../models/category";
import {Item} from "../models/item";
import {Profile} from "../models/profile";
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  @Input() category: Category;
  @Input() index: number;
  @Input() profile: Profile;
  @Input() categoryBeingRemoved: Category;
  @Input() editingCategory: Category;
  @Input() editingItems: Item[];
  @Input() searchFormControl;

  @Output() saveEmitter: EventEmitter<any> = new EventEmitter();

  swappingIndex: number;
  swappingCategory: Category;
  editingCategories: Category[] = [];
  deletingItem: Item;
  categoryOfDeletingItem: Category;
  selectedCategoryName: string;

  constructor(private styleService: StyleService) { }

  ngOnInit() {

  }

  toggleEditingCategory(categoryToToggle: Category) {
    if (this.editingCategories.includes(categoryToToggle)) {
      this.editingCategories = this.editingCategories.filter(category => category != categoryToToggle);
    } else {
      this.editingCategories.push(categoryToToggle);
    }
  }

  toggleCategoryLocked(category: Category) {
    category.locked = !category.locked;
  }

  getCategoryTitleWidth(name) {
    if (!name)
      return {width: '1ch', color: this.styleService.appliedStyles.headerColor};
    return {width: (name.length + 2) + "ch", color: this.styleService.appliedStyles.headerColor};
  }

  getItemQtyStyles() {
    return {
      'position': 'absolute',
      'top': 0,
      'left': (this.styleService.appliedStyles.iconSize) + 'px',
      'z-index': 88888
    };
  }

  getItemKcStyles() {
    return {
      'position': 'absolute',
      'top': (this.styleService.appliedStyles.iconSize / 50 * 20) + 'px',
      'left': 0,
      'z-index': 88888
    };
  }

  getCategoryProgress(category: Category) {
    let total = category.items.length;
    let unlocked = 0;
    category.items.forEach(item => {
      if (item.unlocked)
        unlocked++;
    });
    return '(' + unlocked + '/' + total + ')';
  }

  getCategoryProgressPercent(category: Category) {
    let total = category.items.length;
    let unlocked = 0;
    category.items.forEach(item => {
      if (item.unlocked)
        unlocked++;
    });
    return (unlocked / total) * 100;
  }

  getFillerIconStyles() {
    console.log(this.styleService.appliedStyles.iconSize);
    let iconWidth = this.styleService.appliedStyles.iconSize;
    return {
      'width.px': iconWidth,
      'height.px': ((iconWidth / 50) * 44.44),
      margin: '5px'
    }
  }

  toggleItemUnlocked(item: Item, category: Category) {
    item.unlocked = !item.unlocked;
    this.saveProfiles();
  }

  moveCategoryUp(index: number) {
    if (index === 0)
      return;
    let currentCategory = this.profile.categories[index];
    if (this.profile.categories[index - 1]) {
      let temp = this.profile.categories[index - 1];
      this.profile.categories[index - 1] = currentCategory;
      this.profile.categories[index] = temp;
    }
  }

  moveCategoryDown(index: number) {
    if (index === this.profile.categories.length - 1)
      return;
    let currentCategory = this.profile.categories[index];
    if (this.profile.categories[index + 1]) {
      let temp = this.profile.categories[index + 1];
      this.profile.categories[index + 1] = currentCategory;
      this.profile.categories[index] = temp;
    }
  }

  swapCategories(category, index) {
    const oldIndex = this.profile.categories.indexOf(category);
    const temp = this.deepCopy(this.profile.categories[index]);
    this.profile.categories[index] = category;
    this.profile.categories[oldIndex] = temp;
  }

  swapItem(index: number, category: Category) {
    if (this.swappingIndex != null && this.swappingCategory && this.swappingCategory == category) {
      this.swapInArray(category.items, index, this.swappingIndex);
      this.swappingIndex = null;
      this.swappingCategory = null;
    } else {
      this.swappingIndex = index;
      this.swappingCategory = category;
    }
  }

  swapInArray(array: any[], index1: number, index2: number) {
    let temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
  }

  deepCopy(serializable) {
    return JSON.parse(JSON.stringify(serializable));
  }

  saveProfiles() {
    this.saveEmitter.emit();
  }
}
