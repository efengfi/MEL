import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private excelURL = 'assets/Data.xlsx';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return new Observable(observer => {
      this.http.get(this.excelURL, { responseType: 'blob' }).subscribe(blob => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array((event.target as any).result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'YYYY-MM-DD' });
          observer.next(json);
          observer.complete();
        };
        reader.readAsArrayBuffer(blob);
      });
    });
  }
}
