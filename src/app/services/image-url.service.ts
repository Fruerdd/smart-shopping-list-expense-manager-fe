import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {

  getFullImageUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath) return null;

    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }

    if (avatarPath.startsWith('/uploads/')) {
      return `${environment.apiUrl}${avatarPath}`;
    }

    return avatarPath;
  }
}
