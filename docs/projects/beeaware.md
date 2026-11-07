---
title: BeeAware Extension - Beekeeping Database Plugin
date: "Oct 2023"
description: Beekeeping hive-inspection plugin adding CRUD data tables to the BeeAware platform
tags: ["C#", "SQL", "HTML", "CSS", "JavaScript"]
repo: https://github.com/JDLanyon/IFB399_BeeAware_Hive_Inspections
---

<ProjectFullPage>

# BeeAware Hive Inspections Plugin - Beekeeping Database Module

A hive inspection module plugin developed for **IFB399** (Capstone Project) at QUT. This module integrates into the [base BeeAware application](https://github.com/tendy0505/BeeAware) - a beekeeping management platform - providing 4 front-end data tables that allow users to directly interact with backend database records for tracking hive health, inspections, and apiary management.

## Core Functionality

The module provides CRUD operations on beekeeping data through an intuitive web interface built into the BeeAware platform.

**Key JavaScript Functions:**
- **`hip_resyncTable(table)`** - Sends GET requests to pull all data from the specified backend table and rewrites the HTML table with the returned data, keeping the UI in sync with the database
- **`hip_uploadTable(table)`** - Overwrites the existing backend table with the current information in the HTML table (used for batch updates)

## Architecture

The module follows the MVC pattern used by the base BeeAware application:

```
BeeAware
├───Modules
│   ├───Controllers
│   │   └───hip/hip_Controller.cs
│   └───Models
│       └───hip/hip_Model.cs
└───wwwroot
    └───Modules
        ├───Css/hip.css
        ├───Html/hip.html
        └───Js/hip.js
```

## Technical Details

- Plugin-based architecture using the base app's module system
- Dynamic module loading with security level gating
- SQL-backed data persistence with real-time table resynchronisation
- Front-end validation with HTML constraints and JavaScript event handling

## Built With

- **C# (.NET)** - Backend controllers and data models
- **SQL** - Database queries and table management
- **HTML/CSS/JavaScript** - Front-end interface and interactivity
- **BeeAware Base App** - Existing platform extension framework

## Known Issues & Learning Outcomes

The project documentation (originally explored in the capstone report) identifies several areas for improvement that demonstrate real-world software development awareness:

- Dynamic module loading prevents `window.onload()` from firing, requiring alternative lifecycle hooks
- User ID should be accessed from the authenticated session rather than hardcoded
- Front-end validation should be supplemented with server-side checks for production readiness
- SQLBinary datatype handling (image upload/preview) was scoped out due to time constraints


</ProjectFullPage>
