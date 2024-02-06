import Move from "../../moves/Move.js";
import MovementStrategy from "./MovementStrategy.js";

class BaseMovementStrategy extends MovementStrategy {
  calculateLegalMoves(board, piece, moveHistory) {
    const rawLegalMoves = this.calculateRawLegalMoves(
      board,
      piece,
      moveHistory
    );
    const legalMoves = [];

    for (const move of rawLegalMoves) {
      if (!this.wouldResultInCheck(board, piece, moveHistory, move)) {
        legalMoves.push(move);
      }
    }
    return legalMoves;
  }

  wouldResultInCheck(board, piece, moveHistory, move) {
    const copiedBoard = board.copy();
    const copiedMoveHistory = moveHistory.copy();
    const copiedPiece = piece.copy();
    const copiedCapturedPiece = move.getCapturedPiece()
      ? move.getCapturedPiece().copy()
      : null;
    const copiedPlayer = copiedPiece.getPlayer();

    const copiedMove = new Move(
      copiedPiece,
      move.getStartSquare(),
      move.getEndSquare(),
      copiedCapturedPiece,
      copiedBoard
    );

    copiedMoveHistory.makeMove(copiedMove);
    copiedBoard.initializePieceManager();

    return copiedBoard.isKingInCheck(
      copiedPlayer,
      copiedMoveHistory,
      copiedBoard
    );
  }

  calculateRawLegalMoves(board, piece, moveHistory) {
    throw new Error("calculateRawLegalMoves must be implemented by subclasses");
  }
}

export default BaseMovementStrategy;
