import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Sidebar from '../components/Sidebar';
import FileExplorer from '../components/FileExplorer';
import Terminal from '../components/Terminal';
import '../styles/IDE.css';

export default function IDEPage({ user }) {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setCurrentProject(data.projects[0]);
          loadFiles(data.projects[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadFiles = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/files/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleFileSelect = (file) => {
    setCurrentFile(file);
    setCode(file.content || '');
    setLanguage(file.language || 'plaintext');
  };

  const handleSaveFile = async () => {
    if (!currentFile) return;
    try {
      const response = await fetch(`http://localhost:5000/api/files/${currentFile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: code })
      });
      const data = await response.json();
      if (data.success) {
        alert('File saved!');
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="ide-layout">
      <div className="ide-header">
        <div className="header-left">
          <span className="logo">🚀 PiyRox IDE</span>
          <span className="user-info">{user.name} ({user.plan})</span>
        </div>
        <div className="header-right">
          <button onClick={() => window.location.href = '/plans'} className="btn-plans">
            📊 Plans
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="ide-main">
        {sidebarOpen && (
          <div className="sidebar">
            <Sidebar 
              projects={projects} 
              currentProject={currentProject}
              onProjectSelect={(project) => {
                setCurrentProject(project);
                loadFiles(project.id);
              }}
            />
          </div>
        )}

        <div className="editor-area">
          <div className="file-tabs">
            {files.map(file => (
              <div
                key={file.id}
                className={`file-tab ${currentFile?.id === file.id ? 'active' : ''}`}
                onClick={() => handleFileSelect(file)}
              >
                {file.name}
              </div>
            ))}
          </div>

          <div className="editor-container">
            {currentFile ? (
              <>
                <div className="editor-header">
                  <span>{currentFile.name}</span>
                  <button onClick={handleSaveFile} className="btn-save">💾 Save</button>
                </div>
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={setCode}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    fontFamily: 'Fira Code, monospace',
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                  }}
                />
              </>
            ) : (
              <div className="no-file">
                <p>📁 Select a file to start editing</p>
              </div>
            )}
          </div>
        </div>

        <div className="file-explorer">
          <FileExplorer 
            files={files}
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
          />
        </div>
      </div>

      {terminalOpen && (
        <div className="terminal-area">
          <Terminal output={terminalOutput} />
        </div>
      )}

      <div className="ide-footer">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>📁 Sidebar</button>
        <button onClick={() => setTerminalOpen(!terminalOpen)}>⌨️ Terminal</button>
        <span className="status">Ready</span>
      </div>
    </div>
  );
}
