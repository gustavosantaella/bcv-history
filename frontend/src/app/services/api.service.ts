import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rate } from '../models/rate.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRates(): Observable<Rate[]> {
    return this.http.get<Rate[]>(`${this.apiUrl}/history`);
  }
}

