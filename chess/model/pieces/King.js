import ChessPiece from "./ChessPiece";
import PieceType from "../pieces/PieceType";
import KingMovementStrategy from "./movementstrategy/KingMovementStrategy";

class King extends ChessPiece {
  static WHITE_KING = "♚";
  static BLACK_KING = "♔";
  #hasMoved;

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.KING, new KingMovementStrategy());
    this.#hasMoved = false;
  }

  hasMoved() {
    return this.#hasMoved;
  }

  setHasMoved(hasMoved) {
    this.#hasMoved = hasMoved;
  }

  getWhiteChessPieceSymbol() {
    return King.WHITE_KING;
  }

  getBlackChessPieceSymbol() {
    return King.BLACK_KING;
  }
}

export default King;
