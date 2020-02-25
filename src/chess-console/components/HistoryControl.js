/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "../../../lib/cm-web-modules/observe/Observe.js"
import {COLOR} from "../../../lib/cm-chessboard/Chessboard.js"
import {Component} from "../../../lib/cm-web-modules/app/Component.js"

export class HistoryControl extends Component {
    constructor(console) {
        super(console)

        this.console = console
        const i18n = console.i18n
        i18n.load({
            de: {
                "to_game_start": "Zum Spielstart",
                "one_move_back": "Ein Zug zurück",
                "one_move_forward": "Ein Zug weiter",
                "to_last_move": "Zum letzen Zug",
                "auto_run": "Automatisch abspielen",
                "turn_board": "Brett drehen"
            },
            en: {
                "to_game_start": "To game start",
                "one_move_back": "One move back",
                "one_move_forward": "One move forward",
                "to_last_move": "To last move",
                "auto_run": "Auto play",
                "turn_board": "Turn board"
            }
        }).then(() => {

            this.$btnFirst = $(`<button type="button" title="${i18n.t('to_game_start')}" class="btn btn-icon first"><i class="fa fa-fw fa-fast-backward" aria-hidden="true"></i></button>`)
            this.$btnBack = $(`<button type="button" title="${i18n.t('one_move_back')}" class="btn btn-icon back"><i class="fa fa-fw fa-step-backward" aria-hidden="true"></i></button>`)
            this.$btnForward = $(`<button type="button" title="${i18n.t('one_move_forward')}" class="btn btn-icon forward"><i class="fa fa-fw fa-step-forward" aria-hidden="true"></i></button>`)
            this.$btnLast = $(`<button type="button" title="${i18n.t('to_last_move')}" class="btn btn-icon last"><i class="fa fa-fw fa-fast-forward" aria-hidden="true"></i></button>`)
            this.$btnAutoplay = $(`<button type="button" title="${i18n.t('auto_run')}" class="btn btn-icon autoplay"><i class="fa fa-fw fa-play" aria-hidden="true"></i><i class="fa fa-fw fa-stop" aria-hidden="true"></i></button>`)
            this.$btnOrientation = $(`<button type="button" title="${i18n.t('turn_board')}" class="btn btn-icon orientation"><i class="fa fa-fw fa-exchange-alt fa-rotate-90" aria-hidden="true"></i></button>\`)`)

            console.componentContainers.controlButtons.appendChild(this.$btnFirst[0])
            console.componentContainers.controlButtons.appendChild(this.$btnBack[0])
            console.componentContainers.controlButtons.appendChild(this.$btnForward[0])
            console.componentContainers.controlButtons.appendChild(this.$btnLast[0])
            console.componentContainers.controlButtons.appendChild(this.$btnAutoplay[0])
            console.componentContainers.controlButtons.appendChild(this.$btnOrientation[0])

            this.console.state.observeChess(() => {
                this.setButtonStates()
            })

            Observe.property(this.console.state, "plyViewed", () => {
                this.setButtonStates()
            })
            Observe.property(this.console.state, "orientation", () => {
                if (this.console.state.orientation !== this.console.props.playerColor) {
                    this.$btnOrientation.addClass("btn-active") // todo
                } else {
                    this.$btnOrientation.removeClass("btn-active") // todo
                }
            })
            this.$btnFirst.click(() => {
                this.console.state.plyViewed = 0
            })
            this.$btnBack.click(() => {
                this.console.state.plyViewed--
            })
            this.$btnForward.click(() => {
                this.console.state.plyViewed++
            })
            this.$btnLast.click(() => {
                this.console.state.plyViewed = this.console.state.plyCount
            })
            this.$btnOrientation.click(() => {
                this.console.state.orientation = this.console.state.orientation === COLOR.white ? COLOR.black : COLOR.white
            })
            this.$btnAutoplay.click(() => {
                if (this.autoplay) {
                    clearInterval(this.autoplay)
                    this.autoplay = null

                } else {
                    this.console.state.plyViewed++
                    this.autoplay = setInterval(() => {
                        if (this.console.state.plyViewed >= this.console.state.plyCount) {
                            clearInterval(this.autoplay)
                            this.autoplay = null
                            this.updatePlayIcon()
                        } else {
                            this.console.state.plyViewed++
                            if (this.console.state.plyViewed >= this.console.state.plyCount) {
                                clearInterval(this.autoplay)
                                this.autoplay = null
                                this.updatePlayIcon()
                            }
                        }
                    }, 1500)
                }
                this.updatePlayIcon()
            })
            this.setButtonStates()
        })
    }

    updatePlayIcon() {
        const $playIcon = this.$btnAutoplay.find(".fa-play")
        const $stopIcon = this.$btnAutoplay.find(".fa-stop")
        if (this.autoplay) {
            $playIcon.hide()
            $stopIcon.show()
        } else {
            $playIcon.show()
            $stopIcon.hide()
        }
    }

    setButtonStates() {
        window.clearTimeout(this.redrawDebounce)
        this.redrawDebounce = setTimeout(() => {
            if (this.console.state.plyViewed > 0) {
                this.$btnFirst.prop('disabled', false)
                this.$btnBack.prop('disabled', false)
            } else {
                this.$btnFirst.prop('disabled', true)
                this.$btnBack.prop('disabled', true)
            }
            if (this.console.state.plyViewed < this.console.state.plyCount) {
                this.$btnLast.prop('disabled', false)
                this.$btnForward.prop('disabled', false)
                this.$btnAutoplay.prop('disabled', false)
            } else {
                this.$btnLast.prop('disabled', true)
                this.$btnForward.prop('disabled', true)
                this.$btnAutoplay.prop('disabled', true)
            }
            /*
            if(this.module.state.gameStarted()) {
                this.$btnAutoplay.prop('disabled', false)
                this.$btnOrientation.prop('disabled', false)
            } else {
                this.$btnAutoplay.prop('disabled', true)
                this.$btnOrientation.prop('disabled', true)
            }
            */
        })
        this.updatePlayIcon()
    }
}