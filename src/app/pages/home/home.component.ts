import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SharedService} from '../../services/shared.service';
import {catchError, Subscription, tap, throwError} from 'rxjs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatButtonModule,
  ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public fileName: string | null = null;
  public fileSize: string | null = null;
  public columns: string[] = [];
  public independentVars: string[] = [];
  public dependentVar: string | null = null;
  public selectedModel: string | null = null;
  public models = ['Random Forest', 'SVM', 'XGBoost', 'Neural Network'];
  public loading = false;
  public horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  public verticalPosition: MatSnackBarVerticalPosition = 'top';
  public missingValues: Record<string, number> = {};
  public categoricalCols: string[] = []; // Colonne categoriali
  public numericalCols: string[] = [];
  previewData: any[] = [];
  public selectedSplit: string = "holdout"; // Default: Holdout
  public randomState: number = 42;
  private subscriptions: Array<Subscription> = [];
  private _snackBar = inject(MatSnackBar);

  constructor(private sharedService: SharedService) {
  }

  public openSnackBar(message: string): void {
    this._snackBar.open(message, 'x',{
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

  public uploadFile(file: File) {
    this.loading = true;
    const sb = this.sharedService.uploadCSV(file).pipe(
      tap(res => {
        console.log(res);
        this.loading = false;
        this.missingValues = res?.missing_values;
        this.categoricalCols = res?.categorical_cols;
        this.numericalCols = res?.numerical_cols;
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

  protected readonly Object = Object;
}
