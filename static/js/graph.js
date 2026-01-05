// D3.js Graph Visualization for Awesome List Categories
(function() {
  'use strict';

  // Wait for DOM and data to be ready
  if (typeof window.graphData === 'undefined') {
    console.error('Graph data not loaded');
    return;
  }

  const data = window.graphData;
  
  // Remove trailing commas from nodes and edges arrays
  data.nodes = data.nodes.filter(n => n && n.id);
  data.edges = data.edges.filter(e => e && e.source && e.target);

  // Configuration
  const config = {
    width: window.innerWidth - 40,
    height: Math.max(600, window.innerHeight - 300),
    nodeRadius: 20,
    linkDistance: 150,
    chargeStrength: -300,
    labelOffset: 25
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
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
  svg.call(zoom);

  // Create arrow markers for links
  svg.append('defs').selectAll('marker')
    .data(['arrow'])
    .join('marker')
    .attr('id', d => d)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('fill', '#999')
    .attr('d', 'M0,-5L10,0L0,5');

  // Create simulation
  let simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.edges)
      .id(d => d.id)
      .distance(config.linkDistance))
    .force('charge', d3.forceManyBody().strength(config.chargeStrength))
    .force('center', d3.forceCenter(config.width / 2, config.height / 2))
    .force('collision', d3.forceCollide().radius(config.nodeRadius * 2));

  // Create links
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(data.edges)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrow)');

  // Create link labels
  const linkLabel = g.append('g')
    .attr('class', 'link-labels')
    .selectAll('text')
    .data(data.edges)
    .join('text')
    .attr('class', 'link-label')
    .attr('font-size', 10)
    .attr('fill', '#666')
    .attr('text-anchor', 'middle')
    .text(d => d.label || '');

  // Create nodes
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(data.nodes)
    .join('circle')
    .attr('r', config.nodeRadius)
    .attr('fill', d => d.color || '#95a5a6')
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .style('cursor', 'pointer')
    .call(drag(simulation))
    .on('click', handleNodeClick)
    .on('mouseover', handleNodeMouseOver)
    .on('mouseout', handleNodeMouseOut);

  // Create labels
  const label = g.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(data.nodes)
    .join('text')
    .attr('class', 'node-label')
    .attr('text-anchor', 'middle')
    .attr('dy', config.labelOffset)
    .attr('font-size', 12)
    .attr('font-weight', 'bold')
    .attr('fill', '#333')
    .style('pointer-events', 'none')
    .text(d => d.label);

  // Tooltip
  const tooltip = container.append('div')
    .attr('class', 'graph-tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '10px')
    .style('border-radius', '5px')
    .style('pointer-events', 'none')
    .style('font-size', '14px')
    .style('max-width', '300px');

  // Simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    linkLabel
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

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
    if (d.url) {
      window.location.href = d.url;
    }
  }

  function handleNodeMouseOver(event, d) {
    // Highlight node
    d3.select(this)
      .transition()
      .duration(200)
      .attr('r', config.nodeRadius * 1.5)
      .attr('stroke-width', 5);

    // Show tooltip
    const tooltipContent = `
      <strong>${d.label}</strong><br/>
      ${d.description || ''}<br/>
      ${d.tags && d.tags.length ? '<br/><em>Tags: ' + d.tags.join(', ') + '</em>' : ''}
    `;
    
    tooltip
      .style('opacity', 1)
      .html(tooltipContent)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px');

    // Highlight connected links
    link
      .style('stroke-opacity', l => 
        (l.source === d || l.target === d) ? 1 : 0.1
      )
      .style('stroke-width', l => 
        (l.source === d || l.target === d) ? 3 : 2
      );

    // Highlight connected nodes
    node
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
    d3.select(this)
      .transition()
      .duration(200)
      .attr('r', config.nodeRadius)
      .attr('stroke-width', 3);

    // Hide tooltip
    tooltip.style('opacity', 0);

    // Reset links and nodes
    link
      .style('stroke-opacity', 0.6)
      .style('stroke-width', 2);
    
    node.style('opacity', 1);
  }

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
        .force('link', d3.forceLink(data.edges).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('x', d3.forceX(config.width / 2).strength(0.1))
        .force('y', d3.forceY().y(d => {
          // Simple hierarchical layout
          const level = d.parent ? 200 : 100;
          return level;
        }).strength(0.5));
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
    config.width = window.innerWidth - 40;
    config.height = Math.max(600, window.innerHeight - 300);
    svg.attr('width', config.width).attr('height', config.height);
    svg.attr('viewBox', [0, 0, config.width, config.height]);
    simulation.force('center', d3.forceCenter(config.width / 2, config.height / 2));
    simulation.alpha(0.3).restart();
  });

})();
