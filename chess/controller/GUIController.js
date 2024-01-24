import ChessBoardPanel from "../view/ChessBoardPanel.js";

class GUIController {
  constructor(board, gameController) {
    this.chessBoardPanel = new ChessBoardPanel(board);
    this.chessBoardPanel.init(this);
    this.gameController = gameController;
  }

  handleSquareClick(row, col) {
    this.gameController.handleClickToMove(row, col);
  }

  handleDragStart(row, col) {
    this.gameController.handleDragStart(row, col);
  }

  handleDragDrop(row, col) {
    this.gameController.handleDragDrop(row, col);
  }

  setHighlightedSquares(moves) {
    this.chessBoardPanel.drawHighlightedSquares(moves);
  }

  clearHighlightedSquares() {
    this.chessBoardPanel.clearHighlights();
  }

  updateGUI() {
    this.chessBoardPanel.drawBoard();
  }
}

export default GUIController;
