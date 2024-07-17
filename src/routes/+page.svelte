<script lang="ts">
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
</div>

<!-- <script lang="ts">
import { Pinecone } from '@pinecone-database/pinecone';

let data = null;
let error = null;
let query = '';

async function fetchData(query) {
  try {
    console.log('fetching data');
    const response = await fetch('/api/wrapper/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }, 
      body: JSON. stringify({ query: query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const result = await response.json();
    data = result;
    console. log(data);
  } catch (err) {
    error = err.message;
  }
}
  
  function printTextBoxValue() {
      const textBox = document.getElementById("myTextBox");
      const value = textBox.value;
      console.log(value);
      fetchData(textBox.value);
  }
  </script>
  
  <div class="flex flex-col w-2/3 ml-10 items-center">
      <h1 class="p-5 text-6xl hover:text-sky-700">Ask kishore about pokemon!</h1>
      <input id="myTextBox" type="text" class="p-2 w-full border border-gray-300">
      <button on:click={printTextBoxValue} class="p-2 bg-sky-700 text-white">Submit</button>

      {#if data != null}
      <div class="m-20"> Result = {data.result}</div>
      {/if}
    
  </div>
   -->