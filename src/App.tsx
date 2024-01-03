import React, { useCallback } from "react"
import {
    EditorView,
    ViewerView,
    NotificationView,
    SaveEvent,
    FileNameChangeEvent
} from "./ui"
import { useEffect, useState } from 'react'
import { 
    loadGapi, 
    loadGis, 
    initializeGapiClient, 
    parseGoogleState, 
    StateFromGoogleAction,
    authorizeInstall,
} from "./google"
import {
    loadFile,
    save,
    createFile,
    updateFileName
} from "./service"
import { Spinner } from "react-bootstrap"
import { MilkdownProvider } from "@milkdown/react"
import { ProsemirrorAdapterProvider } from "@prosemirror-adapter/react"
import { CommandsContextProvider, useCommands } from "./command"
import { CommandPalette } from "./ui/commandPalette"


function RootView():React.ReactElement {
    const [loading, setLoading] = useState(true)
    const [fileName, setFileName] = useState("RandomFilename.md")
    const [content, setContent] = useState("Initializing"); 
    const [editMode, setEditMode] = useState(false)
    const [message, setMessage] = useState(null)
    const [ , executeCommand ] = useCommands();

    useEffect(() => {
        const googleApi = async function() {
            const googleState = await Promise.all([loadGapi(), loadGis()]).then(initializeGapiClient).then(parseGoogleState)
        
            if(StateFromGoogleAction.Open == googleState.action) {
                try {
                    const { name, content } = await loadFile(googleState.fileId, googleState.userId);
                    setFileName(name)
                    setContent(content)
                    setEditMode(false)
                } catch(e : unknown) {
                    console.error(e);
                    setMessage("Can't load file. " + e);
                }
            } else if(StateFromGoogleAction.New == googleState.action) {
                try {
                    const { name, content } = await createFile("Newfile.md", googleState.folderId);
                    setFileName(name);
                    setContent(content);
                    setEditMode(true);
                } catch(e: unknown) {
                    console.error(e);
                    setMessage("Can't create file. " + e);
                }
            } else if(StateFromGoogleAction.Install == googleState.action) {
                try {
                    await authorizeInstall();
                    setMessage("Application installed into your google drive successfully.")
                } catch (e : unknown) {
                    setMessage("Can't install app into you google drive." + e)
                }
            }

            setLoading(false)
        }
        
        if(loading) {
            googleApi()
            setContent('Initialized')
        }
    }, [])

    const enableEditMode = useCallback(() => {
        setEditMode(true)
    }, []);

    const closeEditMode = useCallback(() => {
        setEditMode(false)
    }, []);

    const saveContent = useCallback(async (e:SaveEvent) => {
        await save(e.content);
        setContent(e.content)
    }, []);

    const handleFileNameChange = useCallback(async (e:FileNameChangeEvent) => {
        await updateFileName(e.fileName)
    }, []);

    return loading? 
    <div className="container-fluid h-100 d-flex">
        <div className="mx-auto my-auto">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    </div>
    : 
    <CommandPalette onItemSelected={(item) => executeCommand(item.id)}>
        <NotificationView message={message}>
            {editMode && <MilkdownProvider>
                <ProsemirrorAdapterProvider>
                    <EditorView 
                            fileName={fileName}
                            content={content} 
                            onCloseClicked={closeEditMode} 
                            onSaveClicked={saveContent}
                            onFileNameChanged={handleFileNameChange}
                        />
                </ProsemirrorAdapterProvider>
            </MilkdownProvider>
            }

            {!editMode && <MilkdownProvider>
                <ProsemirrorAdapterProvider>
                    <ViewerView content={content} onEditClicked={enableEditMode}/>
                </ProsemirrorAdapterProvider>
            </MilkdownProvider>
            }
        </NotificationView>
    </CommandPalette>
}

export default ():React.ReactElement => {
    return (
<CommandsContextProvider>
            <RootView />
</CommandsContextProvider>
    )
}
