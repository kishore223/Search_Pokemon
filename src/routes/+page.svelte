<!-- <script lang="ts">
  import { onMount } from "svelte";
  import { dndzone } from "svelte-dnd-action";

  let pokemonName = "Pokemon";
  let pokemonImages: Record<string, string> = {};
  let selectedTypes: string[] = [];

  let data = null;
  // Function to fetch Pokémon type images
  async function fetchPokemonTypeImages() {
    try {
      const typesResponse = await fetch(`https://pokeapi.co/api/v2/type`);
      const typesData = await typesResponse.json();
      const types = typesData.results.map((type: { name: string }) => type.name);
      
      const promises = types.map(type =>
        fetch(`https://pokeapi.co/api/v2/type/${type}`)
          .then(response => response.json())
          .then(data => {
            const pokemonUrl = data.pokemon[0].pokemon.url;
            return fetch(pokemonUrl);
          })
          .then(response => response.json())
          .then(pokemonData => {
            const officialArtworkUrl = pokemonData.sprites.other['official-artwork'].front_default;
            pokemonImages = { ...pokemonImages, [type]: officialArtworkUrl };
          })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching Pokémon type images:", error);
    }
  }

  onMount(fetchPokemonTypeImages);

  function handleTypeClick(type: string) {
    if (selectedTypes.includes(type)) {
      selectedTypes = selectedTypes.filter(t => t !== type);
    } else {
      selectedTypes = [...selectedTypes, type];
    }
  }

  function revertTypes() {
    selectedTypes = [];
  }

  async function searchPokemon() {
    console.log("Selected Pokémon Types:", selectedTypes.join(", "));
    await fetchData(selectedTypes);
  }

  async function fetchData(types: string[]) {
    try {
      console.log('Fetching data for types:', types);
      const response = await fetch('/api/wrapper/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({ query: types.join(",") }), 
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const result = await response.json();
      data=result;
      console.log('Fetched data:', result);
    } catch (err) {
      console.error('Error fetching data:', err.message);
    }
  }
</script>

<style>
  .pokemon-type-container {
    width: 120px;
    height: 120px;
    background-size: cover;
    background-position: center;
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: 2px solid #333;
    border-radius: 50%;
  }

  .pokemon-type-container:hover {
    transform: scale(1.1);
  }

  .pokemon-container #pokemon-text {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  .center-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }

  .pokemon-types-wrapper {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 20px;
  }

  .search-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    flex-direction: column;
    align-items: center;
  }

  .search-button, .revert-button {
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    background-color: #333;
    color: #fff;
    border: 2px solid #333;
    border-radius: 5px;
    margin-top: 10px;
  }

  .search-button:hover, .revert-button:hover {
    background-color: #555;
  }
</style>

<div class="center-container">
  <div class="pokemon-types-wrapper">
    {#each Object.keys(pokemonImages) as type}
      <div 
        on:click={() => handleTypeClick(type)} 
        id={type.toLowerCase()} 
        class="pokemon-type-container" 
        style={`background-image: url('${pokemonImages[type]}')`}
      >
        <span class="text-gray-800 font-light transition-opacity duration-300 opacity-100 hover:opacity-0">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        {#if selectedTypes.includes(type)}
          <div class="selected-indicator">✓</div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<div class="search-container">
  <button class="search-button" on:click={searchPokemon}>Search Pokémon</button>
  <button class="revert-button" on:click={revertTypes}>Revert</button>
  {#if data != null}
  <div class="m-5 p-5 border-2 border-green-500 bg-gray-100 rounded-lg shadow-md text-center text-lg text-gray-700">
    <h2 class="mb-2 text-2xl text-green-500">Result</h2>
    <div class="mt-2 text-base text-gray-600">{data.result}</div>
  </div>
{/if}
</div> -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { Pinecone } from '@pinecone-database/pinecone';

  let data = null;
  let error = null;
  let query = '';
  let pokemonImage = null;

  onMount(() => {
    const textBox = document.getElementById("myTextBox");
    textBox.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        printTextBoxValue();
      }
    });
  });

  async function fetchData(query) {
    try {
      console.log('fetching data');
      const response = await fetch('/api/wrapper/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const result = await response.json();
      data = result;
      console.log(data);
      
      // Fetch Pokémon image
      await fetchPokemonImage(query);
    } catch (err) {
      error = err.message;
    }
  }

  async function fetchPokemonImage(query) {
    try {
      const pokemonName = query.toLowerCase().replace(/[^a-z0-9]/g, '');
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      if (!response.ok) {
        throw new Error(`Pokémon not found`);
      }
      const pokemonData = await response.json();
      pokemonImage = pokemonData.sprites.other['official-artwork'].front_default;
    } catch (err) {
      console.error('Error fetching Pokémon image:', err);
      pokemonImage = null;
    }
  }

  function printTextBoxValue() {
    const textBox = document.getElementById("myTextBox");
    const value = textBox.value;
    console.log(value);
    fetchData(textBox.value);
  }
</script>


<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

  :global(body) {
    font-family: 'Poppins', sans-serif;
    margin: 0;
    padding: 0;
  }

  .bg-image {
    background-image: url('../assets/bg.png');
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content-wrapper {
    width: 90%;
    max-width: 850px;
    background-color: rgba(255, 255, 255, 0.6); /* More transparent background */
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 40px;
    text-align: center;
    backdrop-filter: blur(10px); /* Add blur effect for better readability */
  }

  h1 {
    font-size: 3rem;
    color: #2c3e50;
    margin-bottom: 30px;
    transition: color 0.3s ease;
  }

  h1:hover {
    color: #3498db;
  }

  input[type="text"] {
    width: 100%;
    padding: 12px;
    margin-bottom: 20px;
    border: 2px solid #3498db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    background-color: rgba(255, 255, 255, 0.8); /* Slightly transparent input */
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #2980b9;
    background-color: rgba(255, 255, 255, 0.9); /* Less transparent when focused */
  }

  button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #2980b9;
  }

  .result-container {
    margin-top: 40px;
    background-color: rgba(255, 255, 255, 0.8); /* More transparent result container */
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .result-container h2 {
    color: #2c3e50;
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .result-container p {
    color: #34495e;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .pokemon-image {
    max-width: 200px;
    margin: 20px auto;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
</style>

<div class="bg-image">
  <div class="content-wrapper">
    <h1>Explore the World of Pokémon!</h1>
    <input id="myTextBox" type="text" placeholder="Type a Pokémon name or your question here...">
    <button on:click={printTextBoxValue}>Submit</button>
    
    {#if pokemonImage}
      <img src={pokemonImage} alt="Pokémon" class="pokemon-image">
    {/if}

    {#if data != null}
      <div class="result-container">
        <h2>Result</h2>
        <p>{data.result}</p>
      </div>
    {/if}
  </div>
</div>

