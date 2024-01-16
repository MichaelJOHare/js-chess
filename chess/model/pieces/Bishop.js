import ChessPiece from "./ChessPiece";
import PieceType from "../pieces/PieceType";
import BishopMovementStrategy from "./movementstrategy/BishopMovementStrategy";

class Bishop extends ChessPiece {
  static WHITE_BISHOP = "♝";
  static BLACK_BISHOP = "♗";

  constructor(currentSquare, player) {
    super(
      currentSquare,
      player,
      PieceType.BISHOP,
      new BishopMovementStrategy()
    );
  }

  getWhiteChessPieceSymbol() {
    return Bishop.WHITE_BISHOP;
  }

  getBlackChessPieceSymbol() {
    return Bishop.BLACK_BISHOP;
  }
}

export default Bishop;
