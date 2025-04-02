import {Component, inject, OnDestroy} from '@angular/core';
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


ModuleRegistry.registerModules([AllCommunityModule]);


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
    AgGridAngular
  ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {

  public fileName: string | undefined;
  public fileSize: string | undefined;
  public columns: string[] = [];
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
  public defaultColDef: ColDef = {
    flex: 1,
  };
  public generalInformation: GeneralInformation | undefined;
  private subscriptions: Array<Subscription> = [];
  private _snackBar = inject(MatSnackBar);

  constructor(private sharedService: SharedService) {
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
      this.columns = lines[0].split(',').map(col => col.trim());
      this.columnDefs = this.columns.map(col => ({ field: col }));
    };
    reader.readAsText(file);
  }

  public toggleIndependentVar(column: string, event: any) {
    if (event.target.checked) {
      this.independentVars.push(column);
    } else {
      this.independentVars = this.independentVars.filter(varName => varName !== column);
    }
  }

  public processDataAndComputeModelOperation(): void {
    console.log(this.selectedSplit);
    const request = PreprocessingDataRequest.buildPreprocessingRequest(this.selectedSplit, this.randomState, this.dependentVar, this.independentVars);
    this.loading = true;
    const sb = this.sharedService.preprocessData(request).pipe(
      switchMap(preprocessingData => {
        return this.sharedService.transformData();
      }),
      tap(res => {
        this.trainData = res.train_preview;
        this.testData = res?.valid_preview;
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
      tap(res => {
        this.loading = false;
        this.setGeneralInformation(res);
        this.previewData = res?.preview_data;
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
    newGeneralInformation.columns = this.columns;
    newGeneralInformation.missingValues = res?.missing_values;
    newGeneralInformation.categoricalCols = res?.categorical_cols;
    newGeneralInformation.numericalCols = res?.numerical_cols;
    this.generalInformation = newGeneralInformation;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
