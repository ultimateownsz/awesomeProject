// Combined Graph Visualization - Categories + JSONCanvas Mechanics
// D3.js Graph Visualization integrating both Hugo categories and JSONCanvas mechanics data
(function() {
  'use strict';

  // Check for required data
  if (typeof window.graphData === 'undefined') {
    console.error('Graph data not loaded');
    return;
  }

  const categoryData = window.graphData;
  const mechanicsData = window.mechanicsCanvasData || { nodes: [], edges: [] };

  // Parse JSONCanvas mechanics to graph format
  function parseMechanicsToGraph(canvasData) {
    const nodes = canvasData.nodes.map(node => ({
      id: node.id,
      label: extractTitle(node.text),
      description: extractDescription(node.text),
      fullText: node.text,
      color: node.color || '#95a5a6',
      nodeType: 'mechanic',
      image: node.image || null,
      imageAlt: node.imageAlt || '',
      url: '/mechanics-graph#' + node.id
    }));

    const edges = canvasData.edges.map(edge => ({
      source: edge.fromNode,
      target: edge.toNode,
      label: edge.label || '',
      edgeType: 'mechanic'
    }));

    return { nodes, edges };
  }

  // Extract title from markdown text
  function extractTitle(text) {
    const match = text.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }

  // Extract description from markdown text
  function extractDescription(text) {
    const descMatch = text.match(/\*\*Description\*\*:\s*(.+?)(?:\n|$)/);
    return descMatch ? descMatch[1].trim() : '';
  }

  // Parse markdown to HTML
  function parseMarkdown(text) {
    let html = text
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

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

  // Sanitize URL
  function sanitizeUrl(url) {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return url;
      }
    } catch (e) {}
    return '';
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Convert mechanics data
  const mechanicsGraph = parseMechanicsToGraph(mechanicsData);

  // Clean category data
  categoryData.nodes = categoryData.nodes.filter(n => n && n.id).map(n => {
    if (typeof n.tags === 'string') {
      try { n.tags = JSON.parse(n.tags); } catch (e) { n.tags = []; }
    }
    if (!Array.isArray(n.tags)) n.tags = [];
    n.nodeType = n.nodeType || 'category';
    return n;
  });

  // Combine data
  const allNodes = [...categoryData.nodes, ...mechanicsGraph.nodes];
  const allEdges = [...categoryData.edges, ...mechanicsGraph.edges];

  // Filter invalid edges
  const nodeIds = new Set(allNodes.map(n => n.id));
  const validEdges = allEdges
    .filter(e => e && e.source && e.target)
    .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

  // Working data
  let data = {
    nodes: [...allNodes],
    edges: [...validEdges]
  };

  // Current filter
  let currentFilter = 'all';

  // Configuration
  const config = {
    width: Math.max(600, window.innerWidth - 40),
    height: Math.max(600, window.innerHeight - 300),
    nodeRadius: 22,
    linkDistance: 160,
    chargeStrength: -350,
    labelOffset: 28,
    hierarchicalLinkDistance: 120,
    hierarchicalChargeStrength: -500,
    hierarchicalXStrength: 0.1,
    hierarchicalYStrength: 0.5,
    hierarchicalYSpacing: 100
  };

  // Connection colors for mechanics
  const connectionColors = {
    'combo': '#e74c3c',
    'extends': '#3498db',
    'alternative': '#f39c12',
    'requires': '#2ecc71',
    'default': '#999'
  };

  // Create SVG container
  const container = d3.select('#graph-visualization');
  const svg = container.append('svg')
    .attr('width', config.width)
    .attr('height', config.height)
    .attr('viewBox', [0, 0, config.width, config.height]);

  // Add zoom behavior
  const g = svg.append('g');
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => g.attr('transform', event.transform));
  svg.call(zoom);

  // Create arrow markers
  const markerTypes = ['arrow', ...Object.keys(connectionColors)];
  svg.append('defs').selectAll('marker')
    .data(markerTypes)
    .join('marker')
    .attr('id', d => `arrow-${d}`)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 28)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('fill', d => connectionColors[d] || '#999')
    .attr('d', 'M0,-5L10,0L0,5');

  // Create simulation
  let simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.edges).id(d => d.id).distance(config.linkDistance))
    .force('charge', d3.forceManyBody().strength(config.chargeStrength))
    .force('center', d3.forceCenter(config.width / 2, config.height / 2))
    .force('collision', d3.forceCollide().radius(config.nodeRadius * 2.5));

  // Create links
  let link = g.append('g').attr('class', 'links').selectAll('line');

  // Create link labels
  let linkLabel = g.append('g').attr('class', 'link-labels').selectAll('text');

  // Create node groups
  let nodeGroup = g.append('g').attr('class', 'nodes').selectAll('g');

  // Create labels
  let label = g.append('g').attr('class', 'labels').selectAll('text');

  // Tooltip
  const tooltip = container.append('div')
    .attr('class', 'graph-tooltip')
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

  // Update visualization
  function updateGraph() {
    // Filter data
    let filteredNodes, filteredEdges;
    if (currentFilter === 'categories') {
      filteredNodes = allNodes.filter(n => n.nodeType === 'category');
    } else if (currentFilter === 'mechanics') {
      filteredNodes = allNodes.filter(n => n.nodeType === 'mechanic');
    } else {
      filteredNodes = [...allNodes];
    }

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    filteredEdges = validEdges.filter(e => 
      filteredNodeIds.has(e.source.id || e.source) && 
      filteredNodeIds.has(e.target.id || e.target)
    );

    data.nodes = filteredNodes;
    data.edges = filteredEdges;

    // Update simulation
    simulation.nodes(data.nodes);
    simulation.force('link').links(data.edges);

    // Update links
    link = link.data(data.edges, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
    link.exit().remove();
    link = link.enter().append('line')
      .attr('stroke', d => connectionColors[d.label] || '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => d.edgeType === 'mechanic' ? 3 : 2)
      .attr('marker-end', d => `url(#arrow-${d.label || 'arrow'})`)
      .merge(link);

    // Update link labels
    linkLabel = linkLabel.data(data.edges, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
    linkLabel.exit().remove();
    linkLabel = linkLabel.enter().append('text')
      .attr('class', 'link-label')
      .attr('font-size', 11)
      .attr('fill', d => connectionColors[d.label] || '#666')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text(d => d.label || '')
      .merge(linkLabel);

    // Update nodes
    nodeGroup = nodeGroup.data(data.nodes, d => d.id);
    nodeGroup.exit().remove();
    const nodeEnter = nodeGroup.enter().append('g')
      .attr('class', d => `node-group ${d.nodeType}-node`)
      .call(drag(simulation))
      .on('click', handleNodeClick)
      .on('mouseover', handleNodeMouseOver)
      .on('mouseout', handleNodeMouseOut);

    nodeEnter.append('circle')
      .attr('r', config.nodeRadius)
      .attr('fill', d => d.color || '#95a5a6')
      .attr('stroke', '#fff')
      .attr('stroke-width', d => d.nodeType === 'mechanic' ? 4 : 3)
      .style('cursor', 'pointer')
      .style('filter', d => d.nodeType === 'mechanic' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none');

    // Add icons for mechanics
    nodeEnter.filter(d => d.nodeType === 'mechanic')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 14)
      .style('pointer-events', 'none')
      .text(d => {
        const icons = { 'wall_jump': '🧱', 'double_jump': '⬆️', 'air_dash': '💨', 'ground_pound': '💥' };
        return icons[d.id] || '🎮';
      });

    nodeGroup = nodeEnter.merge(nodeGroup);

    // Update labels
    label = label.data(data.nodes, d => d.id);
    label.exit().remove();
    label = label.enter().append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', config.labelOffset)
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .style('pointer-events', 'none')
      .text(d => d.label)
      .merge(label);

    simulation.alpha(1).restart();
  }

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

    nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);

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
    if (d.nodeType === 'mechanic') {
      showMechanicDetail(d);
    } else if (d.url) {
      window.location.href = d.url;
    }
  }

  function handleNodeMouseOver(event, d) {
    d3.select(this).select('circle')
      .transition().duration(200)
      .attr('r', config.nodeRadius * 1.3)
      .attr('stroke-width', 5);

    const typeLabel = d.nodeType === 'mechanic' ? '🎮 Mechanic' : '📂 Category';
    const tooltipContent = `
      <strong style="color: ${d.color};">${d.label}</strong>
      <span style="opacity: 0.7; font-size: 11px;"> (${typeLabel})</span><br/>
      <span style="opacity: 0.9;">${d.description || ''}</span><br/>
      ${d.tags && d.tags.length ? '<em style="font-size: 12px; opacity: 0.7;">Tags: ' + d.tags.join(', ') + '</em>' : ''}
      <em style="font-size: 12px; opacity: 0.7;">Click for ${d.nodeType === 'mechanic' ? 'details' : 'page'}</em>
    `;

    tooltip
      .style('opacity', 1)
      .html(tooltipContent)
      .style('left', (event.pageX + 15) + 'px')
      .style('top', (event.pageY - 15) + 'px');

    link.style('stroke-opacity', l => 
      (l.source === d || l.target === d) ? 1 : 0.1
    );

    nodeGroup.selectAll('circle').style('opacity', n => {
      const connected = data.edges.some(l => 
        (l.source === d && l.target === n) || 
        (l.target === d && l.source === n) || n === d
      );
      return connected ? 1 : 0.3;
    });
  }

  function handleNodeMouseOut(event, d) {
    d3.select(this).select('circle')
      .transition().duration(200)
      .attr('r', config.nodeRadius)
      .attr('stroke-width', d.nodeType === 'mechanic' ? 4 : 3);

    tooltip.style('opacity', 0);
    link.style('stroke-opacity', 0.6);
    nodeGroup.selectAll('circle').style('opacity', 1);
  }

  // Show mechanic detail panel
  function showMechanicDetail(mechanic) {
    const panel = document.getElementById('mechanic-detail-panel');
    const content = document.getElementById('mechanic-detail-content');
    if (!panel || !content) return;

    const safeImageUrl = sanitizeUrl(mechanic.image);
    const imageHtml = safeImageUrl ? `
      <div class="mechanic-visual">
        <img src="${safeImageUrl}" alt="${escapeHtml(mechanic.imageAlt || mechanic.label)}" class="mechanic-gif" loading="lazy">
        <p class="image-caption">${escapeHtml(mechanic.imageAlt || 'Visual demonstration')}</p>
      </div>
    ` : '';

    content.innerHTML = `
      <div class="mechanic-detail-header" style="border-left: 4px solid ${mechanic.color}; padding-left: 15px;">
        <h2>${escapeHtml(mechanic.label)}</h2>
      </div>
      ${imageHtml}
      <div class="mechanic-detail-body">
        ${parseMarkdown(mechanic.fullText || '')}
      </div>
      <div class="mechanic-connections">
        <h4>Connections</h4>
        ${getConnectionsHtml(mechanic)}
      </div>
    `;

    panel.classList.remove('hidden');
  }

  function getConnectionsHtml(mechanic) {
    const connections = data.edges.filter(e => 
      (e.source.id || e.source) === mechanic.id || (e.target.id || e.target) === mechanic.id
    );

    if (connections.length === 0) return '<p>No connections</p>';

    return connections.map(c => {
      const sourceId = c.source.id || c.source;
      const targetId = c.target.id || c.target;
      const otherNodeId = sourceId === mechanic.id ? targetId : sourceId;
      const otherNode = data.nodes.find(n => n.id === otherNodeId);
      const direction = sourceId === mechanic.id ? '→' : '←';
      const color = connectionColors[c.label] || connectionColors.default;
      return `<div class="connection-item">
        <span class="connection-type" style="background: ${color};">${c.label || 'related'}</span>
        ${direction} ${otherNode ? otherNode.label : otherNodeId}
      </div>`;
    }).join('');
  }

  // Close panel
  window.closeMechanicPanel = function() {
    const panel = document.getElementById('mechanic-detail-panel');
    if (panel) panel.classList.add('hidden');
  };

  // Control buttons
  document.getElementById('reset-zoom')?.addEventListener('click', () => {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
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
        .force('y', d3.forceY().y((d, i) => config.hierarchicalYSpacing + i * config.hierarchicalYSpacing).strength(config.hierarchicalYStrength));
    } else if (layout === 'circular') {
      const angleStep = (2 * Math.PI) / data.nodes.length;
      const radius = Math.min(config.width, config.height) / 3;
      data.nodes.forEach((d, i) => {
        const angle = i * angleStep;
        d.fx = config.width / 2 + radius * Math.cos(angle);
        d.fy = config.height / 2 + radius * Math.sin(angle);
      });
    } else {
      data.nodes.forEach(d => { d.fx = null; d.fy = null; });
      simulation
        .force('link', d3.forceLink(data.edges).id(d => d.id).distance(config.linkDistance))
        .force('charge', d3.forceManyBody().strength(config.chargeStrength))
        .force('center', d3.forceCenter(config.width / 2, config.height / 2));
    }

    simulation.alpha(1).restart();
  });

  // Filter select
  document.getElementById('filter-select')?.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    // Reset positions
    allNodes.forEach(d => { d.fx = null; d.fy = null; d.x = undefined; d.y = undefined; });
    updateGraph();
  });

  // Window resize
  window.addEventListener('resize', () => {
    config.width = Math.max(600, window.innerWidth - 40);
    config.height = Math.max(600, window.innerHeight - 300);
    svg.attr('width', config.width).attr('height', config.height);
    svg.attr('viewBox', [0, 0, config.width, config.height]);
    simulation.force('center', d3.forceCenter(config.width / 2, config.height / 2));
    simulation.alpha(0.3).restart();
  });

  // Initial render
  updateGraph();

})();
