import {Component} from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from 'src/app/features/header/header.component';
import {FooterComponent} from 'src/app/features/footer/footer.component';
import {filter} from 'rxjs/operators';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showHeader: boolean = true;
  showFooter: boolean = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const hiddenRoutes = ['/login', '/signup'];
      this.showHeader = !hiddenRoutes.includes(event.url);
      this.showFooter = !hiddenRoutes.includes(event.url);
    });
  }
}
