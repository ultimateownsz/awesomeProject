// Mechanics Graph Visualization using JSONCanvas format
// D3.js Graph Visualization for Game Mechanics Toolkit
(function() {
  'use strict';

  // Wait for DOM and data to be ready
  if (typeof window.mechanicsCanvasData === 'undefined') {
    console.error('Mechanics canvas data not loaded');
    return;
  }

  const canvasData = window.mechanicsCanvasData;
  
  // Parse JSONCanvas format to D3-compatible format
  function parseJSONCanvas(canvasData) {
    const nodes = canvasData.nodes.map(node => ({
      id: node.id,
      label: extractTitle(node.text),
      description: extractDescription(node.text),
      fullText: node.text,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      color: node.color || '#95a5a6',
      type: node.type,
      image: node.image || null,
      imageAlt: node.imageAlt || ''
    }));
    
    const edges = canvasData.edges.map(edge => ({
      id: edge.id,
      source: edge.fromNode,
      target: edge.toNode,
      fromSide: edge.fromSide,
      toSide: edge.toSide,
      label: edge.label || ''
    }));
    
    return { nodes, edges };
  }
  
  // Extract title from markdown text (first # heading)
  function extractTitle(text) {
    const match = text.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }
  
  // Extract description from markdown text
  function extractDescription(text) {
    const descMatch = text.match(/\*\*Description\*\*:\s*(.+?)(?:\n|$)/);
    return descMatch ? descMatch[1].trim() : '';
  }
  
  // Parse markdown text to HTML for detail panel
  function parseMarkdown(text) {
    // First pass: convert markdown to HTML
    let html = text
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Second pass: wrap consecutive <li> elements in <ul> tags
    // Split by lines, group consecutive li elements, then wrap them
    const lines = html.split('\n');
    const result = [];
    let inList = false;
    
    for (const line of lines) {
      if (line.startsWith('<li>')) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        result.push(line);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        result.push(line);
      }
    }
    if (inList) {
      result.push('</ul>');
    }
    
    return result.join('\n')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  const data = parseJSONCanvas(canvasData);
  
  // Validate nodes and edges
  const nodeIds = new Set(data.nodes.map(n => n.id));
  data.edges = data.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

  // Configuration - centralized constants for graph layout and appearance
  const config = {
    width: Math.max(600, window.innerWidth - 40),
    height: Math.max(600, window.innerHeight - 300),
    nodeRadius: 25,
    linkDistance: 180,
    chargeStrength: -400,
    labelOffset: 35,
    // Hierarchical layout settings
    hierarchicalLinkDistance: 120,
    hierarchicalChargeStrength: -500,
    hierarchicalXStrength: 0.1,
    hierarchicalYStrength: 0.5,
    hierarchicalYSpacing: 100
  };

  // Create SVG container
  const container = d3.select('#mechanics-graph-visualization');
  const svg = container.append('svg')
    .attr('width', config.width)
    .attr('height', config.height)
    .attr('viewBox', [0, 0, config.width, config.height]);

  // Add zoom behavior
  const g = svg.append('g');
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
  svg.call(zoom);

  // Create arrow markers for links with colors for different connection types
  const connectionColors = {
    'combo': '#e74c3c',
    'extends': '#3498db',
    'alternative': '#f39c12',
    'requires': '#2ecc71',
    'default': '#999'
  };

  svg.append('defs').selectAll('marker')
    .data(Object.keys(connectionColors))
    .join('marker')
    .attr('id', d => `arrow-${d}`)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 30)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('fill', d => connectionColors[d])
    .attr('d', 'M0,-5L10,0L0,5');

  // Create simulation
  let simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.edges)
      .id(d => d.id)
      .distance(config.linkDistance))
    .force('charge', d3.forceManyBody().strength(config.chargeStrength))
    .force('center', d3.forceCenter(config.width / 2, config.height / 2))
    .force('collision', d3.forceCollide().radius(config.nodeRadius * 2.5));

  // Create links with colored strokes based on connection type
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(data.edges)
    .join('line')
    .attr('stroke', d => connectionColors[d.label] || connectionColors.default)
    .attr('stroke-opacity', 0.7)
    .attr('stroke-width', 3)
    .attr('marker-end', d => `url(#arrow-${d.label || 'default'})`);

  // Create link labels
  const linkLabel = g.append('g')
    .attr('class', 'link-labels')
    .selectAll('text')
    .data(data.edges)
    .join('text')
    .attr('class', 'link-label')
    .attr('font-size', 11)
    .attr('fill', d => connectionColors[d.label] || connectionColors.default)
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .text(d => d.label);

  // Create node groups for mechanics
  const nodeGroup = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(data.nodes)
    .join('g')
    .attr('class', 'mechanic-node')
    .call(drag(simulation))
    .on('click', handleNodeClick)
    .on('mouseover', handleNodeMouseOver)
    .on('mouseout', handleNodeMouseOut);

  // Add circles to nodes
  nodeGroup.append('circle')
    .attr('r', config.nodeRadius)
    .attr('fill', d => d.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 4)
    .style('cursor', 'pointer')
    .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

  // Add icons/emojis to nodes
  const nodeIcons = {
    'wall_jump': '🧱',
    'double_jump': '⬆️',
    'air_dash': '💨',
    'ground_pound': '💥'
  };

  nodeGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('font-size', 16)
    .style('pointer-events', 'none')
    .text(d => nodeIcons[d.id] || '🎮');

  // Create labels
  const label = g.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(data.nodes)
    .join('text')
    .attr('class', 'node-label mechanic-label')
    .attr('text-anchor', 'middle')
    .attr('dy', config.labelOffset)
    .attr('font-size', 13)
    .attr('font-weight', 'bold')
    .attr('fill', '#333')
    .style('pointer-events', 'none')
    .text(d => d.label);

  // Tooltip
  const tooltip = container.append('div')
    .attr('class', 'graph-tooltip mechanics-tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.9)')
    .style('color', 'white')
    .style('padding', '12px')
    .style('border-radius', '8px')
    .style('pointer-events', 'none')
    .style('font-size', '14px')
    .style('max-width', '350px')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)');

  // Simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    linkLabel
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2 - 8);

    nodeGroup
      .attr('transform', d => `translate(${d.x},${d.y})`);

    label
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  });

  // Drag behavior
  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  // Event handlers
  function handleNodeClick(event, d) {
    showMechanicDetail(d);
  }

  function handleNodeMouseOver(event, d) {
    // Highlight node
    d3.select(this).select('circle')
      .transition()
      .duration(200)
      .attr('r', config.nodeRadius * 1.3)
      .attr('stroke-width', 5);

    // Show tooltip
    const tooltipContent = `
      <strong style="color: ${d.color};">${d.label}</strong><br/>
      <span style="opacity: 0.9;">${d.description}</span><br/>
      <em style="font-size: 12px; opacity: 0.7;">Click for details</em>
    `;
    
    tooltip
      .style('opacity', 1)
      .html(tooltipContent)
      .style('left', (event.pageX + 15) + 'px')
      .style('top', (event.pageY - 15) + 'px');

    // Highlight connected links
    link
      .style('stroke-opacity', l => 
        (l.source === d || l.target === d) ? 1 : 0.15
      )
      .style('stroke-width', l => 
        (l.source === d || l.target === d) ? 4 : 3
      );

    // Highlight connected nodes
    nodeGroup.selectAll('circle')
      .style('opacity', n => {
        const connected = data.edges.some(l => 
          (l.source === d && l.target === n) || 
          (l.target === d && l.source === n) ||
          n === d
        );
        return connected ? 1 : 0.3;
      });
  }

  function handleNodeMouseOut(event, d) {
    // Reset node
    d3.select(this).select('circle')
      .transition()
      .duration(200)
      .attr('r', config.nodeRadius)
      .attr('stroke-width', 4);

    // Hide tooltip
    tooltip.style('opacity', 0);

    // Reset links and nodes
    link
      .style('stroke-opacity', 0.7)
      .style('stroke-width', 3);
    
    nodeGroup.selectAll('circle').style('opacity', 1);
  }

  // Show mechanic detail panel
  function showMechanicDetail(mechanic) {
    const panel = document.getElementById('mechanic-detail-panel');
    const content = document.getElementById('mechanic-detail-content');
    
    // Build image HTML if available
    const imageHtml = mechanic.image ? `
      <div class="mechanic-visual">
        <img src="${mechanic.image}" alt="${mechanic.imageAlt || mechanic.label}" class="mechanic-gif" loading="lazy">
        <p class="image-caption">${mechanic.imageAlt || 'Visual demonstration'}</p>
      </div>
    ` : '';
    
    content.innerHTML = `
      <div class="mechanic-detail-header" style="border-left: 4px solid ${mechanic.color}; padding-left: 15px;">
        <h2>${mechanic.label}</h2>
      </div>
      ${imageHtml}
      <div class="mechanic-detail-body">
        ${parseMarkdown(mechanic.fullText)}
      </div>
      <div class="mechanic-connections">
        <h4>Connections</h4>
        ${getConnectionsHtml(mechanic)}
      </div>
      <div class="mechanic-instructions">
        <h4>📝 Create Your Own</h4>
        <p>Add your own mechanics by creating a <code>.canvas</code> file in <code>/content/mechanics/</code></p>
        <a href="#" onclick="showCanvasTemplate(); return false;" class="template-link">View Template →</a>
      </div>
    `;
    
    panel.classList.remove('hidden');
  }
  
  // Show canvas file template
  window.showCanvasTemplate = function() {
    const template = `{
  "nodes": [
    {
      "id": "your_mechanic_id",
      "type": "text",
      "x": 100,
      "y": 100,
      "width": 300,
      "height": 200,
      "text": "# Your Mechanic Name\\n\\n- **Description**: Brief description.\\n- **Use Case**: Where to use it.\\n- **Difficulty**: Easy/Medium/Hard\\n\\n## References\\n- [Example Link](https://example.com)",
      "color": "#3498db",
      "image": "https://your-gif-url.gif",
      "imageAlt": "Description of the animation"
    }
  ],
  "edges": [
    {
      "id": "edge_id",
      "fromNode": "your_mechanic_id",
      "toNode": "other_mechanic_id",
      "label": "combo"
    }
  ]
}`;
    alert('JSONCanvas Template:\n\n' + template);
  };
  
  function getConnectionsHtml(mechanic) {
    const connections = data.edges.filter(e => 
      e.source.id === mechanic.id || e.target.id === mechanic.id
    );
    
    if (connections.length === 0) {
      return '<p>No connections</p>';
    }
    
    return connections.map(c => {
      const otherNode = c.source.id === mechanic.id ? c.target : c.source;
      const direction = c.source.id === mechanic.id ? '→' : '←';
      const color = connectionColors[c.label] || connectionColors.default;
      return `<div class="connection-item">
        <span class="connection-type" style="background: ${color};">${c.label}</span>
        ${direction} ${otherNode.label}
      </div>`;
    }).join('');
  }

  // Close panel function (global)
  window.closeMechanicPanel = function() {
    document.getElementById('mechanic-detail-panel').classList.add('hidden');
  };

  // Control buttons
  document.getElementById('reset-zoom')?.addEventListener('click', () => {
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  });

  let labelsVisible = true;
  document.getElementById('toggle-labels')?.addEventListener('click', () => {
    labelsVisible = !labelsVisible;
    label.style('opacity', labelsVisible ? 1 : 0);
  });

  document.getElementById('layout-select')?.addEventListener('change', (e) => {
    const layout = e.target.value;
    
    simulation.stop();
    
    if (layout === 'hierarchical') {
      simulation
        .force('link', d3.forceLink(data.edges).id(d => d.id).distance(config.hierarchicalLinkDistance))
        .force('charge', d3.forceManyBody().strength(config.hierarchicalChargeStrength))
        .force('x', d3.forceX(config.width / 2).strength(config.hierarchicalXStrength))
        .force('y', d3.forceY().y((d, i) => {
          return config.hierarchicalYSpacing + i * config.hierarchicalYSpacing;
        }).strength(config.hierarchicalYStrength));
    } else if (layout === 'circular') {
      const angleStep = (2 * Math.PI) / data.nodes.length;
      const radius = Math.min(config.width, config.height) / 3;
      data.nodes.forEach((d, i) => {
        const angle = i * angleStep;
        d.fx = config.width / 2 + radius * Math.cos(angle);
        d.fy = config.height / 2 + radius * Math.sin(angle);
      });
    } else {
      // Reset to force layout
      data.nodes.forEach(d => {
        d.fx = null;
        d.fy = null;
      });
      simulation
        .force('link', d3.forceLink(data.edges).id(d => d.id).distance(config.linkDistance))
        .force('charge', d3.forceManyBody().strength(config.chargeStrength))
        .force('center', d3.forceCenter(config.width / 2, config.height / 2));
    }
    
    simulation.alpha(1).restart();
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    config.width = Math.max(600, window.innerWidth - 40);
    config.height = Math.max(600, window.innerHeight - 300);
    svg.attr('width', config.width).attr('height', config.height);
    svg.attr('viewBox', [0, 0, config.width, config.height]);
    simulation.force('center', d3.forceCenter(config.width / 2, config.height / 2));
    simulation.alpha(0.3).restart();
  });

  // Check for hash navigation to highlight specific mechanic
  if (window.location.hash) {
    const mechanicId = window.location.hash.substring(1);
    const mechanic = data.nodes.find(n => n.id === mechanicId);
    if (mechanic) {
      setTimeout(() => showMechanicDetail(mechanic), 500);
    }
  }

})();
