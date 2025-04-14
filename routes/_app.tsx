import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BINU</title>
        {/* Load theme script before any other resources */}
        <script src="/theme-init.js"></script>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/carousel2.css" />
        <link rel="stylesheet" href="/featuresCarousel.css" />
        <link rel="stylesheet" href="/approachCarousel.css" />
        <link rel="stylesheet" href="/dashboardCards.css" />
        <link rel="icon" type="image/png" href="/binu-icon.png" />
        <link rel="icon" type="image/png" href="/binu-icon.png" />
        {/* Theme video script */}
        <script src="/theme-video.js" defer></script>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
