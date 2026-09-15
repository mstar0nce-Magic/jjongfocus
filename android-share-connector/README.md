# JjongKeep Android Share Connector

Receives Android ACTION_SEND text shares (`text/plain` and `text/*`) and forwards the text or web link to the existing JjongKeep PWA. The web app saves the forwarded value into its existing IndexedDB inbox and removes the query parameter from browser history immediately after saving.

The existing PWA remains responsible for image and image+text sharing. This connector intentionally does not register for image MIME types.

GitHub Actions builds a debug APK artifact named `jjongkeep-share-connector`.