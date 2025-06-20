import { Component, ContentChild, ElementRef, Input, OnInit, AfterViewInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-header.component.html',
  styleUrls: ['./scroll-header.component.scss']
})
export class ScrollHeaderComponent implements OnInit, AfterViewInit {

  readonly shrinkRatio = signal(1);
  private lastRatio = 1;
  private lastScroll = 0;

  ngOnInit() {
    this.updateShrinkRatio();
  }

  ngAfterViewInit() {
    window.addEventListener('scroll', this.updateShrinkRatio.bind(this), { passive: true });
  }

  updateShrinkRatio() {
    const scrollTop = window.scrollY;
    if (scrollTop === this.lastScroll) return;

    this.lastScroll = scrollTop;
    const maxScroll = 100;
    const ratio = +(1 - Math.min(scrollTop, maxScroll) / maxScroll).toFixed(2);

    if (Math.abs(this.lastRatio - ratio) > 0.01) {
      this.shrinkRatio.set(ratio);
      this.lastRatio = ratio;
    }
  }
}
