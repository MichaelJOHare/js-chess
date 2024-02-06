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

  handlePreviousMoveButtonClick() {
    this.gameController.handlePreviousMoveButtonClick();
  }

  handleNextMoveButtonClick() {
    return this.gameController.handleNextMoveButtonClick();
  }

  writeCurrentFENString() {
    const currentFENString = this.gameController.generateCurrentFEN();
    this.chessBoardPanel.writeCurrentFENString(currentFENString);
  }

  handleFENImport(fenString) {
    this.gameController.initiateGameFromFEN(fenString);
  }

  handlePawnPromotion(move, callback) {
    this.chessBoardPanel.showPromotionSelector(move, callback);
  }

  setHighlightedSquares(moves) {
    this.chessBoardPanel.drawHighlightedSquares(moves);
  }

  setHighlightedSquaresPreviousMove(move) {
    this.chessBoardPanel.clearPreviousMoveHighlights();
    this.chessBoardPanel.drawPreviousMoveHighlightedSquares(move);
  }

  setKingCheckHighlightedSquare(square) {
    this.chessBoardPanel.drawKingCheckHighlightedSquare(square);
  }

  clearHighlightedSquares() {
    this.chessBoardPanel.clearHighlights();
    this.chessBoardPanel.clearPreviousMoveHighlights();
  }

  clearKingCheckHighlightedSquare(square) {
    this.chessBoardPanel.clearKingCheckHighlightedSquare(square);
  }

  updateGUI() {
    this.writeCurrentFENString();
    this.chessBoardPanel.drawBoard();
  }
}

export default GUIController;
