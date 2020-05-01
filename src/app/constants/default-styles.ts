import {Font} from "ngx-font-picker";
import {Styles} from "../models/styles";

export class DefaultStyles {
  public static DEFAULT_BACKGROUND_URL = 'assets/bg.jpg';
  public static DEFAULT_CARD_COLOR = 'rgba(0,0,0,.75)';
  public static DEFAULT_CARD_HEADER_COLOR = 'rgba(255,255,255,.1)';
  public static DEFAULT_CARD_BORDER_COLOR = 'rgba(255,255,255,.75)';
  public static DEFAULT_CARD_BORDER_WIDTH = 1;
  public static DEFAULT_ICON_SIZE = 50;
  public static DEFAULT_SHOW_KC = true;
  public static DEFAULT_SHOW_QTY = true;
  public static DEFAULT_BG_OPACITY = 50;
  public static DEFAULT_SHOW_PROGRESS = true;
  public static DEFAULT_IRON_SIZE = 66;
  public static DEFAULT_TITLE_COLOR = 'rgba(255,255,255,1)';
  public static DEFAULT_HEADER_COLOR = 'rgba(255,255,255,1)';
  public static DEFAULT_PROGRESS_COLOR = 'rgba(255,255,255,.5)';
  public static DEFAULT_LOCKED_OPACITY = 30;
  public static DEFAULT_BG_COLOR = 'rgba(0,0,0,1)';
  public static DEFAULT_CATEGORY_KC_COLOR = 'rgba(255,255,255,.75)';
  public static DEFAULT_SHOW_CATEGORY_KC = true;
  public static DEFAULT_CARD_MARGIN = 5;
  public static DEFAULT_SHOW_QP = true;
  public static DEFAULT_QP_ICON_SIZE = 50;
  public static DEFAULT_SHOW_PROGRESS_BAR = false;
  public static DEFAULT_PROGRESS_BAR_COLOR = 'warn';
  public static DEFAULT_FADE_BG = true;
  public static DEFAULT_FADE_START = 0;
  public static DEFAULT_TITLE_FONT = new Font({
    family: 'Oswald',
    size: '35pt',
    style: 'bold',
    styles: ['bold']
  });

  public static readonly DEFAULT_STYLES: Styles = {
    backgroundImageUrl: DefaultStyles.DEFAULT_BACKGROUND_URL,
    cardColor: DefaultStyles.DEFAULT_CARD_COLOR,
    cardHeaderColor: DefaultStyles.DEFAULT_CARD_HEADER_COLOR,
    cardBorderColor: DefaultStyles.DEFAULT_CARD_BORDER_COLOR,
    cardBorderWidth: DefaultStyles.DEFAULT_CARD_BORDER_WIDTH,
    iconSize: DefaultStyles.DEFAULT_ICON_SIZE,
    showKc: DefaultStyles.DEFAULT_SHOW_KC,
    showQty: DefaultStyles.DEFAULT_SHOW_QTY,
    bgOpacity: DefaultStyles.DEFAULT_BG_OPACITY,
    showProgress: DefaultStyles.DEFAULT_SHOW_PROGRESS,
    ironSize: DefaultStyles.DEFAULT_IRON_SIZE,
    titleColor: DefaultStyles.DEFAULT_TITLE_COLOR,
    headerColor: DefaultStyles.DEFAULT_HEADER_COLOR,
    progressColor: DefaultStyles.DEFAULT_PROGRESS_COLOR,
    lockedOpacity: DefaultStyles.DEFAULT_LOCKED_OPACITY,
    bgColor: DefaultStyles.DEFAULT_BG_COLOR,
    categoryKcColor: DefaultStyles.DEFAULT_CATEGORY_KC_COLOR,
    showCategoryKc: DefaultStyles.DEFAULT_SHOW_CATEGORY_KC,
    cardMargin: DefaultStyles.DEFAULT_CARD_MARGIN,
    showQp: DefaultStyles.DEFAULT_SHOW_QP,
    qpIconSize: DefaultStyles.DEFAULT_QP_ICON_SIZE,
    titleFont: DefaultStyles.DEFAULT_TITLE_FONT,
    showProgressBar: DefaultStyles.DEFAULT_SHOW_PROGRESS_BAR,
    progressBarColor: DefaultStyles.DEFAULT_PROGRESS_BAR_COLOR,
    fadeBg: DefaultStyles.DEFAULT_FADE_BG,
    fadeStart: DefaultStyles.DEFAULT_FADE_START
  };
}
