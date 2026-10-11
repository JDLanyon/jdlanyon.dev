---
title: Task Tank - Gamified Task Manager
date: "Nov 2025"
description: Project detail page
tags: ["Java", "JavaFX", "SQLite"]
embed_ids: ["nZdhINf1foU"]
repo: https://github.com/OvercaffeinatedCAB302/fish-tank
---

<ProjectFullPage>

# Task Tank - Gamified Task Manager

**Task Tank** is a cross-platform productivity-focused study application developed by a team of 6 as part of CAB302 - Software Development at Queensland University of Technology (QUT). The project turns task management into an engaging experience by combining a Pomodoro study timer, task tracking, and a virtual fish tank where completing work earns in-game rewards.

> *"Being students ourselves - we've all got heaps to do, and procrastination is always a thing we struggle with. Other to-do apps can be overly complex or feel like work, so we wanted something that makes you want to come back."*

## Core Features

- **Pomodoro Study Timer** - Customizable segment durations with health reminders, sound effects, and points earned upon session completion
- **Task Tracking** - Add, delete, edit tasks; mark tasks as priority and sort by priority level; earn points upon task completion
- **In-game Store & Tank** - Purchase fish and decorations for your tank; animated fish and decorations with real-time rendering
- **User Accounts** - Local SQL database with password hashing for secure profile persistence

## Technical Architecture

- **DAO Factory Pattern** - Instantiates complex objects cleanly, separating data handling from business logic
- **Singleton Methods** - Tracks singular instances such as the SQLite connection
- **Data Access Objects (DAO)** - Decouples data persistence from application logic
- **OOP Principles** - Inheritance, polymorphism, interfaces, and encapsulation ensure scalable and modular development
- **JavaFX FXML** - UI written in `.fxml` for clean separation of layout and logic

## Built With

| Technology | Purpose |
|---|---|
| [Java 21](https://www.oracle.com/java/technologies/downloads/#java21) (OpenJDK) | Core application language |
| [JavaFX](https://openjfx.io/) | Rich desktop UI framework |
| [SQLite](https://www.sqlite.org/) | Embedded local database |
| [FXML](https://openjfx.io/javadoc/21/javafx.fxml/javafx/fxml/doc-files/introduction_to_fxml.html) | UI layout markup |
| [Maven](https://maven.apache.org/) | Build automation and dependency management |
| [IntelliJ IDEA](https://www.jetbrains.com/idea/) | Primary development IDE |

## Project Management

The team used an industry-standard workflow including:
- **GitHub Projects** - Kanban-style project management with sprint planning
- **Discord** - Daily stand-ups and asynchronous communication
- **Notion** - Meeting minutes and development progress logs
- **when2meet** - Scheduling team availabilities
- **Canva** - Project presentation materials

<YouTubeEmbeds />

[View on GitHub →](https://github.com/OvercaffeinatedCAB302/fish-tank) · [Project Presentation](https://www.canva.com/design/DAG1tcwHRAA/mBKupfe7f_7sCC514worYQ/view) · [Meeting Minutes](https://www.notion.so/CAB302-Project-25acfa8edf3280429467c6b1c551b8e9) · [Project Board](https://github.com/orgs/OvercaffeinatedCAB302/projects/2)

</ProjectFullPage>
