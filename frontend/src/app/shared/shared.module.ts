import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { LoaderComponent } from './components/loader/loader.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { CountSelectorComponent } from './components/count-selector/count-selector.component';
import { AddToCartControlComponent } from './components/add-to-cart-control/add-to-cart-control.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LayoutComponent } from './layout/layout.component';

@NgModule({
  declarations: [
    LoaderComponent,
    ProductCardComponent,
    CountSelectorComponent,
    AddToCartControlComponent,
    HeaderComponent,
    FooterComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CarouselModule
  ],
  exports: [
    LoaderComponent,
    ProductCardComponent,
    CountSelectorComponent,
    AddToCartControlComponent,
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    CarouselModule,
    FormsModule,
    RouterModule
  ]
})
export class SharedModule {
}
