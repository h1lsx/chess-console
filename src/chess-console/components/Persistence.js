/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../../lib/svjs-app/Component.js"
import {COLOR} from "../../../lib/cm-chesstools/ChessTools.js"
import {MESSAGE} from "../ChessConsole.js"

export class Persistence extends Component {

    constructor(module) {
        super(module)
        this.module.state.observeChess(() => {
            this.save()
        })
        this.module.persistence = this
    }

    load(user) {
        this.prefix = user + "-"
        try {
            if (localStorage.getItem(this.prefix + "playerColor") !== null) {
                this.module.state.playerColor = JSON.parse(localStorage.getItem(this.prefix + "playerColor"))
                this.module.state.orientation = this.module.state.playerColor
            } else {
                console.log("starting new game")
                this.module.startGame({playerColor: COLOR.white})
            }
            if (localStorage.getItem(this.prefix + "pgn") !== null) {
                this.module.state.chess.load_pgn(localStorage.getItem(this.prefix + "pgn"))
                this.module.state.plyViewed = this.module.state.plyCount
            }
            this.module.messageBroker.publish(new MESSAGE.load())
            this.module.nextMove()
        } catch (e) {
            localStorage.clear()
            console.warn(e)
            this.module.startGame({playerColor: COLOR.white})
        }
    }

    save() {
        localStorage.setItem(this.prefix + "playerColor", JSON.stringify(this.module.state.playerColor))
        localStorage.setItem(this.prefix + "pgn", this.module.state.chess.pgn())
    }
}