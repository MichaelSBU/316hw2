import SongCard from './SongCard.js';
import React from "react";

export default class PlaylistCards extends React.Component {
    render() {
        const { currentList, index,
                moveSongCallback, deleteSongCallback, editSongCallback} = this.props;
        if (currentList === null) {
            return (
                <div id="playlist-cards"></div>
            )
        }
        else {
            return (
                <div id="playlist-cards">
                    {
                        currentList.songs.map((song, i) => (
                            <SongCard
                                id={'playlist-song-' + (i+1)}
                                key={'playlist-song-' + (i+1)}
                                className={"playlist-card"}
                                song={song}
                                index={index}
                                deleteSongCallback = {deleteSongCallback}
                                editSongCallback = {editSongCallback}
                                moveCallback={moveSongCallback}
                            />
                        ))
                    }
                </div>
            )
        }
    }
}