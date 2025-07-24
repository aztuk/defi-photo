import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notification()" class="notification" [ngClass]="notification()?.type">
      {{ notification()?.message }}
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 16px;
      left: 16px;
      right: 16px;
      text-align:center;
      padding: 16px;
      border-radius: 8px;
      color: white;
      z-index: 1000;
    }
    .success {
      background-color: #28a745;
      color: white;
    }
    .error {
      background-color:rgba(244, 67, 54, 0.65);
    }
  `]
})
export class NotificationComponent {
  notification;

  constructor(private notificationService: NotificationService) {
    this.notification = this.notificationService.notification;
  }
}
