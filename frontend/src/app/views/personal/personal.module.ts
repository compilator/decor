import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalRoutingModule } from './personal-routing.module';
import { InfoComponent } from './info/info.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { OrdersComponent } from './orders/orders.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    InfoComponent,
    FavoriteComponent,
    OrdersComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PersonalRoutingModule
  ]
})
export class PersonalModule {
}
