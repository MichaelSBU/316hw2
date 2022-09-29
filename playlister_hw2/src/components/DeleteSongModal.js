import React, { Component } from 'react';

export default class DeleteSongModal extends Component {
    render() {
        const { currentList, index, hideDeleteSongModalCallback, deleteSongCallback } = this.props;
        let name = "";
        if (currentList != null && index != null) {
            console.log(currentList.songs[index]);
            name = currentList.songs[index].title;
        }
        return (
            <div className="modal" 
            id="delete-song-modal" 
            data-animation="slideInOutLeft">
                <div className="modal-root" id='verify-delete-song-root'>
                    <div className="modal-north">
                        Delete song?
                    </div>
                    <div className="modal-center">
                        <div className="modal-center-content">
                            Are you sure you wish to permanently delete the {name} song?
                        </div>
                    </div>
                    <div className="modal-south">
                        <input type="button" 
                            id="delete-song-confirm-button" 
                            className="modal-button" 
                            onClick={deleteSongCallback}
                            value='Confirm' />
                        <input type="button" 
                            id="delete-song-cancel-button" 
                            className="modal-button" 
                            onClick={hideDeleteSongModalCallback}
                            value='Cancel' />
                    </div>
                </div>
                
            </div>
        );
    }
}