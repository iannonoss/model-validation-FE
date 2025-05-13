export class CrossValidateRequest {
  model_selected: string;
  validation_type: string;
  folds: number;

  constructor(model_selected: string, validation_type: string, folds: number) {
    this.model_selected = model_selected;
    this.validation_type = validation_type;
    this.folds = folds;
  }
}
