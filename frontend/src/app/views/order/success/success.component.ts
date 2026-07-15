import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../shared/services/order.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss',
  standalone: false,
  host: { class: 'page-thank-you' }
})
export class SuccessComponent implements OnInit {
  private router = inject(Router);
  private orderService = inject(OrderService);

  ngOnInit(): void {
    if (!this.orderService.consumeOrderCompleted()) {
      this.router.navigate(['/']);
    }
  }
}
