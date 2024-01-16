class BaseMovementStrategy {
  calculateLegalMoves(board, piece, moveHistory) {
    const rawLegalMoves = this.calculateRawLegalMoves(
      board,
      piece,
      moveHistory
    );
    const legalMoves = [];

    for (const m of rawLegalMoves) {
      if (!this.wouldResultInCheck(board, piece, moveHistory, m)) {
        legalMoves.push(m);
      }
    }
    return legalMoves;
  }
  wouldResultInCheck(board, piece, moveHistory, move) {}

  calculateRawLegalMoves(board, piece, moveHistory) {
    throw new Error("calculateRawLegalMoves must be implemented by subclasses");
  }
}
