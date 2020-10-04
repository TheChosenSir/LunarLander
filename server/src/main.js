// Library Imports
import { EVENTS, REQUEST } from '../../shared/Consts';
import Game from './Game/Game';
import IO from 'socket.io';

// Main
export default function main(http) {
    // Create in instance of Socket.io
    const io = IO(http)
    // Creates an instance of the Game
    const game = new Game()


    // Listens for 'connection' event
    io.on('connection', socket => {
        console.log('User connected', socket.id)

        // Listens for a request for terrain informaiton.
        socket.on(REQUEST.REQUEST_TERRAIN.req, () => {
            // Sends terrain seed as acknowledgement.
            socket.emit(REQUEST.REQUEST_TERRAIN.ack, game.terrainSeed)
        })

        // Listens for a request to add player to the Game.
        socket.on(REQUEST.REQUEST_NEW_PLAYER.req, () => {
            // Adds current connected player to the game.
            game.addPlayer(socket)
            // Sends an acknowledgement with a list of all players in the game to the ender of the request.
            socket.emit(REQUEST.REQUEST_NEW_PLAYER.ack, game.getPlayers())
            // Sends a list of all players in the game to the rest of the players in the game.
            socket.broadcast.emit(EVENTS.SERVER_UPDATE_PLAYERS, game.getPlayers())
        })

        // Listen for PLayer Moved events and tell game to move the player.
        socket.on(EVENTS.PLAYER_HAS_MOVED, typeOfMovement => game.movePlayer(socket, typeOfMovement))

        // Listens for 'disconnect' events.
        socket.on('disconnect', () => {
            // Removes disconected player from the game.
            game.removePlayer(socket)
             // Sends a list of all players in the game to the disconnected player. (Might be redundant)
            socket.emit(EVENTS.SERVER_UPDATE_PLAYERS, game.getPlayers())
             // Sends a list of all players in the game to the rest of the players in the game.
            socket.broadcast.emit(EVENTS.SERVER_UPDATE_PLAYERS, game.getPlayers())

            console.log('User disconnected', socket.id)           
        })
    });
}

