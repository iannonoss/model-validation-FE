export class PreprocessingDataRequest {
  split_type?: string;
  random_state?: number;
  target?: string;
  features?: Array<string>;
  test_size?: number;

  constructor(split_type?: string, random_state?: number, target?: string, features?: Array<string>, test_size?: number) {
    this.split_type = split_type;
    this.random_state = random_state;
    this.target = target;
    this.features = features;
    this.test_size = test_size;
  }

  public static buildPreprocessingRequest(splitType: string, randomState: number, target: string | undefined, features: string[]): PreprocessingDataRequest {
    const preprocessingDataRequest = new PreprocessingDataRequest();
    preprocessingDataRequest.split_type = splitType;
    preprocessingDataRequest.random_state = randomState;
    preprocessingDataRequest.target = target;
    preprocessingDataRequest.features = features;
    // @ts-ignore
    preprocessingDataRequest.test_size = this.getTestSize(splitType)
    return preprocessingDataRequest;
  }

  public static getTestSize(splitType: string): number | undefined | null {
    if (splitType === "holdout" || splitType === "stratified") return 0.2; // 80-20
    if (splitType === "kfold" || splitType === "stratified_kfold") return 1 / 5; // K=5 → test_size = 20%
    if (splitType === "loo") return null; // LOO non usa test_size
    return 0.2; // Default
  }
}
