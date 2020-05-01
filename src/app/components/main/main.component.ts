import {Component, ElementRef, Inject, OnInit, Renderer2} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Item} from "../../models/item";
import {Category} from "../../models/category";
import {DefaultCategories} from "../../constants/default-categories";
import html2canvas from "html2canvas";
import {StyleService} from "../../services/style.service";
import {DefaultStyles} from "../../constants/default-styles";
import {Font} from "ngx-font-picker";
import {SearchErrorStateMatcher} from "../../matchers/search-error-state-matcher";
import {FormControl, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  apiUrl = 'https://www.osrsbox.com/osrsbox-db/items-complete.json';
  itemData;
  title = 'Collection Log';
  ironmanType: number = -1; // -1 -> first time user,  0 -> none, 1 -> hcim, 2 -> regular, 3 -> uim
  qp = '0';

  categories: Category[] = [];
  categoryBeingRemoved: Category;

  searchResults: Item[] = [];
  query: string;
  selectedCategoryName: string;
  modalCategoryInput: string = '';
  editingCategory: Category;
  editingItems: Item[];
  editingCategories: Category[] = [];
  defaultCategories: Category[] = DefaultCategories.DEFAULT_CATEGORIES;
  defaultCategorySelectedInModal = '';
  addCategorySelectedTab = 0; // 0 - new, 1 - default
  categoryImportInput = '';

  swappingIndex: number;
  swappingCategory: Category;
  deletingItem: Item;
  categoryOfDeletingItem: Category;

  searchErrorStateMatcher = new SearchErrorStateMatcher();
  searchFormControl = new FormControl('', [
    Validators.required
  ]);
  addDefaultCategoryFormControl = new FormControl('', [
    Validators.required
  ]);
  addNewCategoryFormControl = new FormControl('', [
    Validators.required
  ]);

  editing: boolean = false;

  // Styles pending being applied
  backgroundUrl = DefaultStyles.DEFAULT_BACKGROUND_URL;
  cardColor = DefaultStyles.DEFAULT_CARD_COLOR;
  cardHeaderColor = DefaultStyles.DEFAULT_CARD_HEADER_COLOR;
  cardBorderColor = DefaultStyles.DEFAULT_CARD_BORDER_COLOR;
  cardBorderWidth = DefaultStyles.DEFAULT_CARD_BORDER_WIDTH;
  iconSize = DefaultStyles.DEFAULT_ICON_SIZE;
  showKc = DefaultStyles.DEFAULT_SHOW_KC;
  showQty = DefaultStyles.DEFAULT_SHOW_QTY;
  titleFont = DefaultStyles.DEFAULT_TITLE_FONT;
  bgOpacity = DefaultStyles.DEFAULT_BG_OPACITY;
  showProgress = DefaultStyles.DEFAULT_SHOW_PROGRESS;
  ironSize = DefaultStyles.DEFAULT_IRON_SIZE;
  titleColor = DefaultStyles.DEFAULT_TITLE_COLOR;
  headerColor = DefaultStyles.DEFAULT_HEADER_COLOR;
  progressColor = DefaultStyles.DEFAULT_PROGRESS_COLOR;
  lockedOpacity = DefaultStyles.DEFAULT_LOCKED_OPACITY;
  bgColor = DefaultStyles.DEFAULT_BG_COLOR;
  showCategoryKc = DefaultStyles.DEFAULT_SHOW_CATEGORY_KC;
  categoryKcColor = DefaultStyles.DEFAULT_CATEGORY_KC_COLOR;
  cardMargin = DefaultStyles.DEFAULT_CARD_MARGIN;
  showQp = DefaultStyles.DEFAULT_SHOW_QP;
  qpIconSize = DefaultStyles.DEFAULT_QP_ICON_SIZE;
  showProgressBar = DefaultStyles.DEFAULT_SHOW_PROGRESS_BAR;
  progressBarColor = DefaultStyles.DEFAULT_PROGRESS_BAR_COLOR;
  fadeBg = DefaultStyles.DEFAULT_FADE_BG;

  constructor(private http: HttpClient, private elementRef: ElementRef, private renderer: Renderer2,
              public styleService: StyleService, private _snackbar: MatSnackBar) {

  }

  ngOnInit() {
    this.loadFromLocalStorage();
    if (this.categories && this.categories.length != 0) {
      this.selectedCategoryName = this.categories[0].name;
    }
    this.http.get(this.apiUrl).subscribe(res => {
      if (!res || res === '')
        console.error('Error while retrieving item data from OSRS Box API');
      this.itemData = res;
    }, error => {
      console.error('Error while retrieving item data from OSRS Box API');
      console.error(error);
    });
    if (localStorage.getItem('styles')) {
      this.loadStylesFromLocalStorage();
    }
  }

  loadFromLocalStorage() {
    if (localStorage.getItem('categories')) {
      this.categories = JSON.parse(localStorage.getItem('categories'));
    } else {
      this.categories = DefaultCategories.DEFAULT_CATEGORIES;
    }
    if (localStorage.getItem('title')) {
      this.title = localStorage.getItem('title');
    }
    if (localStorage.getItem('ironmanType')) {
      this.ironmanType = Number(localStorage.getItem('ironmanType'));
    }
    if (localStorage.getItem('qp')) {
      this.qp = localStorage.getItem('qp');
    }
  }

  scrollToTop() {
    window.scroll(0,0);
  }

  saveItemInfo() {
    this.saveCategories();
  }

  incrementIronmanType() {
    if(this.ironmanType == 3) {
      this.ironmanType = 0;
    } else {
      this.ironmanType++;
    }
    localStorage.setItem('ironmanType', this.ironmanType.toString());
  }

  saveTitle() {
    localStorage.setItem('title', this.title);
  }

  saveQp() {
    if (Number(this.qp) > 275)
      this.qp = '275';
    if (Number(this.qp) < 0)
      this.qp = '0';
    localStorage.setItem('qp', this.qp);
  }

  toggleCategoryLocked(category: Category) {
    category.locked = !category.locked;
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

  getCategoryJSON(): string {
    return JSON.stringify(this.categories);
  }

  applyCategoryImport() {
    if (this.categoryImportInput == null || this.categoryImportInput == '')
      return;
    try {
      let categories: Category[] = JSON.parse(this.categoryImportInput);
      if (categories != null) {
        this.categories = categories;
        this.saveCategories();
      }
    }
    catch(error) {
      alert('An error occurred while importing the categories. Please check that you have pasted the correct code');
      console.error(error);
    }
    this.categoryImportInput = '';
  }

  showClipboardSuccess() {
    this._snackbar.open('Categories export code has been copied to clipboard', 'Dismiss', {duration: 5000});
  }

  swapInArray(array: any[], index1: number, index2: number) {
    let temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
  }

  captureScreenshot() {
    this.toggleScreenshotHiddenElements(true);
    html2canvas(document.body, {allowTaint: true, useCORS: true, backgroundColor: this.styleService.bgColor}).then(function (canvas) {
      let dataURI = canvas.toDataURL();
      let blob = canvas.toBlob(()=>{}, 'image/png', 1);
      let a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;
      a.href = dataURI;
      a.download = 'diary-export.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(dataURI);
      a.remove();
      window.open().document.write('<img src="' + dataURI + '" alt="Exported image"/>');
    });
    this.toggleScreenshotHiddenElements(false);
  }

  toggleScreenshotHiddenElements(hidden: boolean) {
    let elementsToHide = this.elementRef.nativeElement.querySelectorAll('.ss-hide');
    for (let i = 0; i < elementsToHide.length; i++) {
      elementsToHide[i].style.visibility = (hidden ? 'hidden' : '');
      elementsToHide[i].style.display = (hidden ? 'none' : '');
    }
  }

  findItemByName() {
    this.searchResults = [];
    if (!this.query || this.query.length < 3)
      return;
    for (let key in this.itemData) {
      if (this.itemData.hasOwnProperty(key) && this.itemData[key]['name']) {
        let itemName: string = this.itemData[key]['name'];
        if (itemName.toLowerCase().includes(this.query.toLowerCase())) {
          let item: Item = {
            id: this.itemData[key]['id'],
            name: this.itemData[key]['name'],
            unlocked: false
          };
          let shouldAdd = true;
          this.searchResults.forEach(result => {
            if (result.name === item.name && result.id < item.id) {
              shouldAdd = false;
            }
          });
          if (shouldAdd)
            this.searchResults.push(item);
        }
      }
    }
  }

  moveCategoryUp(index: number) {
    if (index === 0)
      return;
    let currentCategory = this.categories[index];
    if (this.categories[index - 1]) {
      let temp = this.categories[index - 1];
      this.categories[index - 1] = currentCategory;
      this.categories[index] = temp;
    }
  }

  moveCategoryDown(index: number) {
    if (index === this.categories.length - 1)
      return;
    let currentCategory = this.categories[index];
    if (this.categories[index + 1]) {
      let temp = this.categories[index + 1];
      this.categories[index + 1] = currentCategory;
      this.categories[index] = temp;
    }
  }

  moveItemUp(index: number, category: Category) {
    if (index == 0)
      return;
    let temp = category.items[index - 1];
    category.items[index - 1] = category.items[index];
    category.items[index] = temp;
  }

  moveItemDown(index: number, category: Category) {
    if (index == category.items.length - 1)
      return;
    let temp = category.items[index + 1];
    category.items[index + 1] = category.items[index];
    category.items[index] = temp;
  }

  removeItem(category: Category, itemToRemove: Item) {
    category.items = category.items.filter(item => item != itemToRemove);
    this.saveCategories();
  }

  toggleEditingCategory(categoryToToggle: Category) {
    if (this.editingCategories.includes(categoryToToggle)) {
      this.editingCategories = this.editingCategories.filter(category => category != categoryToToggle);
    } else {
      this.editingCategories.push(categoryToToggle);
    }
  }

  getCategoryTitleWidth(name) {
    if (!name)
      return {width: '1ch', color: this.headerColor};
    return {width: (name.length + 2) + "ch", color: this.headerColor};
  }

  bgUploaded(event) {
    this.backgroundUrl = URL.createObjectURL(event.target.files[0]);
  }

  applyStyles() {
    this.styleService.backgroundImageUrl = this.backgroundUrl;
    this.styleService.cardColor = this.cardColor;
    this.styleService.cardHeaderColor = this.cardHeaderColor;
    this.styleService.cardBorderColor = this.cardBorderColor;
    this.styleService.cardBorderWidth = this.cardBorderWidth;
    this.styleService.iconSize = this.iconSize;
    this.styleService.showKc = this.showKc;
    this.styleService.showQty = this.showQty;
    this.styleService.bgOpacity = this.bgOpacity;
    this.styleService.showProgress = this.showProgress;
    this.styleService.ironSize = this.ironSize;
    this.styleService.titleColor = this.titleColor;
    this.styleService.headerColor = this.headerColor;
    this.styleService.progressColor = this.progressColor;
    this.styleService.lockedOpacity = this.lockedOpacity;
    this.styleService.bgColor = this.bgColor;
    this.styleService.categoryKcColor = this.categoryKcColor;
    this.styleService.showCategoryKc = this.showCategoryKc;
    this.styleService.cardMargin = this.cardMargin;
    this.styleService.qpIconSize = this.qpIconSize;
    this.styleService.showQp = this.showQp;
    this.styleService.titleFont = this.titleFont;
    this.styleService.progressBarColor = this.progressBarColor;
    this.styleService.showProgressBar = this.showProgressBar;
    this.styleService.fadeBg = this.fadeBg;
    this.styleService.applyStyles();
  }

  resetStyles() {
    this.backgroundUrl = DefaultStyles.DEFAULT_BACKGROUND_URL;
    this.cardColor = DefaultStyles.DEFAULT_CARD_COLOR;
    this.cardHeaderColor = DefaultStyles.DEFAULT_CARD_HEADER_COLOR;
    this.cardBorderColor = DefaultStyles.DEFAULT_CARD_BORDER_COLOR;
    this.cardBorderWidth = DefaultStyles.DEFAULT_CARD_BORDER_WIDTH;
    this.iconSize = 50;
    this.showKc = DefaultStyles.DEFAULT_SHOW_KC;
    this.showQty = DefaultStyles.DEFAULT_SHOW_QTY;
    this.bgOpacity = DefaultStyles.DEFAULT_BG_OPACITY;
    this.showProgress = DefaultStyles.DEFAULT_SHOW_PROGRESS;
    this.ironSize = DefaultStyles.DEFAULT_IRON_SIZE;
    this.titleColor = DefaultStyles.DEFAULT_TITLE_COLOR;
    this.headerColor = DefaultStyles.DEFAULT_HEADER_COLOR;
    this.progressColor = DefaultStyles.DEFAULT_PROGRESS_COLOR;
    this.lockedOpacity = DefaultStyles.DEFAULT_LOCKED_OPACITY;
    this.bgColor = DefaultStyles.DEFAULT_BG_COLOR;
    this.categoryKcColor = DefaultStyles.DEFAULT_CATEGORY_KC_COLOR;
    this.showCategoryKc = DefaultStyles.DEFAULT_SHOW_CATEGORY_KC;
    this.cardMargin = DefaultStyles.DEFAULT_CARD_MARGIN;
    this.qpIconSize = DefaultStyles.DEFAULT_QP_ICON_SIZE;
    this.showQp = DefaultStyles.DEFAULT_SHOW_QP;
    this.titleFont = DefaultStyles.DEFAULT_TITLE_FONT;
    this.showProgressBar = DefaultStyles.DEFAULT_SHOW_PROGRESS_BAR;
    this.progressBarColor = DefaultStyles.DEFAULT_PROGRESS_BAR_COLOR;
    this.fadeBg = DefaultStyles.DEFAULT_FADE_BG;

    let bgUpload = this.elementRef.nativeElement.querySelectorAll('#bg-upload');
    if (bgUpload[0]) {
      bgUpload[0].value = '';
    }
  }

  cancelStyles() {
    this.backgroundUrl = this.styleService.backgroundImageUrl;
    this.cardColor = this.styleService.cardColor;
    this.cardHeaderColor = this.styleService.cardHeaderColor;
    this.cardBorderColor = this.styleService.cardBorderColor;
    this.cardBorderWidth = this.styleService.cardBorderWidth;
    this.iconSize = this.styleService.iconSize;
    this.showKc = this.styleService.showKc;
    this.showQty = this.styleService.showQty;
    this.bgOpacity = this.styleService.bgOpacity;
    this.showProgress = this.styleService.showProgress;
    this.ironSize = this.styleService.ironSize;
    this.titleColor = this.styleService.titleColor;
    this.headerColor = this.styleService.headerColor;
    this.progressColor = this.styleService.progressColor;
    this.lockedOpacity = this.styleService.lockedOpacity;
    this.bgColor = this.styleService.bgColor;
    this.categoryKcColor = this.styleService.categoryKcColor;
    this.showCategoryKc = this.styleService.showCategoryKc;
    this.cardMargin = this.styleService.cardMargin;
    this.qpIconSize = this.styleService.qpIconSize;
    this.showQp = this.styleService.showQp;
    this.titleFont = this.styleService.titleFont;
    this.showProgressBar = this.styleService.showProgressBar;
    this.progressBarColor = this.styleService.progressBarColor;
    this.fadeBg = this.styleService.fadeBg;
  }

  loadStylesFromLocalStorage() {
    let styleObj = JSON.parse(localStorage.getItem('styles'));
    this.backgroundUrl = styleObj['backgroundImageUrl'];
    this.cardColor = styleObj['cardColor'];
    this.cardHeaderColor = styleObj['cardHeaderColor'];
    this.cardBorderColor = styleObj['cardBorderColor'];
    this.cardBorderWidth = styleObj['cardBorderWidth'];
    this.iconSize = styleObj['iconSize'];
    this.showKc = styleObj['showKc'];
    this.showQty = styleObj['showQty'];
    this.bgOpacity = styleObj['bgOpacity'];
    this.showProgress = styleObj['showProgress'];
    this.ironSize = styleObj['ironSize'];
    this.titleColor = styleObj['titleColor'];
    this.headerColor = styleObj['headerColor'];
    this.progressColor = styleObj['progressColor'];
    this.lockedOpacity = styleObj['lockedOpacity'];
    this.bgColor = styleObj['bgColor'];
    this.categoryKcColor = styleObj['categoryKcColor'];
    this.showCategoryKc = styleObj['showCategoryKc'];
    this.cardMargin = styleObj['cardMargin'];
    this.showQp = styleObj['showQp'];
    this.qpIconSize = styleObj['qpIconSize'];
    this.titleFont = new Font(styleObj['titleFont']);
    this.showProgressBar = this.styleService.showProgressBar;
    this.progressBarColor = this.styleService.progressBarColor;
    this.fadeBg = this.styleService.fadeBg;
  }

  getUnlockedItemsCount(items: Item[]) {
    let result = 0;
    if (!items)
      return;
    items.filter(item => {
      if (item.unlocked)
        result++;
    });
    return result;
  }

  getItemQtyStyles() {
    return {
      'position': 'absolute',
      'top': 0,
      'left': (this.styleService.iconSize) + 'px'
    };
  }

  getItemKcStyles() {
    return {
      'position': 'absolute',
      'top': (this.styleService.iconSize / 50 * 20) + 'px',
      'left': 0
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
    return (unlocked/total)*100;
  }

  getDimensionControlWidth(text) {
    if (!text) {
      return 3;
    }
    return (text.toString().length + 2);
  }

  reset() {
    this.categories = DefaultCategories.DEFAULT_CATEGORIES;
    this.selectedCategoryName = '';
    this.saveCategories();
  }

  saveCategories() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  addItemToCategory(item: Item) {
    if (this.searchFormControl.hasError('required') || this.categories.length === 0)
      return;

    this.categories.filter(category => {
      if (category.name === this.selectedCategoryName) {
        category.items.push(item);
      }
    });
    this.saveCategories();
  }

  getFirstValidCategory(): Category {
    let result: Category = new Category();
    this.categories.forEach(category => {
      if (category && category.name && category.name != '') {
        result = category;
      }
    });
    console.log('first valid category was: ' + result.name);
    return result;
  }

  shouldBreakLine(index: number, category: Category) {
    let multiple = Number.isInteger((index+1) / category.x);
    return multiple;
  }

  toggleEditMode() {
    this.editing = !this.editing;
  }

  printCategories() {
    console.log(JSON.stringify(this.categories));
  }

  toggleItemUnlocked(item: Item, category: Category) {
      item.unlocked = !item.unlocked;

      let regex: RegExp = /^(Ardougne cloak|Desert amulet|Falador shield|Fremennik sea boots|Kandarin headgear|Karamja gloves|Rada's blessing|Explorer's ring|Morytania legs|Varrock armour|Western banner|Wilderness sword)(\s)(\d)$/i;
      let matches = item.name.match(regex);

      if (!matches) {
        this.saveCategories();
        return;
      }

      if (matches && matches[1] && matches[3]) {
        let diaryItem = matches[1];
        let number = matches[3];
        category.items.filter(itemInObj => {
          let categoryRegex = new RegExp(diaryItem, "i");
          let categoryItemMatches = itemInObj.name.match(categoryRegex);
          if (categoryItemMatches && categoryItemMatches.length > 0) {
            let matchNumber = itemInObj.name.replace(categoryRegex, '');
            if (Number(matchNumber) < Number(number) && item.unlocked) {
              itemInObj.unlocked = true;
            } else if (Number(matchNumber) > Number(number) && !item.unlocked) {
              itemInObj.unlocked = false;
            }
          }
        });
      }
    this.saveCategories();
  }

  removeCategory(categoryToRemove: Category) {
    if (!categoryToRemove)
      return;
    if (this.selectedCategoryName === categoryToRemove.name) {
      this.searchFormControl.setErrors({'required': true});
    }
    this.categories = this.categories.filter(category => category != categoryToRemove);
    this.saveCategories();
  }

  addCategory() {
    if (this.addCategorySelectedTab === 0) {
      this.categories.push({name: this.modalCategoryInput, items: [], locked: false});
    } else if (this.addCategorySelectedTab === 1) {
      if (!this.defaultCategorySelectedInModal || this.defaultCategorySelectedInModal === '')
        return;
      DefaultCategories.DEFAULT_CATEGORIES.filter(category => {
        if (category.name === this.defaultCategorySelectedInModal) {
          this.categories.push(category);
        }
      });
    }
    window.scroll(0, document.body.scrollHeight);
    this.saveCategories();
  }
}
