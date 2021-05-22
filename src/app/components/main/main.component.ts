import {Component, ElementRef, HostListener, OnInit, Renderer2} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Item} from "../../models/item";
import {Category} from "../../models/category";
import {DefaultCategories} from "../../constants/default-categories";
import html2canvas from "html2canvas";
import {StyleService} from "../../services/style/style.service";
import {SearchErrorStateMatcher} from "../../matchers/search-error-state-matcher";
import {FormControl, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material";
import {Profile} from "../../models/profile";
import {NgxSpinnerService} from "ngx-spinner";
import ResizeObserver from 'resize-observer-polyfill';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";

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
  defaultCategories: Category[] = DefaultCategories.DEFAULT_CATEGORIES;
  defaultCategorySelectedInModal = '';
  addCategorySelectedTab = 0; // 0 - new, 1 - default
  profileImportInput = '';

  isAddCollapsed = true;
  isItemSearchCollapsed = true;

  deletingItem: Item;
  categoryOfDeletingItem: Category;

  taskbarExpanded = true;

  shuffleProgress = 0;
  shuffleIterations = 50;
  iterationTime = -1;

  slicedCategories = [];

  numColumns = 5;

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
    Validators.min(-1),
    Validators.max(10000)
  ]);

  // @HostListener('window:resize', ['$event'])
  // onResize() {
  //   // this.screenWidthChanged();
  // }

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
    // this.screenWidthChanged();
  }

  getIndexOfCategory(category: Category): number {
    let result = -1;
    this.selectedProfile.categories.forEach((c, index) => {
      if (c.name === category.name) {
        result = index;
      }
    });
    return result;
  }

  loadFromLocalStorage() {
    // localStorage.removeItem('profiles');
    if (localStorage.getItem('profiles') != null) {
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
    this.profiles.forEach((profile: Profile) => {
      if (!profile.diaries || profile.diaries === []) {
        profile.diaries = DefaultCategories.DEFAULT_DIARIES;
      }
      if (undefined === profile.slicedCategories || profile.slicedCategories === []) {
        console.error('profile had no sliced categories');
        profile.slicedCategories = this.sliceCategories(profile.categories);
      }
    });
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

  async smartShuffleCategories() {
    if (this.shuffleIterations == -1) {
      this.selectedProfile.slicedCategories = this.deepCopy(this.shuffle2d(this.selectedProfile.slicedCategories));
      this.selectedProfile.categories = this.unsliceCategories();
      this.saveProfiles();
      return;
    }
    this.spinner.show();
    const container = document.querySelector('.card-container');
    const startHeight = container.scrollHeight;
    console.log('startHeight: ' + startHeight);

    let shuffles = 0;
    let minHeight = startHeight;
    let minSlices = this.deepCopy(this.selectedProfile.slicedCategories);
    let shuffledSlices;
    let slicesBeforeShuffle = this.deepCopy(this.selectedProfile.slicedCategories);

    const observer = new ResizeObserver(function() {
      const newHeight = container.scrollHeight;
      if (newHeight < minHeight) {
        minHeight = newHeight;
        console.log('new height: ' + newHeight);
        minSlices = shuffledSlices;
      }
    });

    observer.observe(container);

    const startTime = Date.now();
    while (shuffles < this.shuffleIterations) {
      this.selectedProfile.slicedCategories = this.shuffle2d(this.selectedProfile.slicedCategories);
      shuffledSlices = this.deepCopy(this.selectedProfile.slicedCategories);
      await this.delay(10);
      this.shuffleProgress = shuffles;
      shuffles++;
      if (this.iterationTime === -1 || shuffles % Math.floor(this.shuffleIterations / 5) === 0) {
        this.iterationTime = (Date.now() - startTime) / (shuffles);
      }
    }
    if (startHeight === minHeight) {
      this.selectedProfile.slicedCategories = this.deepCopy(slicesBeforeShuffle);
    } else if (undefined != minSlices && minSlices != []) {
      this.selectedProfile.slicedCategories = this.deepCopy(minSlices);
    } else {
      console.error(minSlices);
    }
    this.selectedProfile.categories = this.unsliceCategories();
    console.log('end height: ' + minHeight);
    const percentImproved = (((startHeight - minHeight) / startHeight) * 100.0).toFixed(0);
    this.saveProfiles();
    const revertSnackbarRef = this._snackbar.open('Smart shuffle reduced the page height by '
      + percentImproved + '%', 'Revert', {duration: 10000, verticalPosition: 'top'});
    revertSnackbarRef.onAction().subscribe(() => {
      this.selectedProfile.slicedCategories = slicesBeforeShuffle;
      this.selectedProfile.categories = this.unsliceCategories();
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

  shuffle2d(array) {
    const oneDimArr = array.reduce((a, b) => [...a, ...b], []);
    const shuffledArr = this.shuffle(oneDimArr);
    let shuffledTwoDirArr: any[][] = [];
    for (let i = 0; i < array.length; i++) {
      shuffledTwoDirArr[i] = [];
    }
    shuffledArr.forEach(element => {
      const index = Math.floor((Math.random() % 1) * (shuffledTwoDirArr.length));
      shuffledTwoDirArr[index].push(element);
    });
    return shuffledTwoDirArr;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      const listNum = Number((event.container.id).charAt(event.container.id.length - 1)) % this.numColumns;
      moveItemInArray(this.selectedProfile.slicedCategories[listNum], event.previousIndex, event.currentIndex);
    } else {
      const oldListNum = Number((event.previousContainer.id).charAt(event.previousContainer.id.length - 1)) % this.numColumns;
      const oldList = this.selectedProfile.slicedCategories[oldListNum];

      const newListNum = Number((event.container.id).charAt(event.container.id.length - 1)) % this.numColumns;
      const newList = this.selectedProfile.slicedCategories[newListNum];

      transferArrayItem(oldList, newList, event.previousIndex, event.currentIndex);
    }
    this.selectedProfile.categories = this.unsliceCategories();
    this.saveProfiles();
  }

  sliceCategories(categories: Category[]): Category[][] {
    const result: Category[][] = [];
    const cat: Category[] = (categories);
    const height = Math.ceil(cat.length / this.numColumns);

    for (let col = 0; col < this.numColumns; col++) {
      result[col] = [];
      for (let row = 0; row < height; row++) {
        if (undefined != cat[row + (this.numColumns - 1) * col]) {
          result[col].push(cat[row + (this.numColumns - 1) * col]);
        }
      }
    }
    return result;
  }

  unsliceCategories(): Category[] {
    const result: Category[] = [];
    const sliced = this.selectedProfile.slicedCategories;
    for (let i = 0; i < sliced.length; i++) {
      for (let j = 0; j < sliced[i].length; j++) {
        result.push(sliced[i][j]);
      }
    }
    return result;
  }

  screenWidthChanged() {
    const width = window.innerWidth;
    if (width > 1100) {
      if (this.numColumns != 5) {
        this.numColumns = 5;
        this.selectedProfile.slicedCategories = this.deepCopy(this.sliceCategories(this.selectedProfile.categories));
        this.selectedProfile.categories = this.deepCopy(this.unsliceCategories());
      }
    } else if (width > 900) {
      if (this.numColumns != 4) {
        this.numColumns = 4;
        this.selectedProfile.slicedCategories = this.deepCopy(this.sliceCategories(this.selectedProfile.categories));
        this.selectedProfile.categories = this.deepCopy(this.unsliceCategories());
      }
    } else if (width > 700) {
      if (this.numColumns != 3) {
        this.numColumns = 3;
        this.selectedProfile.slicedCategories = this.deepCopy(this.sliceCategories(this.selectedProfile.categories));
        this.selectedProfile.categories = this.deepCopy(this.unsliceCategories());
      }
    } else if (width > 515) {
      if (this.numColumns != 2) {
        this.numColumns = 2;
        this.selectedProfile.slicedCategories = this.deepCopy(this.sliceCategories(this.selectedProfile.categories));
        this.selectedProfile.categories = this.deepCopy(this.unsliceCategories());
      }
    } else {
      if (this.numColumns != 1) {
        this.numColumns = 1;
        this.selectedProfile.slicedCategories = this.deepCopy(this.sliceCategories(this.selectedProfile.categories));
        this.selectedProfile.categories = this.deepCopy(this.unsliceCategories());
      }
    }
    this.saveProfiles();
  }

  shouldShowTutorial() {
    return false;
    // return localStorage.getItem('showTutorial') != 'false';
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
    window.scroll(0,0);
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

  removeItem(category: Category, itemToRemove: Item) {
    category.items = category.items.filter(item => item != itemToRemove);
    this.saveProfiles();
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

  reset() {
    this.selectedProfile.categories = DefaultCategories.DEFAULT_PROFILE.categories;
    this.selectedProfile.ironmanType = DefaultCategories.DEFAULT_PROFILE.ironmanType;
    this.selectedProfile.name = DefaultCategories.DEFAULT_PROFILE.name;
    this.selectedProfile.qp = DefaultCategories.DEFAULT_PROFILE.qp;
    this.selectedProfile.slicedCategories = this.sliceCategories(this.selectedProfile.categories);
    this.saveProfiles();
  }

  saveProfiles() {
    if (undefined === this.selectedProfile.slicedCategories) {
      this.selectedProfile.slicedCategories = this.sliceCategories(this.selectedProfile.categories);
    }
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

  removeCategory(categoryToRemove: Category) {
    if (!categoryToRemove) {
      console.error('No category to remove');
      return;
    }
    if (this.selectedCategoryName === categoryToRemove.name) {
      this.searchFormControl.setErrors({'required': true});
    }
    this.selectedProfile.slicedCategories.forEach((slice, index) => {
      this.selectedProfile.slicedCategories[index] = slice.filter(cat => cat.name != categoryToRemove.name);
    });
    this.selectedProfile.categories = this.unsliceCategories();
    this.saveProfiles();
  }

  addCategory() {
    const shortestCategorySlice = this.selectedProfile.slicedCategories.reduce((prev, next) => prev.length > next.length ? next : prev);
    let dupe = false;
    this.selectedProfile.categories.forEach(cat => {
      if (cat.name === (this.addCategorySelectedTab === 0 ? this.modalCategoryInput : this.defaultCategorySelectedInModal)) {
        dupe = true;
      }
    });
    if (!dupe) {
      if (this.addCategorySelectedTab === 0) {
        shortestCategorySlice.push({name: this.modalCategoryInput, items: [], locked: false});
      } else if (this.addCategorySelectedTab === 1) {
        if (!this.defaultCategorySelectedInModal || this.defaultCategorySelectedInModal === '')
          return;
        DefaultCategories.DEFAULT_CATEGORIES.filter(category => {
          if (category.name === this.defaultCategorySelectedInModal) {
            shortestCategorySlice.push(category);
          }
        });
      }
      window.scroll(0, document.body.scrollHeight);
      this.selectedProfile.categories = this.unsliceCategories();
      this.saveProfiles();
    } else {
      this._snackbar.open('You already have a category with that name', 'Dismiss', {duration: 5000});
    }
  }
}
