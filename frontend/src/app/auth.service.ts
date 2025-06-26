import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public currentUsername: string | null = null;

  setCurrentUsername(username: string) {
    this.currentUsername = username;
  }

  getCurrentUsername(): string | null {
    return this.currentUsername;
  }

  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {
  }

  login(username: string, password: string) {
    const body = {username, password};
    return this.http.post(`${this.baseUrl}/api/login`, body);
  }

  signUp(username: string, password: string) {
    const body = {username, password};
    return this.http.post(`${this.baseUrl}/api/signup`, body);
  }

  query() {
    return this.http.get(`${this.baseUrl}/api/query`);
  }

  searchone(id: string) {
    const body = {id};
    return this.http.post(`${this.baseUrl}/api/searchone`, body);
  }

  uploadone(Description: any, Country_Code: any, length_of_encounter_seconds: any, Encounter_Duration: any, Date_time: any, Year: any, Month: any, Hour: any, Season: any, Country: any, Region: any, Locale: any, latitude: any, longitude: any, UFO_shape: any) {
    const body = {
      Description: Description,
      Country_Code: Country_Code,
      length_of_encounter_seconds: length_of_encounter_seconds,
      Encounter_Duration: Encounter_Duration,
      Date_time: Date_time,
      Year: Year,
      Month: Month,
      Hour: Hour,
      Season: Season,
      Country: Country,
      Region: Region,
      Locale: Locale,
      latitude: latitude,
      longitude: longitude,
      UFO_shape: UFO_shape
    };
    return this.http.post(`${this.baseUrl}/api/uploadone`, body);
  }

  deleteone(id: string) {
    const body = {id};
    return this.http.post(`${this.baseUrl}/api/deleteone`, body);
  }



  private apiUrl = 'http://localhost:9980';
  public username: string  = '';
  public rowData: any;
  getUsername(): string  {
    return this.username;
  }

  setUsername(username: string): void {
    this.username = username;
  }
  getUniqueValues(): Observable<any> {
    return this.http.get(`${this.apiUrl}/geo.php?action=get-unique-values`); // 后端接口路径
  }

  searchData(searchParams: any, headers: HttpHeaders): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/geo.php?action=search-data`, searchParams, { headers: headers });
  }

  authenticate(credentials: { usr: string, pwd: string }): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.apiUrl}/user.php`, credentials, { headers });
  }

  changePassword(username: string , currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password.php`, { username,currentPassword, newPassword });
  }

  deleteData(rowId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.delete<any>(`${this.apiUrl}/delete-row.php?id=${rowId}`, { headers });
  }


  setRowData(row: any) {
    this.rowData = row;
  }

  getRowData() {
    return this.rowData;
  }
}
