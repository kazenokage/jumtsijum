import firebase from 'firebase/app'
import 'firebase/database'
import songs from '../song-data'

const config = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_DATABASEURL,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID
}

const fb = firebase.initializeApp(config)
var db = fb.database()
// if (process.env.NODE_ENV === 'development') {
//   // Point to the RTDB emulator running on localhost.
//   db.useEmulator("localhost", 9000)
// }

export const getGameData = gameId =>
  db.ref(`games/${gameId}`).once('value').then((snap) => snap.val())

export const getTeamsRef = gameId =>
  db.ref(`games/${gameId}/teams`)

export const getCurrentSong = gameId =>
  db.ref(`games/${gameId}/currentSong`).once('value').then((snap) => snap.val())

export const getCurrentSongRef = gameId =>
  db.ref(`games/${gameId}/currentSong`)

export const getSongArchive = (gameId) =>
  db.ref(`games/${gameId}/songArchive`).once('value').then((snap) => snap.val())

export const addNewGame = (gameId, song, lyrics) => {
  const lyricsCount = Object.keys(lyrics).length
  const redCard = Math.floor(Math.random() * (lyricsCount - 0) + 0).toString()
  db.ref(`games/${gameId}`).set({
    gameId: gameId,
    currentSong: song,
    teams: {
      red: {
        points: 0,
        turn: false
      },
      blue: {
        points: 0,
        turn: true
      }
    },
    cards: Object.keys(lyrics).map((id) => ({'isOpen': false, 'isRed': id === redCard}))
  })
}

export const openCard = (gameId, cardId) => {
  db.ref(`games/${gameId}/cards/${cardId}`).update({'isOpen': true})
}

export const getCardStatusesRef = gameId =>
  db.ref(`games/${gameId}/cards`)

export const getCardStatuses = gameId =>
  db.ref(`games/${gameId}/cards`).once('value').then((snap) => snap.val())

export const setNewCurrentSong = (gameId, oldCurrentSong, newCurrentSong, lyrics) => {
  const currentSongRef = db.ref(`games/${gameId}/currentSong`)
  const archiveRef = db.ref(`games/${gameId}/songArchive`)
  const cardsRef = db.ref(`games/${gameId}/cards`)
  const lyricsCount = Object.keys(lyrics).length
  const redCard = Math.floor(Math.random() * (lyricsCount - 0) + 0).toString()

  archiveRef.push(oldCurrentSong)
  currentSongRef.set(newCurrentSong)
  cardsRef.set(Object.keys(lyrics).map((id) => ({'isOpen': false, 'isRed': id === redCard})))
}

export const updatePoints = (gameId, team, points) =>
  db.ref().child(`games/${gameId}/teams/${team}`)
    .update({ points })

export const switchTurn = (gameId, team) => {
  const updates = {}
  updates[`games/${gameId}/teams/red/turn`] = team === 'red'
  updates[`games/${gameId}/teams/blue/turn`] = team === 'blue'
  return db.ref().update(updates)
}

export const addGameMasterViewer = gameId => {
  const gameRef = db.ref(`games/${gameId}`)
  // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
  const gameMaster = gameRef.child('gameMastersOnline').push()
  // When I disconnect, remove this device
  gameMaster.onDisconnect().remove()
  // Add this device to my connections list
  gameMaster.set(true)
}

export const getGameMastersOnlineCount = gameId =>
  db.ref(`games/${gameId}/gameMastersOnline`).once('value').then((snap) => Object.keys(snap.val()).length)

export const getGameMastersOnlineRef = gameId => db.ref(`games/${gameId}/gameMastersOnline`)

export const uploadBaseSongs = () => {
  db.ref('songs').set({})
  const updates = {}
  songs.forEach(song => {
    let key = db.ref('songs').push().key
    song.id = key
    updates[key] = song
  })
  db.ref('songs').update(updates)
}

export const getSongsRef = () => db.ref('songs')

export const getSongRef = id => db.ref(`songs/${id}`)

export const addNewSong = song => {
  const newRef = db.ref('songs').push()
  const newSong = {
    id: newRef.key,
    ...song
  }
  newRef.set(newSong)
}

export const getPlaylistsRef = () => db.ref('playlists')

export const removeSong = songId => db.ref(`songs/${songId}`).remove()
