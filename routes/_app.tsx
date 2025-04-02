import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Binu</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/carousel2.css" />
        <link rel="stylesheet" href="/featuresCarousel.css" />
        <link rel="stylesheet" href="/approachCarousel.css" />
        <link rel="stylesheet" href="/dashboardCards.css" />
        <link rel="icon" type="image/png" href="/binu-icon.png" />
        <link rel="icon" type="image/png" href="/binu-icon.png" />
      </head>
      <body style={{ backgroundColor: "#000000" }}>
        <Component />
      </body>
    </html>
  );
}
