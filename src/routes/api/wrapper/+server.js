import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  try {
    const { query } = await request.json();

    console.log("Received query:", query);

    const response = await fetch('https://pokemon-773o.onrender.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Error in API wrapper:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
