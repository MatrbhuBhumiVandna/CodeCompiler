document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editor = document.getElementById('editor');
    const previewFrame = document.getElementById('preview-frame');
    const runBtn = document.getElementById('run-btn');
    const saveBtn = document.getElementById('save-btn');
    const currentFileDisplay = document.getElementById('current-file');
    const directoryTree = document.getElementById('directory-tree');
    
    // Tab bars
    const projectTabBar = document.getElementById('project-tab-bar');
    const folderTabBar = document.getElementById('folder-tab-bar');
    const fileTabBar = document.getElementById('file-tab-bar');
    
    // Add buttons
    const addProjectBtn = document.getElementById('add-project');
    const addFolderBtn = document.getElementById('add-folder');
    const addFileBtn = document.getElementById('add-file');
    
    // Modals
    const newProjectModal = document.getElementById('new-project-modal');
    const newFolderModal = document.getElementById('new-folder-modal');
    const newFileModal = document.getElementById('new-file-modal');
    
    // Modal buttons
    const cancelProjectBtn = document.getElementById('cancel-project');
    const createProjectBtn = document.getElementById('create-project');
    const cancelFolderBtn = document.getElementById('cancel-folder');
    const createFolderBtn = document.getElementById('create-folder');
    const cancelFileBtn = document.getElementById('cancel-file');
    const createFileBtn = document.getElementById('create-file');
    
    // State
    let currentProject = 'project-1';
    let currentFolder = 'folder-1';
    let currentFile = 'file-1';
    
    // Sample data structure
    let projects = {
        'project-1': {
            name: 'My Project',
            folders: {
                'folder-1': {
                    name: 'Main',
                    files: {
                        'file-1': {
                            name: 'index.html',
                            type: 'html',
                            content: `<!DOCTYPE html>
<html>
<head>
    <title>My Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to CodeCraft Pro!</h1>
    <p>This is a powerful real-time code editor.</p>
    <button id="demo-btn">Click Me</button>
    <script src="script.js"></script>
</body>
</html>`
                        },
                        'file-2': {
                            name: 'styles.css',
                            type: 'css',
                            content: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f8f9fa;
    color: #2d3436;
}

h1 {
    color: #6c5ce7;
    margin-bottom: 20px;
}

p {
    color: #636e72;
    line-height: 1.6;
}

#demo-btn {
    background-color: #6c5ce7;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
    transition: all 0.3s;
}

#demo-btn:hover {
    background-color: #5649c0;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}`
                        },
                        'file-3': {
                            name: 'script.js',
                            type: 'js',
                            content: `document.getElementById('demo-btn').addEventListener('click', function() {
    alert('Welcome to CodeCraft Pro!');
    this.textContent = 'Clicked!';
    this.classList.add('pulse');
    
    setTimeout(() => {
        this.textContent = 'Click Me Again';
        this.classList.remove('pulse');
    }, 1500);
});`
                        }
                    }
                }
            }
        }
    };
    
    // Initialize the editor
    function init() {
        renderAll();
        loadFile(currentFile);
        setupEventListeners();
    }
    
    // Render all UI components
    function renderAll() {
        renderProjectTabs();
        renderFolderTabs();
        renderFileTabs();
        renderDirectoryTree();
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Run button
        runBtn.addEventListener('click', updatePreview);
        
        // Save button
        saveBtn.addEventListener('click', saveCurrentFile);
        
        // Editor content change
        editor.addEventListener('input', function() {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(saveCurrentFile, 1000);
        });
        
        // Add buttons
        addProjectBtn.addEventListener('click', () => showModal(newProjectModal));
        addFolderBtn.addEventListener('click', () => {
            if (!currentProject) return;
            showModal(newFolderModal);
        });
        addFileBtn.addEventListener('click', () => {
            if (!currentProject || !currentFolder) return;
            showModal(newFileModal);
        });
        
        // Modal buttons
        createProjectBtn.addEventListener('click', createNewProject);
        cancelProjectBtn.addEventListener('click', () => hideModal(newProjectModal));
        
        createFolderBtn.addEventListener('click', createNewFolder);
        cancelFolderBtn.addEventListener('click', () => hideModal(newFolderModal));
        
        createFileBtn.addEventListener('click', createNewFile);
        cancelFileBtn.addEventListener('click', () => hideModal(newFileModal));
        
        // Close modals when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === newProjectModal) hideModal(newProjectModal);
            if (e.target === newFolderModal) hideModal(newFolderModal);
            if (e.target === newFileModal) hideModal(newFileModal);
        });
    }
    
    // Show modal
    function showModal(modal) {
        modal.style.display = 'flex';
    }
    
    // Hide modal
    function hideModal(modal) {
        modal.style.display = 'none';
    }
    
    // Render project tabs
    function renderProjectTabs() {
        // Clear existing tabs except the add button
        while (projectTabBar.firstChild !== addProjectBtn) {
            projectTabBar.removeChild(projectTabBar.firstChild);
        }
        
        // Add tabs for each project
        for (const projectId in projects) {
            const project = projects[projectId];
            const tab = createTab(projectId, project.name, 'fa-folder-open', projectId === currentProject);
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-btn')) {
                    switchProject(projectId);
                }
            });
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteProject(projectId);
            });
            
            projectTabBar.insertBefore(tab, addProjectBtn);
        }
    }
    
    // Render folder tabs
    function renderFolderTabs() {
        // Clear existing tabs except the add button
        while (folderTabBar.firstChild !== addFolderBtn) {
            folderTabBar.removeChild(folderTabBar.firstChild);
        }
        
        const project = projects[currentProject];
        if (!project) return;
        
        // Add tabs for each folder in current project
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            const tab = createTab(folderId, folder.name, 'fa-folder', folderId === currentFolder);
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-btn')) {
                    switchFolder(folderId);
                }
            });
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFolder(folderId);
            });
            
            folderTabBar.insertBefore(tab, addFolderBtn);
        }
    }
    
    // Render file tabs
    function renderFileTabs() {
        // Clear existing tabs except the add button
        while (fileTabBar.firstChild !== addFileBtn) {
            fileTabBar.removeChild(fileTabBar.firstChild);
        }
        
        const folder = getCurrentFolder();
        if (!folder) return;
        
        // Add tabs for each file in current folder
        for (const fileId in folder.files) {
            const file = folder.files[fileId];
            const tab = createTab(fileId, file.name, 'fa-file-code', fileId === currentFile);
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-btn')) {
                    switchFile(fileId);
                }
            });
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFile(fileId);
            });
            
            fileTabBar.insertBefore(tab, addFileBtn);
        }
    }
    
    // Create a tab element
    function createTab(id, name, icon, isActive) {
        const tab = document.createElement('div');
        tab.className = `tab ${isActive ? 'active' : ''}`;
        tab.dataset.id = id;
        tab.innerHTML = `
            <span class="tab-icon"><i class="fas ${icon}"></i></span>
            <span class="tab-label">${name}</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        return tab;
    }
    
    // Render directory tree
    function renderDirectoryTree() {
        directoryTree.innerHTML = '';
        
        const ul = document.createElement('ul');
        
        for (const projectId in projects) {
            const project = projects[projectId];
            const projectItem = createTreeItem(
                projectId, 
                project.name, 
                'project-item', 
                'fa-folder-open', 
                projectId === currentProject
            );
            
            const folderUl = document.createElement('ul');
            
            for (const folderId in project.folders) {
                const folder = project.folders[folderId];
                const folderItem = createTreeItem(
                    folderId,
                    folder.name,
                    'folder-item',
                    'fa-folder',
                    folderId === currentFolder && projectId === currentProject
                );
                
                const fileUl = document.createElement('ul');
                
                for (const fileId in folder.files) {
                    const file = folder.files[fileId];
                    const fileItem = createTreeItem(
                        fileId,
                        file.name,
                        'file-item',
                        'fa-file-code',
                        fileId === currentFile && folderId === currentFolder && projectId === currentProject,
                        false
                    );
                    
                    fileItem.addEventListener('click', () => {
                        if (projectId !== currentProject) switchProject(projectId);
                        if (folderId !== currentFolder) switchFolder(folderId);
                        switchFile(fileId);
                    });
                    
                    fileUl.appendChild(fileItem);
                }
                
                folderItem.addEventListener('click', (e) => {
                    const isToggle = e.target.classList.contains('toggle') || 
                                    e.target.classList.contains('fa-chevron-down');
                    
                    if (isToggle) {
                        folderItem.classList.toggle('expanded');
                    } else {
                        if (projectId !== currentProject) switchProject(projectId);
                        if (folderId !== currentFolder) switchFolder(folderId);
                    }
                });
                
                folderItem.appendChild(fileUl);
                folderUl.appendChild(folderItem);
            }
            
            projectItem.addEventListener('click', (e) => {
                const isToggle = e.target.classList.contains('toggle') || 
                                e.target.classList.contains('fa-chevron-down');
                
                if (isToggle) {
                    projectItem.classList.toggle('expanded');
                } else {
                    if (projectId !== currentProject) switchProject(projectId);
                }
            });
            
            projectItem.appendChild(folderUl);
            ul.appendChild(projectItem);
        }
        
        directoryTree.appendChild(ul);
    }
    
    // Create a tree item
    function createTreeItem(id, name, type, icon, isActive, isExpandable = true) {
        const li = document.createElement('li');
        li.className = `${type} ${isActive ? 'expanded' : ''}`;
        li.dataset.id = id;
        
        const node = document.createElement('div');
        node.className = 'tree-node';
        
        if (isExpandable) {
            node.innerHTML = `
                <span class="toggle"><i class="fas fa-chevron-down"></i></span>
                <span class="icon"><i class="fas ${icon}"></i></span>
                <span class="label">${name}</span>
            `;
        } else {
            node.innerHTML = `
                <span class="icon"><i class="fas ${icon}"></i></span>
                <span class="label">${name}</span>
            `;
            if (isActive) li.classList.add('active');
        }
        
        li.appendChild(node);
        return li;
    }
    
    // Switch project
    function switchProject(projectId) {
        if (projectId === currentProject) return;
        
        currentProject = projectId;
        const project = projects[projectId];
        
        // Set first folder as current
        const folderIds = Object.keys(project.folders);
        if (folderIds.length > 0) {
            currentFolder = folderIds[0];
            
            // Set first file as current
            const fileIds = Object.keys(project.folders[currentFolder].files);
            if (fileIds.length > 0) {
                currentFile = fileIds[0];
            }
        }
        
        renderAll();
        loadFile(currentFile);
    }
    
    // Switch folder
    function switchFolder(folderId) {
        if (folderId === currentFolder) return;
        
        currentFolder = folderId;
        const folder = getCurrentFolder();
        
        // Set first file as current
        const fileIds = Object.keys(folder.files);
        if (fileIds.length > 0) {
            currentFile = fileIds[0];
        }
        
        renderFolderTabs();
        renderFileTabs();
        renderDirectoryTree();
        loadFile(currentFile);
    }
    
    // Switch file
    function switchFile(fileId) {
        if (fileId === currentFile) return;
        
        currentFile = fileId;
        renderFileTabs();
        renderDirectoryTree();
        loadFile(fileId);
    }
    
    // Get current folder
    function getCurrentFolder() {
        return projects[currentProject]?.folders[currentFolder];
    }
    
    // Get current file
    function getCurrentFile() {
        return getCurrentFolder()?.files[currentFile];
    }
    
    // Load file into editor
    function loadFile(fileId) {
        const file = getCurrentFile();
        if (!file) return;
        
        editor.value = file.content;
        currentFileDisplay.textContent = file.name;
    }
    
    // Save current file
    function saveCurrentFile() {
        const file = getCurrentFile();
        if (!file) return;
        
        file.content = editor.value;
        console.log('File saved:', file.name);
    }
    
    // Update preview
    function updatePreview() {
        saveCurrentFile();
        
        const project = projects[currentProject];
        if (!project) return;
        
        let html = '';
        let css = '';
        let js = '';
        
        // Collect all files
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            for (const fileId in folder.files) {
                const file = folder.files[fileId];
                if (file.type === 'html') html = file.content;
                else if (file.type === 'css') css = file.content;
                else if (file.type === 'js') js = file.content;
            }
        }
        
        // Combine into a complete HTML document
        const combinedHtml = html.replace('</head>', `<style>${css}</style></head>`)
                               .replace('</body>', `<script>${js}</script></body>`);
        
        // Update preview frame
        previewFrame.srcdoc = combinedHtml;
    }
    
    // Create new project
    function createNewProject() {
        const name = document.getElementById('project-name').value.trim();
        if (!name) return;
        
        const projectId = 'project-' + Date.now();
        const folderId = 'folder-' + Date.now();
        const fileId = 'file-' + Date.now();
        
        projects[projectId] = {
            name: name,
            folders: {
                [folderId]: {
                    name: 'Main',
                    files: {
                        [fileId]: {
                            name: 'index.html',
                            type: 'html',
                            content: `<!DOCTYPE html>
<html>
<head>
    <title>${name}</title>
</head>
<body>
    <h1>${name}</h1>
</body>
</html>`
                        }
                    }
                }
            }
        };
        
        hideModal(newProjectModal);
        switchProject(projectId);
    }
    
    // Create new folder
    function createNewFolder() {
        const name = document.getElementById('folder-name').value.trim();
        if (!name) return;
        
        const folderId = 'folder-' + Date.now();
        const fileId = 'file-' + Date.now();
        
        projects[currentProject].folders[folderId] = {
            name: name,
            files: {
                [fileId]: {
                    name: 'index.html',
                    type: 'html',
                    content: `<!DOCTYPE html>
<html>
<head>
    <title>${name}</title>
</head>
<body>
    <h1>${name}</h1>
</body>
</html>`
                }
            }
        };
        
        hideModal(newFolderModal);
        switchFolder(folderId);
    }
    
    // Create new file
    function createNewFile() {
        const name = document.getElementById('file-name').value.trim();
        const type = document.getElementById('file-type').value;
        if (!name) return;
        
        const extension = type === 'html' ? '.html' : type === 'css' ? '.css' : '.js';
        const fullName = name.endsWith(extension) ? name : name + extension;
        const fileId = 'file-' + Date.now();
        
        projects[currentProject].folders[currentFolder].files[fileId] = {
            name: fullName,
            type: type,
            content: type === 'html' ? 
                `<!DOCTYPE html>
<html>
<head>
    <title>New File</title>
</head>
<body>
    
</body>
</html>` :
                type === 'css' ?
                `/* ${fullName} */` :
                `// ${fullName}`
        };
        
        hideModal(newFileModal);
        switchFile(fileId);
    }
    
    // Delete project
    function deleteProject(projectId) {
        if (Object.keys(projects).length <= 1) {
            alert('You cannot delete the last project');
            return;
        }
        
        delete projects[projectId];
        const remainingProjectId = Object.keys(projects)[0];
        switchProject(remainingProjectId);
    }
    
    // Delete folder
    function deleteFolder(folderId) {
        const project = projects[currentProject];
        if (Object.keys(project.folders).length <= 1) {
            alert('You cannot delete the last folder');
            return;
        }
        
        delete project.folders[folderId];
        const remainingFolderId = Object.keys(project.folders)[0];
        switchFolder(remainingFolderId);
    }
    
    // Delete file
    function deleteFile(fileId) {
        const folder = getCurrentFolder();
        if (Object.keys(folder.files).length <= 1) {
            alert('You cannot delete the last file');
            return;
        }
        
        delete folder.files[fileId];
        const remainingFileId = Object.keys(folder.files)[0];
        switchFile(remainingFileId);
    }
    
    // Initialize the editor
    init();
});
