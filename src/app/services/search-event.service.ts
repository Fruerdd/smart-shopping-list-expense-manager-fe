// src/app/core/services/search-event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface SearchEvent {
  productId: string;
  searchTerm: string;
}

@Injectable({ providedIn: 'root' })
export class SearchEventService {
    private readonly base = environment.apiUrl;
    private readonly URL = `${this.base}/api/shopping-lists/search-logs`;

  constructor(private http: HttpClient) {}

  log(event: SearchEvent): Observable<void> {
    return this.http.post<void>(this.URL, event);
  }

  
}
