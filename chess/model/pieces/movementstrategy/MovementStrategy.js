class MovementStrategy {
  calculateLegalMoves(board, piece, move) {
    throw new Error("calculateLegalMoves must be implemented by subclasses");
  }

  calculateRawLegalMoves(board, piece, move) {
    throw new Error("calculateRawLegalMoves must be implemented by subclasses");
  }
}
export default MovementStrategy;
