import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Item} from "../../models/item";
import {Category} from "../../models/category";
import {DefaultCategories} from "../../constants/default-categories";
import html2canvas from "html2canvas";
import {StyleService} from "../../services/style.service";
import {SearchErrorStateMatcher} from "../../matchers/search-error-state-matcher";
import {FormControl, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material";
import {Profile} from "../../models/profile";
import {NgxSpinnerService} from "ngx-spinner";
import ResizeObserver from 'resize-observer-polyfill';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  apiUrl = 'https://www.osrsbox.com/osrsbox-db/items-complete.json';
  itemData;
  title = 'Collection Log';
  ironmanType: number = -1; // -1 -> first time user, 0 -> im, 1 -> hcim, 2 -> uim, 3 -> main
  qp = '0';
  categories: Category[] = [];

  profiles: Profile[];
  selectedProfile: Profile;
  selectedProfileName: string;
  modalProfileInput: string = '';

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
  profileImportInput = '';

  isAddCollapsed = true;
  isItemSearchCollapsed = true;

  swappingIndex: number;
  swappingCategory: Category;
  deletingItem: Item;
  categoryOfDeletingItem: Category;

  taskbarExpanded = true;

  shuffleProgress = 0;
  shuffleIterations = 250;
  iterationTime = -1;

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
  addNewProfileFormControl = new FormControl('', [
    Validators.required
  ]);
  iterationsFormControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
    Validators.max(10000)
  ]);

  constructor(private http: HttpClient, private elementRef: ElementRef, private renderer: Renderer2,
              public styleService: StyleService, private _snackbar: MatSnackBar, private spinner: NgxSpinnerService) {
    this.profiles = [DefaultCategories.DEFAULT_PROFILE];
    this.selectedProfile = this.profiles[0];
    this.selectedProfileName = this.selectedProfile.name;
  }

  ngOnInit() {
    this.loadFromLocalStorage();
    if (this.categories && this.categories.length != 0) {
      this.selectedCategoryName = this.categories[0].name;
    }
    if (this.profiles != null && this.selectedProfile == null && this.selectedProfileName == null) {
      this.selectedProfile = this.profiles[0];
      this.selectedProfileName = this.selectedProfile.name;
    }
    this.http.get(this.apiUrl).subscribe(res => {
      if (!res || res === '')
        console.error('Error while retrieving item data from OSRS Box API');
      this.itemData = res;
    }, error => {
      console.error('Error while retrieving item data from OSRS Box API');
      console.error(error);
    });
  }

  loadFromLocalStorage() {
    if (localStorage.getItem('profiles') != null) {
      console.log(JSON.parse(localStorage.getItem('profiles')));
      this.profiles = JSON.parse(localStorage.getItem('profiles'));
    } else {
      let defaultProfile: Profile;
      defaultProfile = {
        name: 'Collection Log',
        categories: ((localStorage.getItem('categories') != null ? JSON.parse(localStorage.getItem('categories')) : DefaultCategories.DEFAULT_CATEGORIES)),
        ironmanType: ((localStorage.getItem('ironmanType') != null ? JSON.parse(localStorage.getItem('ironmanType')) : -1)),
        qp: ((localStorage.getItem('qp') != null ? JSON.parse(localStorage.getItem('qp')) : 0)),
        diaries: DefaultCategories.DEFAULT_DIARIES
      };
      this.profiles = [defaultProfile];
    }
    if (localStorage.getItem('selectedProfile') != null) {
      let selectedIndex = Number(localStorage.getItem('selectedProfile'));
      if (this.profiles.length >= selectedIndex && this.profiles[selectedIndex] != null) {
        this.selectedProfile = this.profiles[selectedIndex];
        this.selectedProfileName = this.profiles[selectedIndex].name;
      }
    }
    this.profiles.filter(profile => {
      if (profile.name === this.selectedProfileName) {
        this.selectedProfile = profile;
      }
    });
    this.profiles.forEach((profile: Profile) => {
      if (!profile.diaries || profile.diaries === []) {
        profile.diaries = DefaultCategories.DEFAULT_DIARIES;
      }
    });
    this.saveProfiles();
  }

  scrollToTop() {
    window.scroll(0, 0);
  }

  incrementIronmanType() {
    if (this.selectedProfile.ironmanType == 3) {
      this.selectedProfile.ironmanType = 0;
    } else {
      this.selectedProfile.ironmanType++;
    }
    this.saveProfiles();
  }

  saveQp() {
    // if (Number(this.selectedProfile.qp) > 275)
    //   this.selectedProfile.qp = '275';
    if (Number(this.selectedProfile.qp) < 0)
      this.selectedProfile.qp = '0';
    this.saveProfiles();
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

  async smartShuffleCategories() {
    this.spinner.show();
    const categoriesBeforeShuffle = JSON.parse(JSON.stringify(this.selectedProfile.categories));
    const container = document.querySelector('.card-columns');
    const startHeight = container.scrollHeight;
    console.log('startHeight: ' + startHeight);

    let shuffles = 0;
    let minHeight = startHeight;
    let minCategories: Category[] = this.selectedProfile.categories;
    let shuffledCategories;

    const observer = new ResizeObserver(function() {
      const currentCategories = JSON.parse(JSON.stringify(shuffledCategories));
      const newHeight = container.scrollHeight;
      if (newHeight < minHeight) {
        minCategories = currentCategories;
        minHeight = newHeight;
        console.log('new height: ' + newHeight);
      }
    });

    observer.observe(container);

    const startTime = Date.now();
    while (shuffles < this.shuffleIterations) {
      shuffledCategories = JSON.parse(JSON.stringify(this.shuffle(this.selectedProfile.categories)));
      await this.delay(10);
      this.shuffleProgress = shuffles;
      shuffles++;
      if (this.iterationTime === -1 || shuffles % Math.floor(this.shuffleIterations / 5) === 0) {
        this.iterationTime = (Date.now() - startTime) / (shuffles);
      }
    }
    if (startHeight === minHeight) {
      this.selectedProfile.categories = categoriesBeforeShuffle;
    } else if (undefined != minCategories && minCategories != []) {
      this.selectedProfile.categories = JSON.parse(JSON.stringify(minCategories));
    } else {
      console.error(minCategories);
    }
    console.log('end height: ' + minHeight);
    const percentImproved = (((startHeight - minHeight) / startHeight) * 100.0).toFixed(0);
    this.saveProfiles();
    const revertSnackbarRef = this._snackbar.open('Smart shuffle reduced the page height by '
      + percentImproved + '%', 'Revert', {duration: 10000, verticalPosition: 'top'});
    revertSnackbarRef.onAction().subscribe(() => {
      this.selectedProfile.categories = categoriesBeforeShuffle;
      this.saveProfiles();
    });
    this.spinner.hide();
  }

  getShuffleProgress() {
    return (this.shuffleProgress / this.shuffleIterations) * 100
  }

  getShuffleEta() {
    return (this.iterationTime * (this.shuffleIterations - this.shuffleProgress));
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  shouldShowTutorial() {
    return localStorage.getItem('showTutorial') != 'false';
  }

  swapCategories(category, index) {
    const oldIndex = this.selectedProfile.categories.indexOf(category);
    const temp = this.deepCopy(this.selectedProfile.categories[index]);
    this.selectedProfile.categories[index] = category;
    this.selectedProfile.categories[oldIndex] = temp;
  }

  deepCopy(serializable) {
    return JSON.parse(JSON.stringify(serializable));
  }
  getProfileJSON(): string {
    return JSON.stringify(this.selectedProfile);
  }

  deleteProfile() {
    if (this.profiles.length == 0)
      return;
    if (this.profiles.length == 1) {
      this.selectedProfile = DefaultCategories.DEFAULT_PROFILE;
    } else {
      this.profiles = this.profiles.filter(profile => {
        if (profile == this.selectedProfile) {
          return false;
        }
        return true;
      });
    }
    this.selectedProfile = this.profiles[0];
    this.selectedProfileName = this.profiles[0].name;
    this.saveProfiles();
  }

  showClipboardSuccess() {
    this._snackbar.open('Profile export code has been copied to clipboard', 'Dismiss', {duration: 5000});
  }

  showProgressBarWarning() {
    if (this.styleService.pendingStyles.showProgressBar)
      this._snackbar.open('Progress bar may not display the correct progress in the exported screenshot.', 'Dismiss', {duration: 10000});
  }

  captureScreenshot() {
    this.toggleScreenshotHiddenElements(true);
    html2canvas(document.body, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: this.styleService.appliedStyles.bgColor
    }).then(function (canvas) {
      let dataURI = canvas.toDataURL();
      let a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;
      a.href = dataURI;
      a.download = 'diary-export.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(dataURI);
      a.remove();
      // window.open().document.write('<img src="' + dataURI + '" alt="Exported image"/>');
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
      if (this.itemData.hasOwnProperty(key) && this.itemData[key]['name'] && !this.itemData[key]['duplicate']) {
        let itemName: string = this.itemData[key]['name'];
        if (itemName.toLowerCase().includes(this.query.toLowerCase())) {
          let item: Item = {
            id: this.itemData[key]['id'],
            name: this.itemData[key]['name'],
            unlocked: false
          };
          this.searchResults.push(item);
        }
      }
    }
  }

  moveCategoryUp(index: number) {
    if (index === 0)
      return;
    let currentCategory = this.selectedProfile.categories[index];
    if (this.selectedProfile.categories[index - 1]) {
      let temp = this.selectedProfile.categories[index - 1];
      this.selectedProfile.categories[index - 1] = currentCategory;
      this.selectedProfile.categories[index] = temp;
    }
  }

  moveCategoryDown(index: number) {
    if (index === this.selectedProfile.categories.length - 1)
      return;
    let currentCategory = this.selectedProfile.categories[index];
    if (this.selectedProfile.categories[index + 1]) {
      let temp = this.selectedProfile.categories[index + 1];
      this.selectedProfile.categories[index + 1] = currentCategory;
      this.selectedProfile.categories[index] = temp;
    }
  }

  removeItem(category: Category, itemToRemove: Item) {
    category.items = category.items.filter(item => item != itemToRemove);
    this.saveProfiles();
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
      return {width: '1ch', color: this.styleService.appliedStyles.headerColor};
    return {width: (name.length + 2) + "ch", color: this.styleService.appliedStyles.headerColor};
  }

  bgUploaded(event) {
    this.styleService.pendingStyles.backgroundImageUrl = URL.createObjectURL(event.target.files[0]);
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

  reset() {
    this.profiles.filter(profile => {
      if (profile == this.selectedProfile) {
        profile.categories = DefaultCategories.DEFAULT_PROFILE.categories;
        profile.ironmanType = DefaultCategories.DEFAULT_PROFILE.ironmanType;
        profile.name = DefaultCategories.DEFAULT_PROFILE.name;
        profile.qp = DefaultCategories.DEFAULT_PROFILE.qp;
      }
    });
    this.saveProfiles();
  }

  saveProfiles() {
    localStorage.setItem('profiles', JSON.stringify(this.profiles));
  }

  setSelectedProfile() {
    this.profiles.filter(profile => {
      if (profile.name === this.selectedProfileName) {
        this.selectedProfile = profile;
      }
    });
    localStorage.setItem('selectedProfile', '' + this.profiles.indexOf(this.selectedProfile));
  }

  addProfile() {
    let name = this.modalProfileInput;
    this.profiles.filter(profile => {
      if (profile.name === name) {
        this._snackbar.open('You already have a profile with this name!', 'Dismiss', {duration: 5000});
      }
    });
    let profile = {
      name: this.modalProfileInput,
      categories: DefaultCategories.DEFAULT_CATEGORIES,
      qp: '0',
      ironmanType: -1,
      diaries: DefaultCategories.DEFAULT_DIARIES
    };
    this.profiles.push(profile);
    this.selectedProfile = this.profiles[this.profiles.length - 1];
    this.selectedProfileName = this.profiles[this.profiles.length - 1].name;
    this.saveProfiles();
  }

  importProfile() {
    let newProfile: Profile;
    try {
      newProfile = JSON.parse(this.profileImportInput);
    } catch (error) {
      this._snackbar.open('There was an error importing this profile. Make sure you copied the correct code!',
        'Dismiss', {duration: 5000});
      return;
    }
    let shouldAdd = true;
    this.profiles.forEach(profile => {
      if (profile.name === newProfile.name)
        shouldAdd = false;
    });
    if (shouldAdd) {
      this.profiles.push(newProfile);
      this.selectedProfile = newProfile;
      this.selectedProfileName = newProfile.name;
      this.saveProfiles();
    } else {
      this._snackbar.open('You already have a profile with this name!', 'Dismiss', {duration: 5000});
    }
  }

  addItemToCategory(item: Item) {
    if (this.searchFormControl.hasError('required') || this.selectedProfile.categories.length === 0)
      return;

    this.selectedProfile.categories.filter(category => {
      if (category.name === this.selectedCategoryName) {
        category.items.push(item);
      }
    });
    this.saveProfiles();
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

  removeCategory(categoryToRemove: Category) {
    if (!categoryToRemove)
      return;
    if (this.selectedCategoryName === categoryToRemove.name) {
      this.searchFormControl.setErrors({'required': true});
    }
    this.selectedProfile.categories = this.selectedProfile.categories.filter(category => category != categoryToRemove);
    this.saveProfiles();
  }

  addCategory() {
    if (this.addCategorySelectedTab === 0) {
      this.selectedProfile.categories.push({name: this.modalCategoryInput, items: [], locked: false});
    } else if (this.addCategorySelectedTab === 1) {
      if (!this.defaultCategorySelectedInModal || this.defaultCategorySelectedInModal === '')
        return;
      DefaultCategories.DEFAULT_CATEGORIES.filter(category => {
        if (category.name === this.defaultCategorySelectedInModal) {
          this.selectedProfile.categories.push(category);
        }
      });
    }
    window.scroll(0, document.body.scrollHeight);
    this.saveProfiles();
  }

  swapInArray(array: any[], index1: number, index2: number) {
    let temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
  }
}
