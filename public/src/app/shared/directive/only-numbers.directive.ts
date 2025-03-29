import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  standalone:true,
  selector: '[appOnlyNumbers]'
})
export class OnlyNumbersDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    input.value = input.value.replace(/[^0-9]/g, ''); // Replace non-numeric characters with empty string
  }

}
