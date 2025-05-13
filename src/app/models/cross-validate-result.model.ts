export class AverageMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  fit_time_mean: number;
  score_time_mean: number;

  constructor(
    accuracy: number,
    precision: number,
    recall: number,
    f1_score: number,
    roc_auc: number,
    fit_time_mean: number,
    score_time_mean: number
  ) {
    this.accuracy = accuracy;
    this.precision = precision;
    this.recall = recall;
    this.f1_score = f1_score;
    this.roc_auc = roc_auc;
    this.fit_time_mean = fit_time_mean;
    this.score_time_mean = score_time_mean;
  }
}

export class CrossValidateResult {
  model_selected: string;
  validation_type: string;
  folds: number;
  average_metrics?: AverageMetrics;
  std_dev_metrics: any;
  all_fold_results: any;

  constructor(
    model_selected: string,
    validation_type: string,
    folds: number,
    average_metrics: AverageMetrics
  ) {
    this.model_selected = model_selected;
    this.validation_type = validation_type;
    this.folds = folds;
    this.average_metrics = average_metrics;
  }
}
