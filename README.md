![](/public/images/sidellama.png)

# sidellama

tiny browser-augmented chat client for open-source language models.

## installation

### install from chrome web store

[Add sidellama to chrome](https://chromewebstore.google.com/detail/sidellama/lcgkoaonfgonjamccahahodpkdkfhijo)

### install manually

- download the latest [release](https://github.com/gyopak/sidellama/releases)
- enable chrome `Extensions > Developer mode`
- load the content of the extracted zip with `Load unpacked` button

### install from source

- clone the repo
- run `npm i && npm start` to generate your bundle located in `dist/chrome`
- enable chrome `Extensions > Developer mode`
- load the content of `dist/chrome` folder with `Load unpacked` button

## docs

Check out the [documentation page](/DOCS.md)
![](/docs/sidellama_app.png)

![](/docs/vim.png)

![](/docs/yt.png)

## Gemini Support

We now support Gemini as an AI provider. Please refer to the documentation for configuration and usage instructions.

### Configuration

To configure Gemini as your AI provider, follow these steps:

1. Navigate to the `ConfigGemini.tsx` file in the `src/sidePanel` directory.
2. Set your Gemini API key in the configuration settings.
3. Adjust any additional settings as needed for your application.

### Usage

Once configured, you can use Gemini for AI tasks by selecting it from the provider options in the application interface.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=https:/&type=Date)](https://www.star-history.com/#https:/&Date)
