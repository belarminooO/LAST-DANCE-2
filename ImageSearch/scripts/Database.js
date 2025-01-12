/**
 * @fileoverview Classes for managing JSON data from a file or local storage.
 * Provides methods to load, search, save, and retrieve JSON data efficiently.
 */

/**
 * Class to handle JSON data from an external file.
 */
class DatabaseJSON {
    /**
     * Constructor for the DatabaseJSON class.
     * Currently, no initialization is required.
     */
    constructor() {}

    /**
     * Loads a JSON file asynchronously and parses its contents.
     * 
     * @async
     * @param {string} filename - The path to the JSON file to load.
     * @returns {Promise<Object>} A promise resolving to the parsed JSON object.
     * @throws Will log an error if the file cannot be fetched or parsed.
     */
    async loadFile(filename) {
        let jsonData = {}; // Placeholder for the parsed JSON data

        try {
            // Fetch the file from the specified path
            const response = await fetch(filename);

            // Read the response as text
            const jsonString = await response.text();

            // Parse the text into a JSON object
            jsonData = JSON.parse(jsonString);
        } catch (error) {
            // Log any errors during the fetch or parse operation
            console.error('Error loading JSON file:', error);
        }

        return jsonData; // Return the parsed JSON data
    }

    /**
     * Searches through the JSON data for images matching a query.
     * 
     * @param {string} query - The search query. A query starting with "#" filters by dominant color; otherwise, filters by class.
     * @param {Object} jsonData - The JSON data containing the images to search.
     * @param {number} maxResults - The maximum number of results to return.
     * @returns {string[]} An array of file paths for matched images.
     */
    search(query, jsonData, maxResults) {
        console.log("+++++++ SEARCH START +++++++");
        console.log(jsonData);
        console.log("+++++++ SEARCH START +++++++");
        console.log("+++++++ Querry +++++++");
        console.log(query);
        console.log("+++++++  +++++++");

        let imagesMatched = [];
        const normalizedQuery = query.trim().toLowerCase();
        const colorQueries = ["black", "orange", "red", "yellow", "green", "teal", "blue", "purple", "pink", "white", "gray", "brown"]; 

        if (colorQueries.includes(query)) {
            let result = [];

            if (jsonData[query]) {
                const colorImages = jsonData[query];
                console.log("+++++++ ANTES +++++++");
                console.log(colorImages);
                console.log("+++++++ ============= +++++++");

                // Adiciona todos os caminhos ao invés de limitar desnecessariamente
                result = colorImages.map(im => im.path);
                console.log("+++++++ DEPOIS +++++++");
                console.log(result);
                console.log("+++++++ ++++++++++++ +++++++");
            }

            return result; // Retorna todos os resultados encontrados
        } else {
            for (const im of jsonData.images || []) {
                if (im.class && im.class.toLowerCase().includes(normalizedQuery)) {
                    imagesMatched.push(im);
                }
            }

            // Limita os resultados se maxResults for fornecido
            const limitedResults = maxResults ? imagesMatched.slice(0, maxResults) : imagesMatched;

            const imagePaths = limitedResults.map(im => im.path);

            console.log("Critério de busca:", normalizedQuery.startsWith("#") ? "Cor dominante" : "Classe");
            console.log("Resultados encontrados:", limitedResults);
            console.log("Caminhos retornados:", imagePaths);

            return imagePaths;
        }
    }
}

/**
 * Class to manage JSON data stored in the browser's localStorage.
 */
class LocalStorageDatabaseJSON {
    /**
     * Constructor for the LocalStorageDatabaseJSON class.
     * Currently, no initialization is required.
     */
    constructor() {}

    /**
     * Saves a JSON object into localStorage under a specified key.
     * 
     * @param {string} keyname - The key under which the JSON object will be stored.
     * @param {Object} jsonObject - The JSON object to store.
     * @throws Will log an error if saving to localStorage fails.
     */
    save(keyname, jsonObject) {
        try {
            // Convert the JSON object to a string and save it in localStorage
            localStorage.setItem(keyname, JSON.stringify(jsonObject));
        } catch (e) {
            // Log any errors encountered during the save operation
            console.error('Save failed:', e.name);
        }
    }

    /**
     * Reads a JSON object from localStorage using a specified key.
     * 
     * @param {string} keyname - The key of the JSON object to retrieve.
     * @returns {Object} The parsed JSON object.
     * @throws Will throw an error if the key is not found in localStorage.
     */
    read(keyname) {
        console.log("Tentando acessar a chave no localStorage:", keyname);
    
        // Lista todas as chaves disponíveis no localStorage
        const availableKeys = Object.keys(localStorage);
        console.log("Chaves disponíveis no localStorage:", availableKeys);
    
        // Recupera o valor da chave fornecida
        const localStorageJson = localStorage.getItem(keyname);
    
        // Inicializa a variável similarKeys fora do bloco if
        let similarKeys = [];
    
        // Verifica se a chave existe
        if (localStorageJson === null) {
            console.error(`A chave "${keyname}" não foi encontrada no localStorage.`);
    
            // Sugere possíveis correspondências
            similarKeys = availableKeys.filter(key =>
                key.toLowerCase().includes(keyname.toLowerCase())
            );
    
            if (similarKeys.length > 0) {
                console.warn("Talvez você quis dizer:", similarKeys);
    
                // Recupera o valor da primeira chave similar encontrada
                const localStorageJson2 = localStorage.getItem(similarKeys[0]);
    
                console.log("SIMILARES ENCONTRADAS:", localStorageJson2);
                console.log("Valor encontrado no localStorage:", localStorageJson2);
    
                return JSON.parse(localStorageJson2); // Retorna o valor do similar
            }
        } else {
            console.log("Valor encontrado no localStorage:", localStorageJson);
            return JSON.parse(localStorageJson); // Retorna o valor original
        }
    
        // Caso nenhuma chave similar seja encontrada, retorna null ou lança erro
        console.warn("Nenhuma chave similar foi encontrada.");
        return null;
    }
    
    
    
    /**
     * Checks if localStorage is empty.
     * 
     * @returns {boolean} True if localStorage contains no keys, false otherwise.
     */
    isEmpty() {
        return localStorage.length === 0;
    }
}

// Export the classes for use in other modules
export { LocalStorageDatabaseJSON, DatabaseJSON };

