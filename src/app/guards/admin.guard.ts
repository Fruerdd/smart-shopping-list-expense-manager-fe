import {Injectable} from '@angular/core'; // Injectable decorator
import {CanActivate, Router, UrlTree} from '@angular/router'; // Router types
import {Observable, of} from 'rxjs'; // Observable + of()
import {catchError, map} from 'rxjs/operators'; // pipeable operators
import {AuthService} from '@app/services/auth.service'; // your existing AuthService
import {UserDTO, UsersService} from '@app/services/users.service'; // or UserProfileService, whichever you chose

@Injectable({providedIn: 'root'})
export class AdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private users: UsersService,
    private router: Router
  ) {
  }

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> {
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }

    const currentUserId = this.auth.getCurrentUserId();
    if (!currentUserId) {
      return this.router.createUrlTree(['/login']);
    }

    return this.users.getUsers().pipe(
      map((all: UserDTO[]) => {
        const me = all.find(u => u.id === currentUserId);
        return me?.userType === 'ADMIN'
          ? true
          : this.router.createUrlTree(['/dashboard']);
      }),
      catchError(() =>
        of(this.router.createUrlTree(['/dashboard']))
      )
    );
  }
}
