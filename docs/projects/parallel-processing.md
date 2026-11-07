---
title: Parallel Processing Analysis - Marching Cubes
description: Rigorous performance analysis of marching cubes using C# job systems
tags: ["Unity", "C#", "Performance"]
---

<ProjectFullPage>

# Parallel Processing Analysis - Marching Cubes

A technical exploration of parallel processing techniques applied to the **Marching Cubes** algorithm, developed as part of **CAB401** at QUT. This project benchmarks and analyses performance gains achieved through GPU-accelerated parallel computation versus traditional serial implementations.

## Overview

The Marching Cubes algorithm is a computer graphics technique for extracting a polygonal mesh from an implicit surface (scalar field). This project implements and compares multiple approaches:

- **Serial CPU Implementation** - Baseline single-threaded execution
- **Multi-threaded CPU Implementation** - Parallelised across CPU cores using work partitioning
- **GPU Compute Implementation** - Shader-based parallel execution on the GPU

## Key Objectives

- Measure and analyse performance scaling across different input sizes
- Compare execution time and resource utilisation across serial, multi-threaded, and GPU approaches
- Identify bottlenecks and optimal parallelisation strategies for volumetric mesh generation
- Document trade-offs between implementation complexity and performance gains

## Built With

- **Unity** - Visualisation and 3D rendering environment
- **C#** - CPU-based algorithm implementation and benchmarking framework
- **Compute Shaders** - GPU-based parallel execution using HLSL
- **Unity Profiler** - Performance measurement and bottleneck analysis

## Applications

Understanding parallel Marching Cubes has direct applications in:
- **Medical Imaging** - MRI/CT scan volume visualisation
- **Scientific Visualisation** - Fluid dynamics and meteorological data rendering
- **Game Development** - Procedural terrain and organic shape generation
- **VFX** - Volumetric effects and simulation rendering

</ProjectFullPage>
