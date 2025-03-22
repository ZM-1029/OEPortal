import { Directive, ElementRef, Input, Renderer2 } from "@angular/core";

@Directive({
  selector: "[appHideShowInfo]",
})
export class HideShowInfoDirective {
  @Input("appHideShowInfo") text: string = "";
  private isMasked = true;
  private span: HTMLSpanElement;
  private icon: HTMLElement;

  constructor(
    private _ElementRef: ElementRef,
    private renderer: Renderer2,
  ) {
    const parent = this._ElementRef.nativeElement;
    this.span = this.renderer.createElement("span");
    this.icon = this.renderer.createElement("i");

    this.renderer.addClass(this.icon, "fa-regular");
    this.renderer.addClass(this.icon, "fa-eye-slash");
    this.renderer.addClass(this.icon, "ms-2");
    this.renderer.listen(this.icon, "click", () => this.toggleMask());

    this.renderer.appendChild(parent, this.span);
    this.renderer.appendChild(parent, this.icon);
  }

  ngOnInit() {
    this.updateText();
  }

  private toggleMask() {
    this.isMasked = !this.isMasked;
    this.updateText();
  }

  private updateText() {
    this.span.textContent = this.isMasked
      ? this.maskString(this.text)
      : this.text;
    this.renderer.setAttribute(
      this.icon,
      "class",
      this.isMasked ? "fa-regular fa-eye-slash" : "fa-regular fa-eye",
    );
  }

  private maskString(text: string): string {
    return text.replace(/.(?=.{0})/g, "*");
  }
}
