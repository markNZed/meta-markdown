// app.js

// Remove previous event listeners if any
if (window.appInitialized) {
    document.getElementById('app').removeEventListener('click', window.appClickHandler);
}

export function initApp() {
    console.log('Initializing app.js module...');

    function handleClick() {
        alert('App content clicked!');
    }

    // Store references for cleanup
    window.appClickHandler = handleClick;
    window.appInitialized = true;

    document.getElementById('app').addEventListener('click', handleClick);
}

initApp();
