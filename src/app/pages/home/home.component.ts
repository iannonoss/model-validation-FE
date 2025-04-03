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
import {NgForOf} from '@angular/common';

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
    NgForOf
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
  public selectedSplit: string = "holdout";
  public randomState: number = 42;
  public results: any;
  public trainData: any[] | undefined;
  public testData: any[] | undefined;
  public geminiSuggestion: any = null;
  public defaultColDef: ColDef = {
    flex: 1,
  };
  sampleFiles = [
    {name: 'complete_titanic.csv', path: 'public/complete_titanic.csv'},
  ];
  public generalInformation: GeneralInformation | undefined;
  private subscriptions: Array<Subscription> = [];
  private _snackBar = inject(MatSnackBar);

  constructor(private sharedService: SharedService, private cdr: ChangeDetectorRef) {
  }

  public openSnackBar(message: string): void {
    this._snackBar.open(message, 'x', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    })
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
      switchMap(preprocessingData => {
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

  onSampleDragStart(event: DragEvent, file: any) {
    event.dataTransfer?.setData('text/plain', file.path);
  }

  onDropFile(event: DragEvent) {
    event.preventDefault();
    const path = event.dataTransfer?.getData('text/plain');

    if (path) {
      fetch(path)
        .then(res => res.text())
        .then(csvContent => {
          this.fileName = path.split('/').pop();
        });
    } else {
      // handle manual file drop
    }
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
}
