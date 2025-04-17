// Fetching data using readable stream
import { events } from 'fetch-event-stream';

// clean url ending if it with /
export const cleanUrl = (url: string) => {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }

  return url;
};

export const urlRewriteRuntime = async function (
  domain: string,
  type = 'ollama'
) {
  const url = new URL(domain);
  const domains = [url.hostname];
  const origin = `${url.protocol}//${url.hostname}`;

  const rules = [
    {
      id: 1,
      priority: 1,
      condition: { requestDomains: domains },
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          {
            header: 'Origin',
            operation: 'set',
            value: origin
          }
        ]
      }
    }
  ];
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(r => r.id),

    // @ts-ignore
    addRules: rules
  });
};

export const webSearch = async (query: string, webMode: string) => {
  const baseUrl = webMode === 'brave' ? `https://search.brave.com/search?q=${query}` : 'https://html.duckduckgo.com/html/';
  await urlRewriteRuntime(cleanUrl(`${baseUrl}${query}`));

  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), 15000);
  const formData = new FormData();
  formData.append('q', query);

  const htmlString = await fetch(
    `${baseUrl}`,
    { signal: abortController.signal, method: webMode === 'brave' ? 'GET' : 'POST', body: webMode === 'brave' ? undefined : formData }
  )
    .then(response => response.text())
    .catch();

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(htmlString, 'text/html');
  htmlDoc.querySelectorAll('svg,#header,style,link[rel="stylesheet"],script,input,option,select,form').forEach(item => item.remove());
  return htmlDoc.body.innerText.replace(/\s\s+/g, ' ');
};

export async function fetchDataAsStream(url: string, data: any, onMessage: any, headers = {}, host: string) {
  if (url.includes('localhost')) {
    await urlRewriteRuntime(cleanUrl(url));
  }

  console.log(url, host, data)

  // Add detailed logging for Gemini
  if (host === 'gemini') {
    console.log(`[Gemini Request] URL: ${url}`);
    console.log(`[Gemini Request] Headers: ${JSON.stringify(headers)}`);
    console.log(`[Gemini Request] Body: ${JSON.stringify(data)}`);
  } else {
    console.log(`[${host} Request] URL: ${url}`); // Keep existing log for other hosts
  }


  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(data)
    });

    // Check if response is ok
    if (!response.ok) {
      let errorBody = 'Could not read error body';
      try {
        errorBody = await response.text();
      } catch (e) {
        console.error('Failed to read error response body:', e);
      }
      console.error(`Fetch failed: ${response.status} ${response.statusText}`, errorBody);
      // Try to parse JSON error body for more details
      let detail = '';
      try {
        const parsedError = JSON.parse(errorBody);
        detail = parsedError?.error?.message || JSON.stringify(parsedError);
      } catch (e) { /* Ignore if body is not JSON */ }

      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}${detail ? `. ${detail}` : ''}`);
    }

    let str = '';

    if (host === "ollama") {
      if (!response.body) return;
      const reader = response.body.getReader();

      let done;
      let value;
      while (!done) {
        ({ value, done } = await reader.read());
        if (done) {
          onMessage(str, true);
        }
        const data = new TextDecoder().decode(value)
        try {
          const parsed = JSON.parse(data);
        } catch {
          onMessage(str || '');
        }
        str += parsed?.message?.content;
        onMessage(str || '');
      }

      onMessage(str, true);
    }

    if (host === "lmStudio") {
      const stream = events(response);
      for await (const event of stream) {
        try {
          const received = JSON.parse(event.data || '');
          console.log(event)
          const err = received?.x_groq?.error;
          if (err) {
            onMessage(`Error: ${err}`, true);
            return;
          }

          str += received?.choices?.[0]?.delta?.content || '';

          onMessage(str || '');
        } catch (error) {
          onMessage(`${error}`, true);
          console.error('Error fetching data:', error);
        }
      }
    }

    if (host === "groq") {
      const stream = events(response);
      for await (const event of stream) {
        try {
          const received = JSON.parse(event.data || '');
          const err = received?.x_groq?.error;
          if (err) {
            onMessage(`Error: ${err}`, true);
            return;
          }

          str += received?.choices?.[0]?.delta?.content || '';

          onMessage(str || '');
        } catch (error) {
          onMessage(`${error}`, true);
          console.error('Error fetching data:', error);
        }
      }
    }

    if (host === "gemini") {
      // Gemini streams responses differently, often as Server-Sent Events (SSE)
      // containing JSON data.
      if (!response.body) return;
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        console.log('[Gemini Stream Raw Chunk Received]:', value, 'Done:', done); // Added log for raw chunk
        if (done) {
          break;
        }

        buffer += value;
        console.log('[Gemini Stream Buffer State]:', buffer); // Added log for buffer state
        // Process buffer line by line for SSE format (data: {...})
        let lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last potentially incomplete line in the buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonData = line.substring(6).trim(); // Skip 'data: ' and trim whitespace
            if (jsonData) { // Ensure jsonData is not empty after trimming
              try {
                const parsed = JSON.parse(jsonData);
                console.log('[Gemini Stream Chunk Parsed]:', parsed); // Log the parsed object
                // Extract text content based on Gemini's structure
                const textContent = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textContent) {
                  console.log('[Gemini Text Content Found]:', textContent); // Log extracted text
                  str += textContent;
                  onMessage(str || '');
                } else {
                  console.log('[Gemini Text Content Not Found in Chunk]'); // Log if text not found
                }
              } catch (error) {
                console.error('Error parsing Gemini stream chunk:', error, 'Chunk:', jsonData);
                // Decide how to handle parsing errors, maybe log and continue
              }
            }
          }
        }
      }
      // Handle any remaining buffer content if necessary
      if (buffer.startsWith('data: ')) {
        const jsonData = buffer.substring(6).trim();
        if (jsonData) {
          try {
            const parsed = JSON.parse(jsonData);
            console.log('[Gemini Stream Final Chunk Parsed]:', parsed);
            const textContent = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              console.log('[Gemini Text Content Found in Final Chunk]:', textContent);
              str += textContent;
            }
          } catch (error) {
            console.error('Error parsing final Gemini stream chunk:', error, 'Chunk:', jsonData);
          }
        }
      }

      onMessage(str, true); // Final update after stream ends
      return; // Exit after handling Gemini stream
    }

    if (host === "openai") {
      const stream = events(response);
      for await (const event of stream) {
        try {
          const received = JSON.parse(event.data || '');
          const err = received?.x_openai?.error;
          if (err) {
            onMessage(`Error: ${err}`, true);
            return;
          }

          str += received?.choices?.[0]?.delta?.content || '';

          onMessage(str || '');
        } catch (error) {
          onMessage(`${error}`, true);
          console.error('Error fetching data:', error);
        }
      }
    }

    onMessage(str, true);
  } catch (error) {
    // Ensure the error object is logged properly
    console.error('Error in fetchDataAsStream:', error);
    // Pass the error message to the UI
    const errorMessage = error instanceof Error ? error.message : String(error);
    onMessage(`Error: ${errorMessage}`, true);
  }
}
