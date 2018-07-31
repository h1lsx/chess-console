/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Chessboard, COLOR, MOVE_INPUT_MODE} from "../../../cm-chessboard/Chessboard.js"
import {MESSAGE} from "../../ChessConsole.js"
import {Observe} from "../../../svjs-observe/Observe.js"
import {Component} from "../../../svjs-app/Component.js"

export const MARKER_TYPE = {
    lastMove: {class: "last-move", slice: "marker1"},
    check: {class: "check", slice: "marker2"},
    wrongMove: {class: "wrong-move", slice: "marker1"}
}


export class Board extends Component {

    constructor(module, props) {
        super(module, props)
        this.initialization = new Promise((resolve) => {
            module.board = this
            this.state = module.state
            this.elements = {
                playerTop: document.createElement("div"),
                playerBottom: document.createElement("div"),
                chessboard: document.createElement("div")
            }
            this.elements.playerTop.setAttribute("class", "player top")
            this.elements.playerBottom.setAttribute("class", "player bottom")
            this.elements.chessboard.setAttribute("class", "chessboard")
            module.componentContainers.board.appendChild(this.elements.playerTop)
            module.componentContainers.board.appendChild(this.elements.chessboard)
            module.componentContainers.board.appendChild(this.elements.playerBottom)
            this.resize()
            module.messageBroker.subscribe(MESSAGE.legalMove, () => {
                this.setPositionOfPlyViewed()
                this.markLastMove()
            })
            /*
            this.state.observeChess((params) => {
                let animated = true
                if (params.functionName === "load_pgn") {
                    animated = false
                }
                this.setPositionOfPlyViewed(animated)
                this.markLastMove()
            })
            */
            Observe.property(this.state, "plyViewed", () => {
                this.setPositionOfPlyViewed()
                this.markLastMove()
            })
            this.chessboard = new Chessboard(this.elements.chessboard, {
                responsive: true,
                position: "empty",
                moveInputMode: MOVE_INPUT_MODE.dragPiece,
                sprite: {
                    url: module.props.assetsFolder + "/img/chessboard-sprite.svg", // pieces and markers
                }
            })
            this.chessboard.initialization.then(() => {
                this.module.messageBroker.subscribe(MESSAGE.illegalMove, (message) => {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            this.chessboard.addMarker(message.move.from, MARKER_TYPE.wrongMove)
                            this.chessboard.addMarker(message.move.to, MARKER_TYPE.wrongMove)
                        }, i * 400)
                        setTimeout(() => {
                            this.chessboard.removeMarkers(null, MARKER_TYPE.wrongMove)
                        }, i * 400 + 200)
                    }
                })
                this.setPositionOfPlyViewed(false)
                window.addEventListener("resize", () => {
                    this.resize()
                })
                Observe.property(module.state, "orientation", () => {
                    this.setPlayerNames()
                    this.chessboard.setOrientation(module.state.orientation)
                    this.markPlayerToMove()
                })
                module.messageBroker.subscribe(MESSAGE.moveRequest, () => {
                    this.markPlayerToMove()
                })
                this.setPlayerNames()
                this.markPlayerToMove()
                resolve()
            })
        })
    }

    resize() {
        const width = this.elements.chessboard.offsetWidth
        this.elements.chessboard.style.height = (width * 0.94) + "px"
    }

    setPositionOfPlyViewed(animated = true) {
        clearTimeout(this.setPositionOfPlyViewedDebounced)
        this.setPositionOfPlyViewedDebounced = setTimeout(() => {
            const from = this.chessboard.getPosition()
            const to = this.state.fenOfPly(this.state.plyViewed)
            // console.log("setPosition", from, "=>", to)
            this.chessboard.setPosition(to, animated)
        })
    }

    markLastMove() {
        window.clearTimeout(this.markLastMoveDebounce)
        this.markLastMoveDebounce = setTimeout(() => {
            this.chessboard.removeMarkers(null, MARKER_TYPE.lastMove)
            this.chessboard.removeMarkers(null, MARKER_TYPE.check)
            if (this.state.plyViewed === this.state.plyCount()) {
                const lastMove = this.state.lastMove()
                if (lastMove) {
                    this.chessboard.addMarker(lastMove.from, MARKER_TYPE.lastMove)
                    this.chessboard.addMarker(lastMove.to, MARKER_TYPE.lastMove)
                }
                if (this.state.chess.in_check() || this.state.chess.in_checkmate()) {
                    const kingSquare = this.state.pieces("k", this.state.chess.turn())[0]
                    this.chessboard.addMarker(kingSquare.square, MARKER_TYPE.check)
                }
            }
        })
    }

    setPlayerNames() {
        if(this.module.state.gameStarted) {
            if (this.module.state.orientation === COLOR.white) {
                this.elements.playerBottom.innerHTML = this.module.player.name
                this.elements.playerTop.innerHTML = this.module.opponent.name
            } else {
                this.elements.playerBottom.innerHTML = this.module.opponent.name
                this.elements.playerTop.innerHTML = this.module.player.name
            }
        } else {
            this.elements.playerTop.innerHTML = "&nbsp;"
            this.elements.playerBottom.innerHTML = "&nbsp;"
        }
    }

    markPlayerToMove() {
        if(this.module.state.gameStarted && !this.module.state.gameFinished) {
            clearTimeout(this.markPlayerToMoveDebounce)
            this.markPlayerToMoveDebounce = setTimeout(() => {
                this.elements.playerTop.classList.remove("to-move")
                this.elements.playerBottom.classList.remove("to-move")
                const playerMove = this.module.playerToMove()
                if (
                    this.module.state.orientation === COLOR.white &&
                    playerMove === this.module.playerWhite() ||
                    this.module.state.orientation === COLOR.black &&
                    playerMove === this.module.playerBlack()) {
                    this.elements.playerBottom.classList.add("to-move")
                } else {
                    this.elements.playerTop.classList.add("to-move")
                }
            }, 10)
        }
    }

}