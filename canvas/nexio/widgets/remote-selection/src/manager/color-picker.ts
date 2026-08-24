class RandomPicker<T> {
  private _copyArray: T[];

  private readonly _originalArray: T[];

  constructor(array: T[]) {
    this._originalArray = [...array];
    this._copyArray = [...array];
  }

  private randomIndex(max: number): number {
    return Math.floor(Math.random() * max);
  }

  pick(): T {
    if (this._copyArray.length === 0) {
      this._copyArray = [...this._originalArray];
    }

    const index = this.randomIndex(this._copyArray.length);
    const item = this._copyArray[index];
    this._copyArray.splice(index, 1);
    return item;
  }
}

export const multiPlayersColor = new RandomPicker([
  'var(--nexio-multi-players-purple)',
  'var(--nexio-multi-players-magenta)',
  'var(--nexio-multi-players-red)',
  'var(--nexio-multi-players-orange)',
  'var(--nexio-multi-players-green)',
  'var(--nexio-multi-players-blue)',
  'var(--nexio-multi-players-brown)',
  'var(--nexio-multi-players-grey)',
]);
