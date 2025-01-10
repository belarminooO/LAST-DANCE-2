
function convertLocalStorageToObject() {
    const localStorageData = {};


    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key); 

        try {
            localStorageData[key] = JSON.parse(value); 
        } catch (e) {
            localStorageData[key] = value; 
        }
    }

    return localStorageData; 
}


function exportLocalStorageToJSON(filename) {
 
    const jsonData = JSON.stringify(convertLocalStorageToObject(), null, 2); 


    const blob = new Blob([jsonData], { type: 'application/json' }); 

 
    const link = document.createElement('a'); 
    link.href = URL.createObjectURL(blob); 
    link.download = filename || 'localStorageData.json'; 


    link.click();
}



function importLocalStorageFromJSON(inputElement) {
    const file = inputElement.files[0];
    if (!file) {
        alert('Please select a JSON file.'); 
        return; 
    }

    const reader = new FileReader(); 


    reader.onload = function (event) {
        try {
            const jsonString = event.target.result; 
            const data = JSON.parse(jsonString); 

            localStorage.clear(); 

            for (const key in data) {
                const value = data[key]; 
                if (typeof value === 'object' && value !== null) {
          
                    localStorage.setItem(key, JSON.stringify(value)); 
                } else {
                  
                    localStorage.setItem(key, value);
                }
            }
            alert('LocalStorage data restored successfully.'); 
        } catch (error) {
            alert('Error restoring LocalStorage data. Make sure the selected file is a valid JSON file.');
        }
    };

    reader.readAsText(file);
}
