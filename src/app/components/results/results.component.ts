import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {catchError, Subscription, switchMap, tap, throwError} from 'rxjs';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef} from 'ag-grid-community';
import {CrossValidateRequest} from '../../models/cross-validate-request.model';
import {CrossValidateResult} from '../../models/cross-validate-result.model';
import {FormsModule} from '@angular/forms';
import {DecimalPipe, JsonPipe, NgClass, NgIf, PercentPipe} from '@angular/common';


export class NewPrediction {
  prediction: string;
  probability_class_1: number;
  probability_class_0: number;


  constructor(prediction: string, probability_class_1: number, probability_class_0: number) {
    this.prediction = prediction;
    this.probability_class_1 = probability_class_1;
    this.probability_class_0 = probability_class_0;
  }
}

@Component({
  selector: 'app-results',
  imports: [
    AgGridAngular,
    FormsModule,
    DecimalPipe,
    JsonPipe,
    NgClass,
    PercentPipe,
    NgIf
  ],
  templateUrl: './results.component.html',
  standalone: true,
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnChanges {
  @Input() columns: ColDef[] | undefined
  @Input() trainData: any[] | undefined;
  @Input() testData: any[] | undefined;
  @Input() modelSelected: string | undefined;
  @Input() independentVars: Array<string> | undefined;
  @Output() loading: EventEmitter<boolean> = new EventEmitter();

  public crossValidateResult: CrossValidateResult | undefined;
  public loadingValidation: boolean | undefined;
  public result: any;
  public selectedValidation: string | undefined;
  public validations: Array<string> = ['k-fold', 'stratified-k-fold', 'loocv']
  public defaultColDef: ColDef = {
    flex: 1,
  };
  public isLoading: boolean = false;
  public showRawResults: boolean = true;
  public numberOfFolds: number = 5;
  public tableViewMode: 'split' | 'train' | 'test' = 'split';
  public dynamicColumnDefs: ColDef[] = [];
  public dynamicRowData: any[] = [];
  public newPrediction: NewPrediction | undefined;
  private subscriptions: Array<Subscription> = [];

  constructor(private sharedService: SharedService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.columns = changes?.['columns']?.currentValue ?? this.columns;
    this.trainData = changes?.['trainData']?.currentValue ?? this.trainData;
    this.testData = changes?.['testData']?.currentValue ?? this.testData;
    this.modelSelected = changes?.['modelSelected']?.currentValue ?? this.modelSelected;
    this.independentVars = changes?.['independentVars']?.currentValue ?? this.independentVars;
    if (changes?.['independentVars']?.currentValue) {
      this.dynamicColumnDefs = this.independentVars?.map(col => ({
        field: col,
        editable: true,
        headerName: col,
        resizable: true
      })) as Array<ColDef>;

      const emptyRow = this.independentVars?.reduce((acc, col) => {
        acc[col] = '';
        return acc;
      }, {} as Record<string, any>);

      this.dynamicRowData = [emptyRow];
    }
    if (!changes?.['trainData']?.currentValue && !changes?.['testData']?.currentValue) {
      this.trainData = undefined;
      this.testData = undefined;
    }
  }

  public runValidationProcess() {
    this.loading.emit(true);
    this.isLoading = true;
    this.loadingValidation = true;
    this.sharedService.predictResult(this.modelSelected).pipe(
      switchMap(result => {
        this.result = result
        const newCrossValidateRequest = new CrossValidateRequest(this.modelSelected as string, this.selectedValidation as string, this.numberOfFolds);
        setTimeout(() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'}), 5);
        this.loading.emit(false);
        this.isLoading = false;
        return this.sharedService.cross_validation(newCrossValidateRequest);
      }),
      tap(result => {
        this.crossValidateResult = result;
        this.loadingValidation = false;
      }),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    ).subscribe();
  }

  public toggleRawResults() {
    this.showRawResults = !this.showRawResults;
  }

  public setTableViewMode(mode: 'split' | 'train' | 'test'): void {
    this.tableViewMode = mode;
   }

  public submitInstance(): void {
    const instance = this.dynamicRowData[0];
    const sb = this.sharedService.predictInstance(instance).pipe(
      tap(response => this.newPrediction = response)
    ).subscribe();
    this.subscriptions.push(sb)
  }

  get probability1(): number {
    return this.newPrediction?.probability_class_1 ?? 0;
  }

  get probability0(): number {
    return this.newPrediction?.probability_class_0 ?? 0;
  }
}
