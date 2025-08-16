import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
})
export class AutoFocus implements AfterViewInit {
  readonly element = inject(ElementRef<HTMLInputElement>);

  ngAfterViewInit(): void {
    this.element.nativeElement.focus();
  }
}
