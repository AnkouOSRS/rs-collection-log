import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {DefaultStyles} from "../../constants/default-styles";
import {Font} from "ngx-font-picker";
import {Styles} from "../../models/styles";

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  private renderer: Renderer2;

  appliedStyles: Styles = new Styles();
  pendingStyles: Styles = new Styles();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    if (localStorage.getItem('styles')) {
      this.loadStylesFromLocalStorage();
    } else {
      if (this.appliedStyles.backgroundImageUrl != '') {
        this.renderer.setStyle(document.body, 'background-image', this.getBgStyle());
      }
    }
    this.renderer.setStyle(document.body, 'background-color', this.appliedStyles.bgColor);
  }

  applyStyles() {
    this.appliedStyles = JSON.parse(JSON.stringify(this.pendingStyles));
    this.appliedStyles.titleFont = new Font(this.appliedStyles.titleFont);
    if (this.appliedStyles.backgroundImageUrl != '') {
      this.renderer.setStyle(document.body, 'background-image', this.getBgStyle());
      this.renderer.setStyle(document.body, 'background-color', this.appliedStyles.bgColor);
    }
    this.saveStylesToLocalStorage();
  }

  cancelStyles() {
    this.pendingStyles = JSON.parse(JSON.stringify(this.appliedStyles));
    this.pendingStyles.titleFont = new Font(this.pendingStyles.titleFont);
  }

  resetStyles() {
    this.pendingStyles = DefaultStyles.DEFAULT_STYLES;
    // let bgUpload = this.elementRef.nativeElement.querySelectorAll('#bg-upload');
    let bgUpload = document.querySelectorAll('#bg-upload');
    if (bgUpload[0] != null) {
      bgUpload[0]['value'] = '';
    }
  }

  getBgStyle() {
    let bgUrl = this.appliedStyles.backgroundImageUrl;
    let opacity1 = ((100 - this.appliedStyles.bgOpacity) / 100);
    let color1 = this.appliedStyles.bgColor.substr(0, this.appliedStyles.bgColor.lastIndexOf(',') + 1) + opacity1 + ')';
    let color2 = this.appliedStyles.bgColor;
    let stop1 = this.appliedStyles.fadeStart;
    let gradient = 'linear-gradient(to bottom, ' + color1 + ' ' + stop1 + '%, ' + color2 + ' 100%), url(\'' + bgUrl + '\')';
    if (this.appliedStyles.fadeBg) {
      return {'background-image': gradient, 'background-color': this.appliedStyles.bgColor};
    } else {
      return {'background-image': 'url(\'' + bgUrl + '\')', 'background-color': this.appliedStyles.bgColor};
    }
  }

  saveStylesToLocalStorage() {
    localStorage.setItem('styles', JSON.stringify(this.appliedStyles));
  }

  loadStylesFromLocalStorage() {
    this.appliedStyles = JSON.parse(localStorage.getItem('styles'));
    this.pendingStyles = JSON.parse(localStorage.getItem('styles'));
    this.appliedStyles.titleFont = new Font(this.appliedStyles.titleFont);
    this.pendingStyles.titleFont = new Font(this.pendingStyles.titleFont);
  }
}
