class Square {
  #row;
  #col;
  #legendLetter = ["a", "b", "c", "d", "e", "f", "g", "h"];
  #legendNumber = ["8", "7", "6", "5", "4", "3", "2", "1"];

  constructor(row, col) {
    this.#row = row;
    this.#col = col;
  }

  getRow() {
    return this.#row;
  }

  getCol() {
    return this.#col;
  }

  equals(o) {
    if (o instanceof Square) {
      const square = o;
      return square.#row === this.#row && square.#col === this.#col;
    }
    return false;
  }

  toString() {
    return this.#legendLetter[this.#col] + this.#legendNumber[this.#row];
  }
}

export default Square;
