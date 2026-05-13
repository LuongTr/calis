import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

interface Props {
  videoId: string;
  startSec?: number;
  endSec?: number;
}

function buildYouTubeUrl(videoId: string, startSec?: number, endSec?: number): string {
  let url = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&showinfo=0`;
  if (startSec !== undefined) {
    url += `&start=${startSec}`;
  }
  if (endSec !== undefined) {
    url += `&end=${endSec}`;
  }
  return url;
}

// Web uses a standard iframe
function WebYouTubeVideo({ videoId, startSec, endSec }: Props) {
  const src = buildYouTubeUrl(videoId, startSec, endSec);
  return (
    <View style={styles.container}>
      <iframe
        src={src}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: RADIUS.md,
        }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Exercise video"
      />
    </View>
  );
}

// Native uses WebView
function NativeYouTubeVideo({ videoId, startSec, endSec }: Props) {
  const src = buildYouTubeUrl(videoId, startSec, endSec);
  const WebView = require('react-native-webview').WebView;

  const embedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * { margin: 0; padding: 0; }
          body { background-color: #000; }
          .video-container { position: relative; width: 100%; height: 100%; }
          iframe {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <iframe
            src="${src}"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: embedHtml }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
}

export default function YouTubeVideo({ videoId, startSec, endSec }: Props) {
  if (Platform.OS === 'web') {
    return <WebYouTubeVideo videoId={videoId} startSec={startSec} endSec={endSec} />;
  }
  return <NativeYouTubeVideo videoId={videoId} startSec={startSec} endSec={endSec} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});