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

  public static buildPreprocessingRequest(splitType: number, randomState: number, target: string | undefined, features: string[]): PreprocessingDataRequest {
    const preprocessingDataRequest = new PreprocessingDataRequest();
    preprocessingDataRequest.split_type = splitType.toString();
    preprocessingDataRequest.random_state = randomState;
    preprocessingDataRequest.target = target;
    preprocessingDataRequest.features = features;
    preprocessingDataRequest.test_size = splitType
    return preprocessingDataRequest;
  }
}
