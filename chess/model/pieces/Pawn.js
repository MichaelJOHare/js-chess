import ChessPiece from "./ChessPiece";
import PieceType from "../pieces/PieceType";
import PawnMovementStrategy from "./movementstrategy/PawnMovementStrategy";

class Pawn extends ChessPiece {
  static WHITE_PAWN = "♙";
  static BLACK_PAWN = "♟";

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.PAWN, new PawnMovementStrategy());
  }

  getWhiteChessPieceSymbol() {
    return Pawn.WHITE_PAWN;
  }

  getBlackChessPieceSymbol() {
    return Pawn.BLACK_PAWN;
  }
}

export default Pawn;
