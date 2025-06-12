// html-snack.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-html-snack',
  standalone: true,
  imports: [ CommonModule, MatSnackBarModule ],
  template: `<div [innerHTML]="data.message"></div>`,
  styles: [`div { font-size: 14px; }`]
})
export class HtmlSnackComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string }) {}
}
