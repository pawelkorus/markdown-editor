import React, { useCallback, useEffect, useState } from 'react';
import { MilkdownEditor, WrapWithProviders } from './milkdown';
import useMilkdownCommands from './milkdown/useMilkdownCommands';

export type Props = {
    fileName: string,
    content: string,
    onFileNameChanged?: (event:FileNameChangeEvent) => void
    onSaveClicked?: (event:SaveEvent) => void
    onCloseClicked?: () => void
    onTogglePreviewClicked?: () => void
}

export class SaveEvent {
    constructor(
        public content:string
    ) {}
}

export class FileNameChangeEvent {
    constructor(
        public fileName:string
    ) {}
}

function EditorView(props:Props):React.ReactElement {
    const [ fileName, setFileName ] = useState(props.fileName)
    const [ updatedContent, setUpdatedContent ] = useState(props.content)
    const [ isDirty, setIsDirty ] = useState(false)
    const [ lastSavedTimestamp, setLastSavedTimestamp ] = useState(null)
    const [ editFileNameEnabled, setEditFileNameEnabled ] = useState(false)
    useMilkdownCommands();

    useEffect(() => {
        if(isDirty) {
            const interval = setInterval(() => {
                if(isDirty) save(updatedContent)
            }, 5000);
            return () => {
                clearInterval(interval);
            }
        }
    }, [updatedContent, isDirty]);

    useEffect(() => {
        setIsDirty(true);
    }, [updatedContent]);

    const updateContent = useCallback((markdown:string) => {
        setUpdatedContent(markdown)
    }, []);

    function save(newContent:string) {
        props.onSaveClicked && props.onSaveClicked(new SaveEvent(newContent))
        setLastSavedTimestamp(new Date())
        setIsDirty(false)
    }

    function handleFileNameChange() {
        props.onFileNameChanged && props.onFileNameChanged(new FileNameChangeEvent(fileName))
        setEditFileNameEnabled(false)
    }

    return (
<>
    <div className="container-fluid p-2">
        <div className="d-flex flex-row align-items-center justify-content-end">
            {editFileNameEnabled ? (
                <input
                type="text"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                onBlur={handleFileNameChange}
                autoFocus
                className='form-control me-auto'
                />
            ) : ( <h5 className='me-auto mb-0' onClick={() => setEditFileNameEnabled(true)}>{fileName}</h5> )}
            {lastSavedTimestamp != null && <span className="ms-1"><small className="text-success">Last saved at {lastSavedTimestamp.toLocaleString()}</small></span>}
            <button className="btn btn-primary ms-1" id="btn-save" type="button" onClick={() => save(updatedContent)}>Save</button>
            <button className="btn btn-primary ms-1" id="btn-close" type="button" onClick={props.onCloseClicked}>Close</button>
        </div>
    </div>
    <div className="container-lg mt-4">
        <div className="row">
            <MilkdownEditor content={props.content} onContentUpdated={updateContent}/>
        </div>
    </div>
</>
)}

export default function(props:Props):React.ReactElement {
    return <WrapWithProviders><EditorView {...props}/></WrapWithProviders>
}
