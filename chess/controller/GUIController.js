import ChessBoardPanel from "../view/ChessBoardPanel.js";

class GUIController {
  constructor(board, gameController) {
    this.chessBoardPanel = new ChessBoardPanel(board);
    this.chessBoardPanel.init(this);
  }

  handleSquareClick(event, row, col) {
    console.log(`Square clicked: Row ${row}, Col ${col}`);
  }
}

export default GUIController;
