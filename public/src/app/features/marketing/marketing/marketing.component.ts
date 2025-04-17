import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-marketing',
  imports: [CarouselModule, 
    ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.scss']
})
export class MarketingComponent {

  // slides: string[] = ['PDF 1', 'PDF 2', 'PDF 3'];
  // currentSlideIndex = 0;
  // autoSlideInterval: any;
  // fade = false;

  // ngOnInit() {
  //   this.startAutoSlide();
  // }

  // ngOnDestroy() {
  //   clearInterval(this.autoSlideInterval);
  // }

  // get currentSlide(): string {
  //   return this.slides[this.currentSlideIndex];
  // }

  // startAutoSlide() {
  //   this.autoSlideInterval = setInterval(() => {
  //     this.fade = true;
  //     setTimeout(() => {
  //       this.nextSlide();
  //       this.fade = false;
  //     }, 300); // match animation duration
  //   }, 2000); // 2 second interval
  // }

  // nextSlide() {
  //   this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
  // }

  // previousSlide() {
  //   this.currentSlideIndex =
  //     (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
  // }

  // customOptions = {
  //   loop: true,
  //   margin: 10,
  //   nav: false,
  //   dots: true,
  //   responsive: {
  //     0: { items: 1 },
  //     600: { items: 1 },
  //     1000: { items: 1 }
  //   }
  // };
  
  customOptions = {
    loop: true,
    nav: true,
    dots: true,
    items: 1,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true
  };
  
  handleClick() {
    console.log('Slide button clicked!');
  }
  
}
