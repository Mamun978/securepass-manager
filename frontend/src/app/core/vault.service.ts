import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, VaultItem, VaultPayload } from './models';

@Injectable({ providedIn: 'root' })
export class VaultService {
  constructor(private http: HttpClient) {}

  list(query = ''): Observable<ApiResponse<VaultItem[]>> {
    let params = new HttpParams();
    if (query.trim()) {
      params = params.set('q', query.trim());
    }
    return this.http.get<ApiResponse<VaultItem[]>>(`${environment.apiUrl}/vault`, { params });
  }

  get(id: string, reveal = false): Observable<ApiResponse<VaultItem>> {
    return this.http.get<ApiResponse<VaultItem>>(`${environment.apiUrl}/vault/${id}`, {
      params: new HttpParams().set('reveal', reveal)
    });
  }

  create(payload: VaultPayload): Observable<ApiResponse<VaultItem>> {
    return this.http.post<ApiResponse<VaultItem>>(`${environment.apiUrl}/vault`, payload);
  }

  update(id: string, payload: VaultPayload): Observable<ApiResponse<VaultItem>> {
    return this.http.put<ApiResponse<VaultItem>>(`${environment.apiUrl}/vault/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/vault/${id}`);
  }
}
