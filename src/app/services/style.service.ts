import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {DefaultStyles} from "../constants/default-styles";
import {Font} from "ngx-font-picker";

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  private renderer: Renderer2;

  backgroundImageUrl: string = DefaultStyles.DEFAULT_BACKGROUND_URL;
  cardColor = DefaultStyles.DEFAULT_CARD_COLOR;
  cardHeaderColor = DefaultStyles.DEFAULT_CARD_HEADER_COLOR;
  cardBorderColor = DefaultStyles.DEFAULT_CARD_BORDER_COLOR;
  cardBorderWidth = DefaultStyles.DEFAULT_CARD_BORDER_WIDTH;
  iconSize = DefaultStyles.DEFAULT_ICON_SIZE;
  showKc = DefaultStyles.DEFAULT_SHOW_KC;
  showQty = DefaultStyles.DEFAULT_SHOW_QTY;
  bgOpacity = DefaultStyles.DEFAULT_BG_OPACITY;
  showProgress = DefaultStyles.DEFAULT_SHOW_PROGRESS;
  ironSize = DefaultStyles.DEFAULT_IRON_SIZE;
  titleColor = DefaultStyles.DEFAULT_TITLE_COLOR;
  headerColor = DefaultStyles.DEFAULT_HEADER_COLOR;
  progressColor = DefaultStyles.DEFAULT_PROGRESS_COLOR;
  lockedOpacity = DefaultStyles.DEFAULT_LOCKED_OPACITY;
  bgColor = DefaultStyles.DEFAULT_BG_COLOR;
  categoryKcColor = DefaultStyles.DEFAULT_CATEGORY_KC_COLOR;
  showCategoryKc = DefaultStyles.DEFAULT_SHOW_CATEGORY_KC;
  cardMargin = DefaultStyles.DEFAULT_CARD_MARGIN;
  showQp = DefaultStyles.DEFAULT_SHOW_QP;
  qpIconSize = DefaultStyles.DEFAULT_QP_ICON_SIZE;
  titleFont = DefaultStyles.DEFAULT_TITLE_FONT;
  showProgressBar = DefaultStyles.DEFAULT_SHOW_PROGRESS_BAR;
  progressBarColor = DefaultStyles.DEFAULT_PROGRESS_BAR_COLOR;
  fadeBg = DefaultStyles.DEFAULT_FADE_BG;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    if (localStorage.getItem('styles')) {
      this.loadStylesFromLocalStorage();
    } else {
      if (this.backgroundImageUrl != '') {
        this.renderer.setStyle(document.body, 'background-image', this.getBgStyle());
        this.renderer.setStyle(document.body, 'background-color', this.bgColor);
      }
    }
  }

  applyStyles() {
    if (this.backgroundImageUrl != '') {
      this.renderer.setStyle(document.body, 'background-image', this.getBgStyle());
      this.renderer.setStyle(document.body, 'background-color', this.bgColor);
    }
    this.saveStylesToLocalStorage();
  }

  getBgStyle() {
    let bgUrl = this.backgroundImageUrl;
    let opacity1 = ((100 - this.bgOpacity) / 100);
    let color1 = this.bgColor.substr(0, this.bgColor.lastIndexOf(',') + 1) + opacity1 + ')';
    let color2 = this.bgColor;
    let gradient = 'linear-gradient(to bottom, ' + color1 + ', ' + color2 + '), url(\'' + bgUrl + '\')';
    if (this.fadeBg) {
      return {'background-image': gradient, 'background-color': this.bgColor};
    } else {
      return {'background-image': 'url(\'' + bgUrl + '\')', 'background-color': this.bgColor};
    }
  }

  saveStylesToLocalStorage() {
    let styleObj = {
      backgroundImageUrl: this.backgroundImageUrl,
      cardColor: this.cardColor,
      cardHeaderColor: this.cardHeaderColor,
      cardBorderColor: this.cardBorderColor,
      cardBorderWidth: this.cardBorderWidth,
      iconSize: this.iconSize,
      showKc: this.showKc,
      showQty: this.showQty,
      bgOpacity: this.bgOpacity,
      showProgress: this.showProgress,
      ironSize: this.ironSize,
      titleColor: this.titleColor,
      headerColor: this.headerColor,
      progressColor: this.progressColor,
      lockedOpacity: this.lockedOpacity,
      bgColor: this.bgColor,
      categoryKcColor: this.categoryKcColor,
      showCategoryKc: this.showCategoryKc,
      cardMargin: this.cardMargin,
      showQp: this.showQp,
      qpIconSize: this.qpIconSize,
      titleFont: this.titleFont,
      showProgressBar: this.showProgressBar,
      progressBarColor: this.progressBarColor,
      fadeBg: this.fadeBg
    };
    localStorage.setItem('styles', JSON.stringify(styleObj));
  }

  loadStylesFromLocalStorage() {
    let styleObj = JSON.parse(localStorage.getItem('styles'));
    this.backgroundImageUrl = styleObj['backgroundImageUrl'];
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
    this.showProgressBar = styleObj['showProgressBar'];
    this.progressBarColor = styleObj['progressBarColor'];
    this.fadeBg = styleObj['fadeBg'];
    this.applyStyles();
  }
}
