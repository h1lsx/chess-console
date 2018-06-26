/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {AppModule} from "../svjs-app/AppModule.js"
import {MessageBroker} from "../svjs-message-broker/MessageBroker.js"
import {COLOR} from "../cm-chessboard/Chessboard.js"
import {ChessConsoleState} from "./ChessConsoleState.js"


export const MESSAGE = {
    // gameStarted: function () {},
    /// gameFinished: function () {},
    illegalMove: function illegalMove(player, move) {
        this.player = player
        this.move = move
    },
    moveRequest: function moveRequest(player) {
        this.player = player
    },
    moveDone: function moveDone(player, move) {
        this.player = player
        this.move = move
    }
}

export class ChessConsole extends AppModule {

    constructor(app, container, props) {
        super(app, container, props)
        this.messageBroker = new MessageBroker()
        this.state = new ChessConsoleState()
        this.state.chess.load(props.position)
        this.player = new props.player.type(props.player.name, this)
        this.opponent = new props.opponent.type(props.opponent.name, this)
        const colsetConsoleGame = "col-lg-7 order-lg-2 col-md-8 order-md-1 order-sm-1 col-sm-12 order-sm-1"
        const colsetConsoleControls = "col-lg-3 order-lg-3 col-md-4 order-md-2 col-sm-8 order-sm-3"
        const colsetConsoleStatus = "col-lg-2 order-lg-1 order-md-3 col-sm-4 order-sm-2"
        this.container.innerHTML =
            `<div class="row chess-console">
                <div class="console-board ${colsetConsoleGame}">
                </div>
                <div class="console-controls ${colsetConsoleControls}">
                </div>
                <div class="console-status ${colsetConsoleStatus}">
                </div>
            </div>`
        this.boardContainer = this.container.querySelector(".console-board")
        this.controlsContainer = this.container.querySelector(".console-controls")
        this.statusContainer = this.container.querySelector(".console-status")
        this.nextMove()
    }

    playerWhite() {
        return this.props.playerColor === COLOR.white ? this.player : this.opponent
    }

    playerBlack() {
        return this.props.playerColor === COLOR.white ? this.opponent : this.player
    }

    playerToMove() {
        if (this.state.chess.turn() === "w") {
            return this.playerWhite()
        } else {
            return this.playerBlack()
        }
    }

    opponentOf(player) {
        if (this.player === player) {
            return this.opponent
        } else if (this.opponent === player) {
            return this.player
        } else {
            console.error("player not in game", player)
            return null
        }
    }

    /*
     * - calls `moveRequest()` in next player
     */
    nextMove() {
        const playerToMove = this.playerToMove()
        this.messageBroker.publish(new MESSAGE.moveRequest(playerToMove))
        setTimeout(() => {
            playerToMove.moveRequest(this.state.chess.fen(), (san) => {
                this.moveResponse(san)
            })
        })
    }

    /*
     * - validates move
     * - calls moveDone() in player
     * - requests nextMove
     */
    moveResponse(move) {
        const moveResult = this.state.chess.move(move)
        if (!moveResult) {
            this.messageBroker.publish(new MESSAGE.illegalMove(this.playerToMove(), move))
            return
        }
        if (this.state.plyViewed === this.state.ply - 1) {
            this.state.plyViewed++
        }
        this.opponentOf(this.playerToMove()).moveDone(this.state.lastMove())
        this.messageBroker.publish(new MESSAGE.moveDone(this.opponentOf(this.playerToMove()), move))
        if (!this.state.chess.game_over()) {
            this.nextMove()
        }
    }

}