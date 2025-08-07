# Browser Usage Guide

This is a modified version of discord.js-selfbot-v13 that has been gutted to work in browser environments, specifically for React hooks.

## What was fixed for browser compatibility

- **WebSocket Implementation**: Replaced Node.js `ws` library with browser's native WebSocket API
- **Buffer Support**: Added browser-compatible buffer polyfill fallbacks
- **Node.js Built-ins**: All `node:` imports now have browser-compatible fallbacks
- **Process & Timers**: Replaced Node.js process and timers with browser equivalents
- **Sharding**: Disabled Node.js child_process functionality for browser use
- **File System**: Disabled fs/path operations that don't work in browsers

## What remains fully functional

- Core Discord client functionality
- WebSocket gateway connection (now browser-compatible)
- Message receiving and sending
- User authentication via token
- Event handling (messageCreate, ready, etc.)
- Channel and guild management
- Basic Discord API functionality

## React Hook Example

```jsx
import { useEffect, useState } from 'react';
import { Client } from 'discord.js-selfbot-v13';

function useDiscordClient(token) {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!token) return;

    const discordClient = new Client({
      intents: [], // Self-bots don't need intents
      checkUpdate: false,
    });

    discordClient.on('ready', () => {
      console.log(`Logged in as ${discordClient.user.tag}`);
      setIsReady(true);
    });

    discordClient.on('messageCreate', (message) => {
      setMessages(prev => [...prev, {
        id: message.id,
        content: message.content,
        author: message.author.tag,
        channel: message.channel.id,
        timestamp: message.createdAt,
      }]);
    });

    discordClient.login(token).catch(console.error);
    setClient(discordClient);

    return () => {
      discordClient.destroy();
    };
  }, [token]);

  return {
    client,
    messages,
    isReady,
  };
}

// Usage in component
function MyDiscordComponent() {
  const [token, setToken] = useState('');
  const { client, messages, isReady } = useDiscordClient(token);

  return (
    <div>
      <input 
        type="password" 
        placeholder="Discord Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      
      {isReady && <p>Connected as {client.user.tag}</p>}
      
      <div>
        <h3>Recent Messages:</h3>
        {messages.slice(-10).map(msg => (
          <div key={msg.id}>
            <strong>{msg.author}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Next.js Specific Setup

For Next.js projects, you may need to install the `buffer` polyfill:

```bash
npm install buffer
```

Then add this to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "buffer": require.resolve("buffer"),
    };
    return config;
  },
};

module.exports = nextConfig;
```

## Important Notes

1. **Self-bot Usage**: This is for educational purposes. Using self-bots violates Discord's ToS.

2. **Token Security**: Never expose your Discord token in client-side code in production.

3. **CORS Issues**: You may need to configure CORS or use a proxy for API calls.

4. **WebSocket**: The WebSocket connection now uses the browser's native WebSocket API.

## Bundler Configuration

For Webpack-based bundlers (like Create React App), you may need to add polyfills for Node.js modules:

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer"),
      "events": require.resolve("events"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
```

## Available Functionality

- `client.login(token)` - Login with Discord token
- `client.on('messageCreate', callback)` - Listen for messages
- `client.on('ready', callback)` - Listen for ready event
- `client.user` - Your user information
- `client.channels` - Access to channels
- `client.guilds` - Access to servers
- Message sending and receiving
- Basic Discord API interactions 