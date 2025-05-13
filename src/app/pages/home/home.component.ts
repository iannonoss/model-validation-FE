import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SharedService} from '../../services/shared.service';
import {catchError, Subscription, switchMap, tap, throwError} from 'rxjs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {GeneralInfoComponent} from '../../components/general-info/general-info.component';
import {GeneralInformation} from '../../models/general-information.model';
import {PreprocessingDataRequest} from '../../components/general-info/preprocessing-data-request.model';
import {ResultsComponent} from '../../components/results/results.component';
import {AgGridAngular} from 'ag-grid-angular';
import {AllCommunityModule, ColDef, ModuleRegistry} from 'ag-grid-community';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NgClass, NgForOf} from '@angular/common';
import {HttpClient} from '@angular/common/http';

ModuleRegistry.registerModules([AllCommunityModule]);

interface ColValue {
  value: boolean;
  label: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatButtonModule,
    GeneralInfoComponent,
    ResultsComponent,
    AgGridAngular,
    MatProgressSpinner,
    NgForOf,
    NgClass
  ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {

  public fileName: string | undefined;
  public fileSize: string | undefined;
  public columns: Array<ColValue> = [];
  public columnDefs: ColDef[] | undefined;
  public independentVars: string[] = [];
  public dependentVar: string | undefined;
  public selectedModel: string | undefined;
  public models = ['Random Forest', 'SVM', 'XGBoost', 'Neural Network'];
  public loading = false;
  public horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  public verticalPosition: MatSnackBarVerticalPosition = 'top';
  public previewData: any[] = [];
  public selectedSplit: number = 0.2;
  public randomState: number = 42;
  public trainData: any[] | undefined;
  public testData: any[] | undefined;
  public geminiSuggestion: any = null;
  public defaultColDef: ColDef = {flex: 1};
  sampleFiles = [
    {name: 'Purchase Propensity Model', path: 'Social_Network_Ads.csv', mode: 'easy'},
    {name: 'Titanic Survival Prediction', path: 'complete_titanic.csv', mode: 'medium'},
    {name: 'Heart Disease Dataset', path: 'heart.csv', mode: 'medium'},
    {name: 'Wine Quality', path: 'WineQT.csv', mode: 'medium'},
  ];
  public generalInformation: GeneralInformation | undefined;
  private subscriptions: Array<Subscription> = [];
  private _snackBar = inject(MatSnackBar);

  constructor(private sharedService: SharedService,
              private cdr: ChangeDetectorRef,
              private http: HttpClient) {
  }

  public openSnackBar(message: string): void {
    this._snackBar.open(message, 'x', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    })
  }

  public loadSampleFile(fileMeta: any) {
    this.http.get(fileMeta.path, { responseType: 'text' }).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'text/csv' });
        const fakeFile = new File([blob], fileMeta.name, { type: 'text/csv' });
        const event = {
          target: {
            files: [fakeFile]
          }
        };
        this.onFileSelected(event);
      },
      error: (err) => {
        console.error('Errore nel caricamento del file:', err);
      }
    });
  }

  public onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.fileSize = this.formatFileSize(file.size);
      this.extractColumns(file);
      this.uploadFile(file);
    }
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  public onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.fileName = file.name;
      this.fileSize = this.formatFileSize(file.size);
      this.extractColumns(file);
      this.uploadFile(file);
    }
  }

  public extractColumns(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const lines = text.split('\n');
      this.columns = lines[0].split(',').map(col => ({
        label: col.trim(),
        value: false
      }));
      this.columnDefs = this.columns.map(col => ({field: col.label}));
    };
    reader.readAsText(file);
  }

  public toggleIndependentVar(column: ColValue, event: any) {
    console.log(event);
    if (event?.target?.checked) {
      this.independentVars.push(column.label);
    } else {
      this.independentVars = this.independentVars.filter(varName => varName !== column.label);
    }
  }

  public processDataAndComputeModelOperation(): void {
    const request = PreprocessingDataRequest.buildPreprocessingRequest(this.selectedSplit, this.randomState, this.dependentVar, this.independentVars);
    this.loading = true;
    const sb = this.sharedService.preprocessData(request).pipe(
      switchMap(_preprocessingData => {
        return this.sharedService.transformData();
      }),
      tap(res => {
        this.trainData = res.train_preview;
        this.testData = res?.valid_preview;
        setTimeout(() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'}), 5);
        this.loading = false;
      }),
      catchError(err => {
        console.log(err);
        this.loading = false;
        this.openSnackBar('Si è verificato un errore durante la comunicazione con il server. Riprova più tardi.')
        return throwError(err);
      })
    ).subscribe()
    this.subscriptions.push(sb);

  }

  public uploadFile(file: File) {
    this.loading = true;
    const sb = this.sharedService.uploadCSV(file).pipe(
      switchMap(res => {
        this.setGeneralInformation(res);
        this.previewData = res?.preview_data;
        return this.sharedService.suggestFeatures();
      }),
      tap(res => {
        this.geminiSuggestion = res.suggestion;
        this.loading = false;
      }),
      catchError(err => {
        console.log(err);
        this.loading = false;
        this.openSnackBar('Si è verificato un errore durante la comunicazione con il server. Riprova più tardi.')
        return throwError(err);
      })
    ).subscribe()
    this.subscriptions.push(sb);
  }


  private formatFileSize(size: number): string {
    if (size < 1024) {
      return size + ' B'; // Byte
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB'; // Kilobyte
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + ' MB'; // Megabyte
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'; // Gigabyte
    }
  }

  private setGeneralInformation(res: any) {
    const newGeneralInformation = new GeneralInformation()
    newGeneralInformation.fileName = this.fileName;
    newGeneralInformation.fileSize = this.fileSize;
    newGeneralInformation.columns = this.columns.map(el => el.label);
    newGeneralInformation.missingValues = res?.missing_values;
    newGeneralInformation.categoricalCols = res?.categorical_cols;
    newGeneralInformation.numericalCols = res?.numerical_cols;
    this.generalInformation = newGeneralInformation;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public applyGeminiSuggestions(): void {
    if (this.geminiSuggestion) {
      this.dependentVar = this.geminiSuggestion?.target;
      this.geminiSuggestion.independent_features?.forEach((item: string) => {
        const column = this.columns?.find(el => el.label === item);
        if (column) {
          column.value = true;
        }
      });
      this.independentVars = this.geminiSuggestion.independent_features;
    }
    this.cdr.detectChanges();
  }

  public setLoading(event: boolean) {
    this.loading = event;
  }

  public resetData(): void {
    this.loading = true;
    const sb = this.sharedService.reset_data().pipe(
      tap( _ => {
        this.fileName = undefined;
        this.fileSize = undefined;
        this.columns = [];
        this.columnDefs = undefined;
        this.independentVars = [];
        this.dependentVar = undefined;
        this.selectedModel = undefined;
        this.previewData = [];
        this.trainData = undefined;
        this.testData = undefined;
        this.geminiSuggestion = null;
        this.generalInformation = undefined;
        this.loading = false;
        this.cdr.detectChanges();
        this.openSnackBar("Reset completato ✅");
      }),
      catchError(err => {
        console.error("Errore durante il reset:", err);
        this.loading = false;
        this.openSnackBar("Errore durante il reset. Riprova.");
        return throwError(err);
      })
    ).subscribe();

    this.subscriptions.push(sb);
  }
}
