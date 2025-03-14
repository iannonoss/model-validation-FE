export class GeneralInformation {

  fileName?: string;
  fileSize?: string;
  columns?: string[] ;
  missingValues?: Record<string, number>;
  categoricalCols?: string[] ;
  numericalCols?: string[] ;

  constructor(fileName?: string, fileSize?: string , columns?: string[], missingValues?: Record<string, number>,
              categoricalCols?: string[], numericalCols?: string[]) {
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.columns = columns;
    this.missingValues = missingValues;
    this.categoricalCols = categoricalCols;
    this.numericalCols = numericalCols;
  }
}
