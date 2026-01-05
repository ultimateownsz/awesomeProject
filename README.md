# Awesome Project - Interactive Graph-Based Static Site

A highly interactive, graph-based static site built with Hugo that provides an Obsidian-like graph view for managing alternative GitHub Awesome list repositories.

![Home Page](https://github.com/user-attachments/assets/9477d1cd-eb39-437c-85dc-4cd525258f78)

![Graph Visualization](https://github.com/user-attachments/assets/4981e6b9-0364-44b8-932c-3177a7e539e1)

## Features

- 🌐 **Interactive Graph View**: Navigate through categories using an interactive D3.js-powered graph visualization
- 📚 **Organized Categories**: Browse resources organized by programming languages, frameworks, and tools
- 🔗 **Connected Resources**: Discover relationships between different technologies and topics
- ⚡ **Fast & Static**: Built with Hugo for blazing-fast performance
- 🎨 **Customizable**: Easy to add new categories and customize colors
- 📱 **Responsive**: Works on desktop and mobile devices

## Graph Visualization

The graph view mimics Obsidian's graph functionality with D3.js providing interactive features.

## Getting Started

### Prerequisites

- Hugo Extended v0.120.0 or later
- Node.js v18 or later

### Installation

```bash
npm install
hugo mod get && hugo mod tidy
```

### Development

```bash
npm run dev
```

### Building

```bash
npm run build
```

## Adding Categories

Create markdown files in `content/categories/` with frontmatter:

```yaml
title: "Category Name"
tags: ["tag1", "tag2"]
description: "Description"
links:
  - name: "Related"
    url: "/categories/related"
color: "#hexcolor"
```

## License

MIT License - see LICENSE file for details.
