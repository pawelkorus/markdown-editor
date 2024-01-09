import React, { useCallback, useEffect, useState } from 'react'
import { MilkdownEditor, WrapWithProviders } from './milkdown'
import useMilkdownCommands from './milkdown/useMilkdownCommands'
import { useGdriveFile, useGdriveFileCommands } from '../service/gdrivefile'

export type Props = {
  onCloseClicked?: () => void
}

function EditorView(props: Props): React.ReactElement {
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(null)
  const [editFileNameEnabled, setEditFileNameEnabled] = useState(false)
  const [fileDetails] = useGdriveFile()
  const [updatedContent, setUpdatedContent] = useState(fileDetails.content)
  const { updateContent, updateFileName } = useGdriveFileCommands()
  useMilkdownCommands()

  useEffect(() => {
    if (isDirty) {
      const interval = setInterval(() => {
        if (isDirty) commitContentChange(updatedContent)
      }, 5000)
      return () => {
        clearInterval(interval)
      }
    }
  }, [updatedContent, isDirty])

  const initialContent = useCallback(() => {
    return fileDetails.content
  }, [fileDetails.id])

  const handleContentUpdate = useCallback((markdown: string) => {
    setUpdatedContent(markdown)
    setIsDirty(true)
  }, [])

  function commitContentChange(newContent: string) {
    updateContent(newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitFileNameChange(fileName: string) {
    updateFileName(fileName)
    setEditFileNameEnabled(false)
  }

  return (
    <>
      <div className="container-fluid p-2">
        <div className="d-flex flex-row align-items-center justify-content-end">
          {editFileNameEnabled
            ? (
              <input
                type="text"
                value={fileDetails.name}
                onBlur={e => commitFileNameChange(e.target.value)}
                autoFocus
                className="form-control me-auto"
              />
              )
            : (<h5 className="me-auto mb-0" onClick={() => setEditFileNameEnabled(true)}>{fileDetails.name}</h5>)}
          {lastSavedTimestamp != null && (
            <span className="ms-1">
              <small className="text-success">
                Last saved at
                {lastSavedTimestamp.toLocaleString()}
              </small>
            </span>
          )}
          <button className="btn btn-primary ms-1" id="btn-save" type="button" onClick={() => commitContentChange(updatedContent)}>Save</button>
          <button className="btn btn-primary ms-1" id="btn-close" type="button" onClick={props.onCloseClicked}>Close</button>
        </div>
      </div>
      <div className="container-lg mt-4">
        <div className="row">
          <MilkdownEditor content={initialContent()} onContentUpdated={handleContentUpdate} />
        </div>
      </div>
    </>
  )
}

export default function (props: Props): React.ReactElement {
  return <WrapWithProviders><EditorView {...props} /></WrapWithProviders>
}
