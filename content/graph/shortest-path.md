---
title: "Shortest Path Algorithms"
date: 2026-01-05
draft: false
---

# Shortest Path Algorithms

Shortest path algorithms find the path with the minimum total weight (or minimum number of edges) between vertices in a graph. These algorithms are fundamental to many real-world applications, from GPS navigation to network routing.

## Problem Types

### Single-Source Shortest Path

Find shortest paths from a single source vertex to all other vertices.

**Algorithms**: Dijkstra's, Bellman-Ford, BFS (for unweighted graphs)

### Single-Pair Shortest Path

Find the shortest path between two specific vertices.

**Approach**: Run single-source algorithm and stop when target is reached, or use bidirectional search.

### All-Pairs Shortest Path

Find shortest paths between all pairs of vertices.

**Algorithms**: Floyd-Warshall, Johnson's algorithm

## BFS for Unweighted Graphs

For **unweighted graphs**, BFS naturally finds the shortest path because it explores vertices level by level.

### Algorithm

```python
from collections import deque

def shortest_path_bfs(graph, start, goal):
    if start == goal:
        return [start]
    
    visited = {start}
    queue = deque([(start, [start])])
    
    while queue:
        vertex, path = queue.popleft()
        
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                new_path = path + [neighbor]
                
                if neighbor == goal:
                    return new_path
                
                visited.add(neighbor)
                queue.append((neighbor, new_path))
    
    return None  # No path exists
```

### Complexity

- **Time**: O(V + E)
- **Space**: O(V)

## Dijkstra's Algorithm

**Dijkstra's algorithm** finds the shortest path from a source vertex to all other vertices in a graph with **non-negative edge weights**.

### Algorithm Description

Dijkstra's algorithm uses a greedy approach:

1. Initialize distances to all vertices as infinity, except source (distance 0)
2. Use a priority queue (min-heap) to process vertices by minimum distance
3. For each vertex, update distances to its neighbors if a shorter path is found
4. Repeat until all vertices are processed

### Pseudocode

```
Dijkstra(graph, source):
    for each vertex v in graph:
        distance[v] = infinity
        previous[v] = null
    
    distance[source] = 0
    create priority queue Q with all vertices
    
    while Q is not empty:
        u = vertex in Q with minimum distance
        remove u from Q
        
        for each neighbor v of u:
            alt = distance[u] + weight(u, v)
            if alt < distance[v]:
                distance[v] = alt
                previous[v] = u
    
    return distance, previous
```

### Implementation

```python
import heapq

def dijkstra(graph, start):
    # graph is {vertex: [(neighbor, weight), ...]}
    distances = {vertex: float('infinity') for vertex in graph}
    distances[start] = 0
    previous = {vertex: None for vertex in graph}
    
    # Priority queue: (distance, vertex)
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_distance, current_vertex = heapq.heappop(pq)
        
        if current_vertex in visited:
            continue
        
        visited.add(current_vertex)
        
        for neighbor, weight in graph[current_vertex]:
            distance = current_distance + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_vertex
                heapq.heappush(pq, (distance, neighbor))
    
    return distances, previous

def reconstruct_path(previous, start, goal):
    path = []
    current = goal
    
    while current is not None:
        path.append(current)
        current = previous[current]
    
    path.reverse()
    return path if path[0] == start else None
```

### Complexity

- **Time**: O((V + E) log V) with binary heap
- **Time**: O(V²) with array implementation (better for dense graphs)
- **Time**: O(V + E) with Fibonacci heap (theoretical best)
- **Space**: O(V)

### Characteristics

- **Non-negative weights only**: Cannot handle negative edge weights
- **Greedy approach**: Makes locally optimal choice at each step
- **Optimal**: Finds the true shortest path
- **Single-source**: Computes shortest paths from one source to all vertices

### When to Use

- Graph has non-negative edge weights
- Need shortest path from one source to many destinations
- Graph is not too dense (E < V²)

## Bellman-Ford Algorithm

**Bellman-Ford algorithm** finds shortest paths from a source vertex to all other vertices, and can handle **negative edge weights**.

### Algorithm Description

The algorithm:

1. Initialize distances to all vertices as infinity, except source (distance 0)
2. Relax all edges V-1 times
3. Check for negative-weight cycles (one more iteration)

### Pseudocode

```
BellmanFord(graph, source):
    for each vertex v in graph:
        distance[v] = infinity
        previous[v] = null
    
    distance[source] = 0
    
    # Relax edges V-1 times
    for i from 1 to |V| - 1:
        for each edge (u, v) with weight w:
            if distance[u] + w < distance[v]:
                distance[v] = distance[u] + w
                previous[v] = u
    
    # Check for negative-weight cycles
    for each edge (u, v) with weight w:
        if distance[u] + w < distance[v]:
            return "Negative cycle detected"
    
    return distance, previous
```

### Implementation

```python
def bellman_ford(graph, source):
    # graph is {vertex: [(neighbor, weight), ...]}
    vertices = list(graph.keys())
    distances = {v: float('infinity') for v in vertices}
    distances[source] = 0
    previous = {v: None for v in vertices}
    
    # Relax edges |V| - 1 times
    for _ in range(len(vertices) - 1):
        for vertex in vertices:
            for neighbor, weight in graph[vertex]:
                if distances[vertex] + weight < distances[neighbor]:
                    distances[neighbor] = distances[vertex] + weight
                    previous[neighbor] = vertex
    
    # Check for negative cycles
    for vertex in vertices:
        for neighbor, weight in graph[vertex]:
            if distances[vertex] + weight < distances[neighbor]:
                raise ValueError("Graph contains negative-weight cycle")
    
    return distances, previous
```

### Complexity

- **Time**: O(V × E)
- **Space**: O(V)

### Characteristics

- **Handles negative weights**: Can work with negative edge weights
- **Detects negative cycles**: Can identify negative-weight cycles
- **Slower than Dijkstra**: O(V × E) vs O((V + E) log V)
- **Simple to implement**: Straightforward algorithm

### When to Use

- Graph contains negative edge weights
- Need to detect negative cycles
- Graph is small or moderately sized

## Floyd-Warshall Algorithm

**Floyd-Warshall** finds shortest paths between **all pairs** of vertices using dynamic programming.

### Algorithm Description

The algorithm considers all vertices as intermediate vertices and builds up the solution:

```
For k from 1 to n:
    For i from 1 to n:
        For j from 1 to n:
            If path from i to j through k is shorter:
                Update shortest path from i to j
```

### Pseudocode

```
FloydWarshall(graph):
    n = number of vertices
    distance = 2D array of size n × n
    
    # Initialize distances
    for i from 0 to n-1:
        for j from 0 to n-1:
            if i == j:
                distance[i][j] = 0
            else if edge(i, j) exists:
                distance[i][j] = weight(i, j)
            else:
                distance[i][j] = infinity
    
    # Find shortest paths
    for k from 0 to n-1:
        for i from 0 to n-1:
            for j from 0 to n-1:
                if distance[i][k] + distance[k][j] < distance[i][j]:
                    distance[i][j] = distance[i][k] + distance[k][j]
    
    return distance
```

### Implementation

```python
def floyd_warshall(graph):
    # graph as adjacency matrix
    n = len(graph)
    distance = [[float('infinity')] * n for _ in range(n)]
    
    # Initialize
    for i in range(n):
        distance[i][i] = 0
    
    for u in range(n):
        for v, weight in graph[u]:
            distance[u][v] = weight
    
    # Floyd-Warshall
    for k in range(n):
        for i in range(n):
            for j in range(n):
                distance[i][j] = min(distance[i][j], 
                                    distance[i][k] + distance[k][j])
    
    return distance
```

### Complexity

- **Time**: O(V³)
- **Space**: O(V²)

### Characteristics

- **All-pairs shortest paths**: Finds paths between all vertex pairs
- **Dense graphs**: Efficient for dense graphs
- **Simple implementation**: Easy to code and understand
- **Negative weights**: Can handle negative weights (but not negative cycles)

### When to Use

- Need shortest paths between all pairs of vertices
- Graph is small to medium sized (V ≤ a few hundred)
- Graph is dense

## A* Search Algorithm

**A*** is an informed search algorithm that uses heuristics to find the shortest path more efficiently than Dijkstra's.

### Algorithm Description

A* extends Dijkstra's algorithm by using a heuristic function h(n) that estimates the cost from vertex n to the goal:

```
f(n) = g(n) + h(n)
```

Where:
- **g(n)**: Actual cost from start to n
- **h(n)**: Estimated cost from n to goal (heuristic)
- **f(n)**: Estimated total cost through n

### Properties of Heuristic

- **Admissible**: Never overestimates the actual cost (h(n) ≤ actual cost)
- **Consistent**: h(n) ≤ cost(n, n') + h(n') for all neighbors n'

### Common Heuristics

1. **Manhattan Distance**: |x₁ - x₂| + |y₁ - y₂| (grid, no diagonal)
2. **Euclidean Distance**: √((x₁ - x₂)² + (y₁ - y₂)²) (any movement)
3. **Chebyshev Distance**: max(|x₁ - x₂|, |y₁ - y₂|) (grid, diagonal)

### Implementation

```python
import heapq

def a_star(graph, start, goal, heuristic):
    # Priority queue: (f_score, g_score, vertex)
    pq = [(heuristic(start, goal), 0, start)]
    came_from = {start: None}
    g_score = {start: 0}
    
    while pq:
        _, current_g, current = heapq.heappop(pq)
        
        if current == goal:
            return reconstruct_path(came_from, start, goal)
        
        for neighbor, weight in graph[current]:
            tentative_g = current_g + weight
            
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor, goal)
                heapq.heappush(pq, (f_score, tentative_g, neighbor))
                came_from[neighbor] = current
    
    return None  # No path found
```

### Complexity

- **Time**: O(E) in best case, O(b^d) in worst case (b = branching factor, d = depth)
- **Space**: O(V)

### When to Use

- Have a good heuristic function
- Need to find path to a specific goal quickly
- Working with spatial graphs (maps, grids)

## Algorithm Comparison

| Algorithm | Graph Type | Time Complexity | Space | Negative Weights | All-Pairs |
|-----------|------------|-----------------|-------|------------------|-----------|
| **BFS** | Unweighted | O(V + E) | O(V) | N/A | No |
| **Dijkstra** | Non-negative weights | O((V+E) log V) | O(V) | No | No |
| **Bellman-Ford** | Any weights | O(V × E) | O(V) | Yes | No |
| **Floyd-Warshall** | Any weights | O(V³) | O(V²) | Yes | Yes |
| **A*** | Non-negative weights | Variable | O(V) | No | No |

## Choosing the Right Algorithm

**Use BFS when**:
- Graph is unweighted
- Need simplest solution

**Use Dijkstra when**:
- All edge weights are non-negative
- Need efficient single-source solution

**Use Bellman-Ford when**:
- Graph has negative edge weights
- Need to detect negative cycles

**Use Floyd-Warshall when**:
- Need all-pairs shortest paths
- Graph is small to medium size

**Use A* when**:
- Have a good heuristic
- Need to reach a specific goal quickly

## Next Steps

- Explore [Applications]({{< ref "applications" >}}) to see these algorithms in real-world scenarios
- Return to [Graph Algorithms]({{< ref "/graph" >}}) main page

---

*Shortest path algorithms are among the most practical and widely-used graph algorithms, powering everything from GPS navigation to internet routing.*
