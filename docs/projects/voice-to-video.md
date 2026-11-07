---
title: VoiceToVideo - Audio Driven Video Generator
date: "Jan 2022"
description: Audio-driven webcam replacement that swaps stills in time with your voice
tags: ["Python", "OpenCV", "Audio Processing"]
repo: https://github.com/JDLanyon/VoiceToVideo
---

<ProjectFullPage>

# VoiceToVideo - Audio-Driven Video Generator

**VoiceToVideo** is a Python-based tool that generates real-time video animations driven by audio input - effectively creating a "talking head" effect using a sequence of static images mapped to audio amplitude. No webcam required.

## How It Works

The application maps audio frequencies and amplitude from a microphone input to trigger different frames from a configured image sequence. Lower volumes display earlier frames, and higher volumes progress through the sequence - creating the illusion of a character speaking or reacting in real time.

## Key Features

- **Audio-Driven Animation** - Microphone input drives frame selection in real time
- **Configurable Frame Mapping** - Uses numbered images (0.png, 1.png, ...) inside a folder
- **Exponential Mode** - `exponential = yes` setting applies a non-linear curve to frame transitions, making it easier to reach later frames without screaming into the mic
- **Standalone EXE** - Pre-built releases available for users who don't want to run Python directly
- **Lightweight** - Minimal dependencies; runs on modest hardware

## Use Cases

- **Content Creation** - Animated avatar reactions without a webcam
- **Streaming** - Low-bandwidth alternative to full video streaming
- **Accessibility** - Communicate visually using audio-only input
- **Creative Projects** - Experimental audio-reactive visuals

## Built With

- **Python 3** - Core application logic
- **OpenCV** - Video frame rendering and display
- **NumPy** - Audio data processing and frame interpolation
- **PyAudio / sounddevice** - Real-time microphone input capture

## Installation

**EXE (recommended):** Download the latest release from GitHub, extract the .zip, and run.

**Python:** Clone the repo, install dependencies, and run the script directly.


</ProjectFullPage>
