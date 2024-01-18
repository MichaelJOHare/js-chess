import ChessBoardPanel from "../view/ChessBoardPanel.js";

class GUIController {
  constructor(board, gameController) {
    this.chessBoardPanel = new ChessBoardPanel(board);
    this.chessBoardPanel.init(this);
    this.gameController = gameController;
  }

  handleSquareClick(event, row, col) {
    this.gameController.handleClickToMove(row, col);
  }

  updateGUI() {
    this.chessBoardPanel.drawBoard();
  }
}

export default GUIController;
