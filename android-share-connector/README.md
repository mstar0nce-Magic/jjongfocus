# JjongKeep Android Share Connector

Purpose: receive Android ACTION_SEND text/plain shares (plain text and web links) and forward them to the existing JjongKeep web app without changing the working photo-share PWA.

The Android activity will declare a text/plain ACTION_SEND intent filter and read Intent.EXTRA_TEXT / Intent.EXTRA_SUBJECT. The existing PWA remains responsible for image sharing.