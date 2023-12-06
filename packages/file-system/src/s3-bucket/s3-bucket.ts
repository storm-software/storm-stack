export class S3Bucket {
  private storage = new WeakMap();

  constructor(public name: string) {
    this.name = "S3Bucket";
  }

  get() {
    return this.name;
  }
}
