import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {catchError, tap, throwError} from 'rxjs';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef} from 'ag-grid-community';

@Component({
  selector: 'app-results',
  imports: [
    AgGridAngular
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

  result: any;
  public defaultColDef: ColDef = {
    flex: 1,
  };

  constructor(private sharedService: SharedService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.columns = changes?.['columns']?.currentValue ?? this.columns;
    this.trainData = changes?.['trainData']?.currentValue ?? this.trainData;
    this.testData = changes?.['testData']?.currentValue ?? this.testData;
    this.modelSelected = changes?.['modelSelected']?.currentValue ?? this.modelSelected;
  }

  public predictResult() {
    this.sharedService.predictResult(this.modelSelected).pipe(
      tap(result => this.result = result),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    ).subscribe();
  }
}
