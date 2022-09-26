import React, { Component } from 'react';

export default class EditSongModal extends Component {
    render() {
        const {hideEditSongModalCallback, editSongCallback } = this.props;
        return (
            <div className="modal" 
            id="edit-song-modal" 
            data-animation="slideInOutLeft">
                <div className="modal-root" id='verify-edit-song-root'>
                    <div className="modal-north">
                        Edit Song
                    </div>
                    <div className="modal-center">
                        <div id = "title-prompt">Title:</div>
                        <input className="edit-stuff" type="text" id="edit-song-modal-title-textfield"></input>
			            <div id="artist-prompt">Artist:</div>
				        <input className="edit-stuff" type="text" id="edit-song-modal-artist-textfield"></input>
			            <div id="you-tube-id-prompt">youTubeId:</div>
				        <input className="edit-stuff" type="text" id="edit-song-modal-youTubeId-textfield"></input>
                    </div>
                    <div className="modal-south">
                        <input type="button" 
                            id="edit-song-confirm-button" 
                            className="modal-button" 
                            onClick={editSongCallback}
                            value='Confirm' />
                        <input type="button" 
                            id="edit-song-cancel-button" 
                            className="modal-button" 
                            onClick={hideEditSongModalCallback}
                            value='Cancel' />
                    </div>
                </div>
                
            </div>
        );
    }
}