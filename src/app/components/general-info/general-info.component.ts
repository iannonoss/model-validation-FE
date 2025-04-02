import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import {GeneralInformation} from '../../models/general-information.model';

@Component({
  selector: 'app-general-info',
  standalone: true,
  imports: [CommonModule],
  template: `
      <div>
        <h3>Informazioni Generali</h3>

        @if (generalInfo?.fileName) {
          <p><strong>📄 Nome file:</strong> {{ generalInfo?.fileName }}</p>
        }

        @if (generalInfo?.fileSize) {
          <p><strong>📏 Dimensione:</strong> {{ generalInfo?.fileSize }}</p>
        }

        @if (generalInfo?.columns?.length) {
          <p><strong>🧩 Numero di colonne:</strong> {{ generalInfo?.columns?.length }}</p>
        }

        @if (generalInfo?.missingValues && Object.keys(generalInfo?.missingValues ?? {}).length) {
          <p><strong>❌ Valori Mancanti:</strong></p>
          <ul>
            @for (key of Object.keys(generalInfo?.missingValues ?? {}); track key) {
              <li>{{ key }}: {{ generalInfo?.missingValues?.[key] }}</li>
            }
          </ul>
        } @else {
          <p>✅ Nessun valore mancante nel dataset!</p>
        }

        @if (generalInfo?.categoricalCols?.length) {
          <div class="column-box">
            <h4>🏷️ Colonne Categoriali</h4>
            <div class="badge-container">
              @for (col of generalInfo?.categoricalCols; track col) {
                <span class="badge">{{ col }}</span>
              }
            </div>
          </div>
        }

        @if (generalInfo?.numericalCols?.length) {
          <div class="column-box">
            <h4>📊 Colonne Numeriche</h4>
            <div class="badge-container">
              @for (col of generalInfo?.numericalCols; track col) {
                <span class="badge">{{ col }}</span>
              }
            </div>
          </div>
        }
      </div>
  `,
  styles: `
  .card-max {
    max-height: 100vh !important;
    overflow: scroll;
  }`
})
export class GeneralInfoComponent implements  OnChanges {
  @Input() generalInfo: GeneralInformation | undefined;
  protected readonly Object = Object;

  ngOnChanges(changes: SimpleChanges): void {
    this.generalInfo = changes?.['generalInfo']?.currentValue ?? this.generalInfo;
  }
}
