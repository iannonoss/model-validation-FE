import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PreprocessingDataRequest} from '../components/general-info/preprocessing-data-request.model';
import {CrossValidateRequest} from '../models/cross-validate-request.model';
import {NewPrediction} from '../components/results/results.component';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private baseUrl = 'http://127.0.0.1:8000'

  constructor(private http: HttpClient) {
  }

  public uploadCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders();
    return this.http.post(`${this.baseUrl}/upload_csv`, formData, {headers});
  }

  public suggestFeatures(): Observable<any> {
    return this.http.get(`${this.baseUrl}/suggest_features`);
  }

  public preprocessData(requestData: PreprocessingDataRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/preprocess_data`, requestData);
  }

  public transformData(): Observable<any> {
    return this.http.post(`${this.baseUrl}/transform_data`, {});
  }

  public predictResult(modelSelected: string | undefined): Observable<any> {
    return this.http.get(`${this.baseUrl}/predict?model_selected=${modelSelected}`);
  }

  public cross_validation(modelSelected: CrossValidateRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/cross_validate`, modelSelected);
  }

  public reset_data(): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.baseUrl}/reset_data`, {});
  }

  public predictInstance(instance: any): Observable<NewPrediction> {
    return this.http.post<NewPrediction>('http://localhost:8000/predict_instance', {
      instance: instance
    });
  }
}
