import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  effect,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwipeCarouselItem } from '../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-swipe-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './swipe-carousel.component.html',
  styleUrls: ['./swipe-carousel.component.scss']
})
export class SwipeCarouselComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) items: SwipeCarouselItem[] = [];
  @Input() selectedIndex = 0;

  @Output() itemSelected = new EventEmitter<SwipeCarouselItem>();
  @Output() selectAdd = new EventEmitter<void>();

  currentIndex = signal(0);

  private startX = 0;
  private deltaX = 0;
  private dragging = false;
  private container?: HTMLElement;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedIndex']) {
      this.currentIndex.set(this.selectedIndex);
    }
  }

  ngAfterViewInit() {
    this.container = document.querySelector('.carousel-track') as HTMLElement;
    if (this.container) {
      this.container.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.container.addEventListener('pointermove', this.onPointerMove.bind(this));
      this.container.addEventListener('pointerup', this.onPointerUp.bind(this));
    }
  }

  goTo(index: number) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex.set(index);
    }
  }

  onClick(index: number) {
    const selected = this.items[index];
    if (selected.isAddButton) {
      this.selectAdd.emit();
    } else {
      this.itemSelected.emit(selected);
    }
  }

  isSelected(index: number): boolean {
    return this.currentIndex() === index;
  }

  getItemTransform(index: number): string {
    const offset = index - this.currentIndex();
    const scale = index === this.currentIndex() ? 1 : 0.8;
    const translate = offset * 80; // px, selon taille souhaitée
    return `translateX(${translate}%) scale(${scale})`;
  }

  onPointerDown(event: PointerEvent) {
    event.preventDefault(); // <-- empêche le scroll natif
    this.startX = event.clientX;
    this.deltaX = 0;
    this.dragging = true;
    this.container?.setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent) {
    if (!this.dragging) return;
    this.deltaX = event.clientX - this.startX;
  }

  onPointerUp(event: PointerEvent) {
    if (!this.dragging) return;
    this.dragging = false;

    const threshold = 50;
    if (this.deltaX > threshold) {
      this.goTo(this.currentIndex() - 1);
    } else if (this.deltaX < -threshold) {
      this.goTo(this.currentIndex() + 1);
    }

    this.deltaX = 0;
    this.container?.releasePointerCapture(event.pointerId);
  }
}
